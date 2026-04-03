import React, { useMemo, useState, useEffect } from "react";
import { esc, escRe, stem, dlText } from "../lib/utils";
import { Tip, SCard } from "./DocLensUI";
import { Emoji } from "./Icons";

export function TView({ text, searchQ }: any) {
  const html = useMemo(() => {
    const e = esc(text || "");
    if (!searchQ || searchQ.length < 2) return e;
    return e.replace(new RegExp(escRe(esc(searchQ)), "gi"), (m: string) => `<mark style="background:rgba(255,215,60,.42);border-radius:2px;padding:0 2px">${m}</mark>`);
  }, [text, searchQ]);
  return <div className="flex-1 overflow-y-auto py-5 px-4 md:py-7 md:px-8 font-mono text-[11.5px] md:text-[12.5px] leading-loose text-ink3 whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function StatsView({ stats }: any) {
  if (!stats) return null;
  const { wordCount, charCount, sentenceCount, readingTime, topWords } = stats;
  const max = topWords[0]?.[1] || 1;
  const cards = [
    { v: wordCount.toLocaleString(), l: "words", i: "📝", t: "Total word count" },
    { v: charCount.toLocaleString(), l: "characters", i: "🔤", t: "Total character count" },
    { v: sentenceCount.toLocaleString(), l: "sentences", i: "📖", t: "Detected sentence count" },
    { v: `~${readingTime}`, l: "min to read", i: "⏱", t: "At 200 words per minute" },
    { v: Math.round(wordCount / Math.max(sentenceCount, 1)), l: "words/sentence", i: "📏", t: "Average sentence length" }
  ];
  return (
    <div className="flex-1 overflow-y-auto py-5 px-4 md:py-7 md:px-8">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-[14px] mb-[28px]">
        {cards.map(({ v, l, i, t }, idx) => (
          <Tip key={l} tip={t}>
            <div className={`bg-paper2 border-2 border-[rgba(60,35,10,.28)] py-[18px] px-[16px] cursor-default shadow-[2px_2px_0_rgba(30,15,5,.08)] rounded-[${3+idx}px_${8+idx}px_${4+idx}px_${7+idx}px]`} style={{ transform: `rotate(${idx % 2 === 0 ? 0.35 : -0.3}deg)` }}>
              <div className="font-caveat text-[30px] font-bold text-amber2 leading-none flex items-center gap-[8px]">
                <Emoji symbol={i} size={28} className="translate-y-[-2px]" />{v}
              </div>
              <div className="font-patrick text-[13px] text-ink3 mt-[6px]">{l}</div>
            </div>
          </Tip>
        ))}
      </div>
      <div className="font-caveat text-[18px] font-bold text-ink2 mb-[14px] flex items-center gap-[8px]">
        <Emoji symbol="🏆" size={24} className="text-amber" /> Most frequent words
        <div className="flex-1 border-t-[1.5px] border-dashed border-[rgba(100,70,40,.2)] ml-[8px]" />
      </div>
      <div className="flex flex-col gap-[9px]">
        {topWords.map(([word, count]: any, idx: number) => (
          <Tip key={word} tip={`"${word}" appears ${count} time${count > 1 ? "s" : ""}`} side="right">
            <div className="flex items-center gap-[12px] cursor-default">
              <span className="font-caveat text-[12px] text-ink4 min-w-[18px] text-right">{idx + 1}</span>
              <span className="font-mono text-[12.5px] font-medium min-w-[112px] text-ink2">{word}</span>
              <div className="flex-1 h-[6px] bg-paper3 rounded-[2px_6px_2px_5px] overflow-hidden border border-[rgba(100,70,40,.15)]">
                <div className="h-full bg-gradient-to-r from-amber2 to-amber rounded-[2px_6px] transition-[width] duration-800 ease-[cubic-bezier(.4,0,.2,1)]" style={{ width: `${Math.round(count / max * 100)}%` }} />
              </div>
              <span className="font-caveat text-[13px] text-ink4 min-w-[24px] text-right">{count}</span>
            </div>
          </Tip>
        ))}
      </div>
    </div>
  );
}

