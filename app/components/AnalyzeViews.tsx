import React, { useMemo, useState } from "react";
import { dlText, esc, escRe, stem } from "../lib/utils";
import { HBtn, HInput, SCard, Tip } from "./DocLensUI";
import { UIcon } from "./Icons";

type StatsShape = {
  wordCount: number;
  charCount: number;
  sentenceCount: number;
  readingTime: number;
  topWords: Array<[string, number]>;
};

type DocShape = {
  name: string;
  text: string | null;
  stats: StatsShape | null;
};

export function TView({
  text,
  searchQ,
}: {
  text: string;
  searchQ?: string;
}) {
  const html = useMemo(() => {
    const safe = esc(text || "");
    const withHighlights =
      searchQ && searchQ.length >= 2
        ? safe.replace(
            new RegExp(escRe(esc(searchQ)), "gi"),
            (match: string) =>
              `<mark class="rounded-md bg-[#10b981]/20 px-1 py-0.5 text-white">${match}</mark>`
          )
        : safe;

    return withHighlights.replace(/\n/g, "<br />");
  }, [searchQ, text]);

  const lines = useMemo(
    () => text.split(/\n/).filter((line) => line.trim().length > 0).length,
    [text]
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-white/[0.04] bg-white/[0.02] px-5 py-3 md:px-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="vintage-badge text-[10px]">
            <UIcon name="ScanText" size={11} />
            Extracted text
          </span>
          <span className="vintage-badge text-[10px]">
            <UIcon name="Rows3" size={11} />
            {lines.toLocaleString()} lines
          </span>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-7">
        <div className="vintage-card min-h-full p-0">
          <div
            className="px-5 py-5 font-mono text-[12px] leading-7 text-[#9294a5] md:px-6"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}

export function StatsView({ stats }: { stats: StatsShape | null }) {
  if (!stats) return null;

  const { wordCount, charCount, sentenceCount, readingTime, topWords } = stats;
  const longestBar = topWords[0]?.[1] || 1;
  const cards = [
    { value: wordCount.toLocaleString(), label: "Words", icon: "FileText" as const },
    { value: charCount.toLocaleString(), label: "Characters", icon: "Type" as const },
    { value: sentenceCount.toLocaleString(), label: "Sentences", icon: "BookText" as const },
    { value: `~${readingTime} min`, label: "Read time", icon: "Clock3" as const },
    {
      value: Math.max(1, Math.round(wordCount / Math.max(sentenceCount, 1))).toString(),
      label: "Words/sentence",
      icon: "Ruler" as const,
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto px-5 py-5 md:px-7">
      <div className="grid gap-3 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="vintage-card p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6d80]">
                {card.label}
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-[#9294a5]">
                <UIcon name={card.icon} size={14} />
              </div>
            </div>
            <div className="mt-3 font-display text-2xl font-bold text-white">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
        <SCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-[#9294a5]">
              <UIcon name="BarChart3" size={15} />
            </div>
            <div className="font-display text-[15px] font-bold text-white">Top terms</div>
          </div>
          <div className="flex flex-col gap-3">
            {topWords.length ? (
              topWords.map(([word, count], index) => (
                <div key={word} className="grid grid-cols-[24px_minmax(0,100px)_1fr_40px] items-center gap-2">
                  <div className="text-right text-[11px] font-medium text-[#6b6d80]">{index + 1}</div>
                  <div className="truncate text-[13px] font-semibold text-white">{word}</div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.04]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#10b981] to-[#f59e0b]"
                      style={{ width: `${Math.max(12, Math.round((count / longestBar) * 100))}%` }}
                    />
                  </div>
                  <div className="text-right text-[12px] text-[#6b6d80]">{count}</div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-[13px] text-[#6b6d80]">
                No standout terms detected.
              </div>
            )}
          </div>
        </SCard>

        <SCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-[#9294a5]">
              <UIcon name="Sparkles" size={15} />
            </div>
            <div className="font-display text-[15px] font-bold text-white">Insights</div>
          </div>
          <div className="flex flex-col gap-2">
            {[
              `${sentenceCount.toLocaleString()} sentences, avg ${sentenceCount > 0 ? Math.round(wordCount / Math.max(sentenceCount, 1)) : 0} words per sentence.`,
              `~${Math.max(1, readingTime)} min read${readingTime <= 3 ? " — quick scan" : " — longer read"}.`,
              topWords[0]
                ? `"${topWords[0][0]}" appears ${topWords[0][1]} times.`
                : "No dominant topic term found.",
            ].map((line) => (
              <div
                key={line}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-[13px] leading-relaxed text-[#9294a5]"
              >
                {line}
              </div>
            ))}
          </div>
        </SCard>
      </div>
    </div>
  );
}

export function SearchView({ text }: { text: string }) {
  const [query, setQuery] = useState("");
  const [current, setCurrent] = useState(0);

  const matches = useMemo(() => {
    if (!query || query.trim().length < 2) return [];
    const regex = new RegExp(escRe(query.trim()), "i");
    return text
      .split("\n")
      .map((line, index) => ({ text: line.trim(), line: index + 1 }))
      .filter((entry) => entry.text.length > 0 && regex.test(entry.text));
  }, [query, text]);

  const currentIndex = matches.length ? current % matches.length : 0;
  const selected = matches[currentIndex];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-white/[0.04] bg-white/[0.02] px-5 py-3 md:px-7">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
            <UIcon name="Search" size={15} className="text-[#6b6d80]" />
            <HInput
              value={query}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setQuery(event.target.value);
                setCurrent(0);
              }}
              placeholder="Search text..."
              className="border-none bg-transparent px-0 py-0 shadow-none focus:ring-0 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="vintage-badge text-[10px]">
              {matches.length} result{matches.length === 1 ? "" : "s"}
            </span>
            <button
              onClick={() => setCurrent((v) => matches.length ? (v - 1 + matches.length) % matches.length : 0)}
              disabled={!matches.length}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-[#9294a5] transition-all disabled:opacity-30 enabled:hover:bg-white/[0.04] enabled:hover:text-white"
            >
              <UIcon name="ChevronUp" size={14} />
            </button>
            <button
              onClick={() => setCurrent((v) => matches.length ? (v + 1) % matches.length : 0)}
              disabled={!matches.length}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-[#9294a5] transition-all disabled:opacity-30 enabled:hover:bg-white/[0.04] enabled:hover:text-white"
            >
              <UIcon name="ChevronDown" size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 px-5 py-5 md:px-7 xl:grid-cols-[minmax(0,1.15fr)_280px]">
        <div className="min-h-0 overflow-y-auto">
          <div className="flex flex-col gap-2">
            {!query || query.trim().length < 2 ? (
              <div className="vintage-card px-4 py-5 text-[13px] text-[#6b6d80]">
                Type at least 2 characters to search.
              </div>
            ) : matches.length === 0 ? (
              <div className="vintage-card px-4 py-5 text-[13px] text-[#ff6b6b]">
                {`No matches for "${query}".`}
              </div>
            ) : (
              matches.map((match, index) => {
                const marked = esc(match.text).replace(
                  new RegExp(escRe(esc(query.trim())), "gi"),
                  (chunk: string) =>
                    `<mark class="rounded-md bg-[#10b981]/20 px-1 py-0.5 text-white">${chunk}</mark>`
                );

                return (
                  <button
                    key={`${match.line}-${index}`}
                    onClick={() => setCurrent(index)}
                    className={`vintage-card text-left transition-all duration-200 ${
                      currentIndex === index
                        ? "border-[#10b981]/20 bg-[#10b981]/[0.04]"
                        : "hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="vintage-badge text-[10px]">Line {match.line}</span>
                      <span className="text-[11px] text-[#6b6d80]">Match {index + 1}</span>
                    </div>
                    <div
                      className="mt-3 text-[13px] leading-7 text-[#9294a5]"
                      dangerouslySetInnerHTML={{ __html: marked }}
                    />
                  </button>
                );
              })
            )}
          </div>
        </div>

        <SCard style={{ height: "fit-content" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-[#9294a5]">
              <UIcon name="LocateFixed" size={15} />
            </div>
            <div className="font-display text-[14px] font-bold text-white">Focus</div>
          </div>

          {selected ? (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-[#6b6d80]">Line {selected.line}</div>
              <div className="mt-2 text-[13px] leading-relaxed text-[#9294a5]">{selected.text}</div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-[12px] text-[#6b6d80]">
              Results appear here.
            </div>
          )}
        </SCard>
      </div>
    </div>
  );
}

export function ExportView({ doc }: { doc: DocShape }) {
  const stats = doc.stats || {
    wordCount: 0, charCount: 0, sentenceCount: 0, readingTime: 0,
    topWords: [] as Array<[string, number]>,
  };

  const items = [
    {
      title: "Plain text",
      ext: ".txt",
      icon: "FileText" as React.ComponentProps<typeof UIcon>["name"],
      onClick: () => dlText(`${stem(doc.name)}.txt`, doc.text || ""),
    },
    {
      title: "Markdown",
      ext: ".md",
      icon: "NotebookPen" as React.ComponentProps<typeof UIcon>["name"],
      onClick: () =>
        dlText(
          `${stem(doc.name)}.md`,
          (doc.text || "")
            .split("\n")
            .map((line) => line.trim().length > 60 ? line : line.trim() ? `## ${line.trim()}` : "")
            .join("\n")
        ),
    },
    {
      title: "Analysis report",
      ext: ".txt",
      icon: "FileBarChart" as React.ComponentProps<typeof UIcon>["name"],
      onClick: () => {
        dlText(
          `${stem(doc.name)}_report.txt`,
          [
            "OneDoc Analysis Report",
            "======================",
            `File: ${doc.name}`,
            `Words: ${stats.wordCount}`,
            `Characters: ${stats.charCount}`,
            `Sentences: ${stats.sentenceCount}`,
            `Reading time: ~${stats.readingTime} min`,
            "",
            "Top Words",
            "---------",
            ...stats.topWords.map(([word, count], index) => `${index + 1}. ${word}: ${count}`),
          ].join("\n")
        );
      },
    },
    {
      title: "Word frequency CSV",
      ext: ".csv",
      icon: "Sheet" as React.ComponentProps<typeof UIcon>["name"],
      onClick: () =>
        dlText(
          `${stem(doc.name)}_frequency.csv`,
          "Word,Count\n" + stats.topWords.map(([word, count]) => `"${word}",${count}`).join("\n")
        ),
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto px-5 py-5 md:px-7">
      <div className="grid gap-3 xl:grid-cols-2">
        {items.map((item) => (
          <SCard key={item.title}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] text-[#9294a5]">
                  <UIcon name={item.icon} size={17} />
                </div>
                <div>
                  <div className="font-display text-[15px] font-bold text-white">{item.title}</div>
                  <span className="vintage-badge text-[10px] mt-0.5">{item.ext}</span>
                </div>
              </div>
              <HBtn onClick={item.onClick} label={`Download ${item.ext}`} loading={false} disabled={false} />
            </div>
          </SCard>
        ))}
      </div>
    </div>
  );
}