export function SearchView({ text }: any) {
  const [q, setQ] = useState("");
  const [matches, setMatches] = useState<any[]>([]);
  const [cur, setCur] = useState(0);

  useEffect(() => {
    if (!q || q.length < 2) { setMatches([]); return; }
    const re = new RegExp(escRe(q), "gi");
    setMatches(text.split("\n").filter((l: string) => l.trim()).filter((l: string) => { const r = re.test(l); re.lastIndex = 0; return r; }).map((t: string) => ({ t })));
    setCur(0);
  }, [q, text]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="py-[16px] px-[26px] border-b-[1.5px] border-dashed border-[rgba(100,70,40,.2)] flex gap-[10px] items-center bg-[rgba(237,229,208,.5)]">
        <div className="flex-1 flex items-center gap-[10px] bg-paper border-2 border-[rgba(100,70,40,.32)] rounded-[3px_10px_4px_9px] px-[14px] py-[9px]">
          <Emoji symbol="🔍" size={18} className="text-ink4" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="What are you looking for?" className="flex-1 bg-transparent border-none outline-none text-ink font-patrick text-[14px]" />
        </div>
        {matches.length > 0 && <span className="font-caveat text-[15px] text-ink4 whitespace-nowrap">{cur + 1} / {matches.length}</span>}
        {["↑", "↓"].map((d, i) => (
          <Tip key={d} tip={i === 0 ? "Previous result" : "Next result"}>
            <button onClick={() => setCur(c => (c + (i ? 1 : -1) + matches.length) % matches.length)} disabled={!matches.length}
              className={`w-[34px] h-[34px] bg-paper hover:bg-paper2 border-2 border-[rgba(100,70,40,.32)] rounded-[${3+i}px_${8+i}px_${4+i}px_${7+i}px] flex items-center justify-center font-inherit transition-all duration-150 text-ink3 text-[15px] ${matches.length ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-[0.4]"}`}>
              {d}
            </button>
          </Tip>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto py-[16px] px-[26px] flex flex-col gap-[10px]">
        {!q || q.length < 2 ? <div className="text-center text-ink4 font-caveat italic text-[22px] mt-[60px] -rotate-[0.5deg]">Start typing to search…</div>
         : matches.length === 0 ? <div className="text-center text-red font-caveat text-[20px] mt-[60px] flex items-center justify-center gap-2"><Emoji symbol="✕" size={20} /> Nothing found for "{q}"</div>
         : matches.map((m, i) => (
          <div key={i} onClick={() => setCur(i)} className={`border-[1.5px] rounded-[3px_10px_4px_9px] py-[12px] px-[15px] cursor-pointer transition-all duration-150 ${i === cur ? "bg-[rgba(192,120,24,.08)] border-amber rotate-0" : "bg-paper2 border-[rgba(100,70,40,.22)] rotate-[0.15deg]"}`}>
            <div className="font-caveat text-[12px] text-ink4 mb-[4px]">Result {i + 1}</div>
            <div className="font-patrick text-[13px] leading-[1.65] text-ink2" dangerouslySetInnerHTML={{ __html: esc(m.t).replace(new RegExp(escRe(esc(q)), "gi"), (t: string) => `<mark style="background:rgba(255,210,55,.42);border-radius:2px;padding:0 2px">${t}</mark>`) }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExportView({ doc }: any) {
  const items = [
    { ico: "📄", title: "Plain Text", ext: ".txt", desc: "Raw text, no formatting", col: "rgba(60,30,10,.1)", tip: "Save the extracted text as a .txt file", fn: () => dlText(stem(doc.name) + ".txt", doc.text) },
    { ico: "📑", title: "Markdown", ext: ".md", desc: "Headings and structure preserved", col: "rgba(26,92,92,.08)", tip: "Export with Markdown heading syntax", fn: () => dlText(stem(doc.name) + ".md", doc.text.split("\n").map((l: string) => l.trim().length > 60 ? l : (l.trim() ? "## " + l.trim() : "")).join("\n")) },
    { ico: "📊", title: "Analysis Report", ext: ".txt", desc: "Stats, word counts, top words", col: "rgba(192,120,24,.08)", tip: "Full statistical breakdown of your document", fn: () => { const s = doc.stats; dlText(stem(doc.name) + "_report.txt", `Analysis\n========\nFile: ${doc.name}\nWords: ${s.wordCount}\nChars: ${s.charCount}\nSentences: ${s.sentenceCount}\nRead: ~${s.readingTime}min\n\nTop Words\n---------\n${s.topWords.map(([w, c]: any, i: number) => `${i + 1}. ${w}: ${c}`).join("\n")}`) } },
    { ico: "🔤", title: "CSV Word Frequency", ext: ".csv", desc: "Word counts as a spreadsheet", col: "rgba(26,70,26,.08)", tip: "Open in Excel or Google Sheets to chart frequencies", fn: () => dlText(stem(doc.name) + "_freq.csv", "Word,Count\n" + doc.stats.topWords.map(([w, c]: any) => `"${w}",${c}`).join("\n")) },
  ];
  return (
    <div className="flex-1 overflow-y-auto py-[28px] px-[32px] flex flex-col gap-[14px]">
      <div className="font-caveat text-[26px] font-bold text-ink2 mb-[4px] -rotate-[0.4deg] flex items-center gap-2">Save your work <Emoji symbol="✍️" size={24} /></div>
      {items.map((e, i) => (
        <SCard key={e.title} rotate={i % 2 === 0 ? 0.2 : -0.2}>
          <div className="flex items-center gap-[15px]">
            <div className="flex-shrink-0"><Emoji symbol={e.ico} size={36} /></div>
            <div className="flex-1">
              <div className="font-caveat text-[18px] font-bold text-ink2 mb-[2px]">
                {e.title} <span className="font-mono text-[11px] text-ink4 bg-paper2 py-[1px] px-[5px] rounded-[4px]">{e.ext}</span>
              </div>
              <div className="font-patrick text-[13px] text-ink3">{e.desc}</div>
            </div>
            <Tip tip={e.tip} side="left">
              <button onClick={e.fn} className="py-[9px] px-[18px] bg-amber hover:bg-amber2 border-2 border-amber2 rounded-[3px_10px_4px_9px] font-caveat text-[16px] font-bold text-white cursor-pointer transition-all duration-150 flex-shrink-0 shadow-[2px_2px_0_rgba(30,15,5,.15)] hover:shadow-[3px_3px_0_rgba(30,15,5,.18)] hover:-translate-x-[1px] hover:-translate-y-[1px]">Export</button>
            </Tip>
          </div>
        </SCard>
      ))}
    </div>
  );
}
