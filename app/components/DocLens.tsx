"use client";

import React, { useState, useCallback } from "react";
import { useScripts } from "../hooks/useScripts";
import { computeStats } from "../lib/utils";
import { Tip, Toast, DItem } from "./DocLensUI";
import { TView, StatsView, SearchView, ExportView } from "./AnalyzeViews";
import { ConvertPanel } from "./ConvertPanel";

export default function DocLens() {
  const ready = useScripts([
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"
  ]);

  const [nav, setNav] = useState("analyze");
  const [docs, setDocs] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<any>(null);
  const [tab, setTab] = useState("text");
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  
  const active = docs.find(d => d.id === activeId) || null;
  const showToast = useCallback((msg: string) => setToast(msg), []);

  async function processFile(file: File) {
    if (!file.name.endsWith(".pdf") && !file.name.endsWith(".docx")) return;
    const type = file.name.endsWith(".pdf") ? "pdf" : "docx", id = Date.now() + Math.random();
    const doc: any = { id, name: file.name, size: file.size, type, text: null, pages: null, stats: null };
    setDocs(p => [...p, doc]);
    setActiveId(id);
    setLoading(true);
    try {
      if (!ready) await new Promise(r => setTimeout(r, 1500));
      let text = "";
      if (type === "pdf") {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        const ab = await file.arrayBuffer(), pdf = await window.pdfjsLib.getDocument({ data: ab }).promise;
        doc.pages = pdf.numPages;
        for (let i = 1; i <= pdf.numPages; i++) {
          const p = await pdf.getPage(i), c = await p.getTextContent();
          text += c.items.map((x: any) => x.str).join(" ") + "\n\n";
        }
      } else {
        const ab = await file.arrayBuffer(), r = await window.mammoth.extractRawText({ arrayBuffer: ab });
        text = r.value;
      }
      doc.text = text.trim();
      doc.stats = computeStats(doc.text);
    } catch (e) {
      doc.text = "⚠️ Could not extract text from this file.";
    }
    setDocs(p => p.map(d => d.id === id ? { ...doc } : d));
    setLoading(false);
    setTab("text");
  }

  function handleFiles(files: FileList | null) { Array.from(files || []).forEach(processFile); }
  function removeDoc(id: string) { setDocs(p => p.filter(d => d.id !== id)); if (activeId === id) setActiveId(docs.filter(d => d.id !== id)[0]?.id || null); }

  const innerTabs = [{ id: "text", l: "📄 Text", t: "Read the extracted document text" }, { id: "stats", l: "📊 Stats", t: "Word counts and frequency analysis" }, { id: "search", l: "🔍 Search", t: "Find any word in the document" }, { id: "export", l: "💾 Export", t: "Download in different file formats" }];
  const qTools = [{ i: "📋", l: "Copy all", t: "Copy full text to clipboard", f: () => navigator.clipboard.writeText(active?.text || "").then(() => showToast("Text copied!")) }, { i: "📊", l: "Stats", t: "View word statistics", f: () => setTab("stats") }, { i: "🔍", l: "Search", t: "Search within the document", f: () => setTab("search") }, { i: "💾", l: "Export", t: "Save in various formats", f: () => setTab("export") }];

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden ruled relative" style={{ minHeight: "100dvh" }}>
      <header className="flex items-center justify-between px-[28px] h-[54px] border-b-2 border-[rgba(60,35,10,.18)] bg-[rgba(237,229,208,.7)] backdrop-blur-[8px] flex-shrink-0 sticky top-0 z-[100]">
        <div className="flex gap-[4px]">
          {[["🔬", "Analyse", "analyze", "Analyze docs — extract text, stats, search"], ["🔄", "Convert", "convert", "Convert between PDF, DOCX, TXT, CSV formats"]].map(([ico, lbl, id, tip]) => (
            <Tip key={id} tip={tip} side="bottom">
              <button onClick={() => setNav(id)} className={`px-[18px] h-[54px] text-[16px] font-bold cursor-pointer bg-transparent border-none border-b-[3px] font-caveat tracking-[0.3px] transition-all duration-150 ${nav === id ? "border-amber text-amber2 rotate-0" : "border-transparent text-ink3 rotate-[0.3deg]"}`}>
                {ico} {lbl}
              </button>
            </Tip>
          ))}
        </div>
        <Tip tip="DocLens — a free doc toolkit. Everything runs in your browser.">
          <div className="flex items-center gap-[10px] cursor-default">
            <div className="font-caveat text-[24px] font-bold text-ink2 -rotate-[0.5deg] tracking-[-0.5px]">Doc<span className="text-amber">Lens</span></div>
            <div className="font-patrick text-[10px] py-[3px] px-[10px] rounded-[2px_8px_3px_7px] bg-teal text-white font-semibold tracking-[0.5px] rotate-[0.8deg] animate-stamp-in">FREE</div>
            {!ready && <span className="font-patrick text-[12px] text-ink4 italic">Loading…</span>}
          </div>
        </Tip>
      </header>

      {nav === "analyze" ? (
        <div className="flex flex-1 overflow-hidden min-h-0">
          <aside className="w-[264px] border-r-2 border-dashed border-[rgba(100,70,40,.18)] flex flex-col overflow-hidden bg-[rgba(237,229,208,.45)] flex-shrink-0">
            <label onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
              className={`m-[14px] border-[2.5px] border-dashed rounded-[4px_16px_6px_14px] py-[20px] px-[14px] text-center cursor-pointer transition-all duration-200 relative block ${drag ? "border-amber bg-[rgba(192,120,24,.07)] scale-[1.02]" : "border-[rgba(100,70,40,.3)] bg-[rgba(255,255,255,.28)] scale-100"}`}>
              <input type="file" accept=".pdf,.docx" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
              <div className="text-[32px] mb-[10px] inline-block -rotate-5">📂</div>
              <div className="font-caveat text-[17px] font-bold text-ink2 mb-[4px]">Drop files here</div>
              <div className="font-patrick text-[12px] text-ink4 mb-[12px]">or click to browse</div>
              <div className="flex gap-[7px] justify-center">
                {[["PDF", "var(--color-red)"], ["DOCX", "var(--color-teal)"]].map(([lbl, col]) => (
                  <Tip key={lbl} tip={`Upload a ${lbl} file`} side="bottom"><span className="font-caveat text-[12px] font-bold py-[2px] px-[10px] rounded-[2px_7px_3px_6px] border-[1.5px] tracking-[0.5px]" style={{ borderColor: col, color: col }}>{lbl}</span></Tip>
                ))}
              </div>
            </label>
            <div className="font-caveat text-[14px] font-semibold text-ink4 px-[18px] pt-[4px] pb-[6px] tracking-[0.5px]">→ your documents</div>
            <div className="flex-1 overflow-y-auto px-[10px] pb-[10px]">
              {docs.length === 0 ? <div className="font-caveat text-[17px] italic text-ink4 text-center py-[16px] px-[8px] -rotate-[0.5deg]">Nothing here yet…</div>
                : docs.map(doc => <DItem key={doc.id} doc={doc} active={doc.id === activeId} onSelect={() => setActiveId(doc.id)} onRemove={() => removeDoc(doc.id)} />)}
            </div>
            <div className="py-[12px] px-[13px] border-t-[1.5px] border-dashed border-[rgba(100,70,40,.18)]">
              <div className="font-caveat text-[14px] font-semibold text-ink4 mb-[9px] tracking-[0.4px]">→ quick tools</div>
              <div className="grid grid-cols-2 gap-[7px]">
                {qTools.map(({ i, l, t, f }) => (
                  <Tip key={l} tip={t}>
                    <button onClick={() => active && f()} disabled={!active} className={`flex items-center gap-[7px] py-[8px] px-[10px] rounded-[2px_9px_3px_8px] font-caveat text-[15px] font-semibold text-ink2 transition-all duration-150 w-full ${active ? "cursor-pointer bg-[rgba(255,255,255,.5)] border-[1.5px] border-[rgba(100,70,40,.28)] opacity-100 hover:bg-[rgba(192,120,24,.1)] hover:border-amber hover:rotate-[0.3deg]" : "cursor-not-allowed bg-[rgba(255,255,255,.5)] border-[1.5px] border-[rgba(100,70,40,.28)] opacity-[0.4]"}`}>
                      <span className="text-[16px]">{i}</span>{l}
                    </button>
                  </Tip>
                ))}
              </div>
            </div>
          </aside>

          <main className="flex flex-col flex-1 overflow-hidden bg-transparent min-w-0">
            {loading && <div className="h-[3px] bg-gradient-to-r from-amber via-teal to-amber bg-[length:300%_100%] animate-ink-load" />}
            {!active ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-[14px] p-[48px] text-center relative overflow-hidden">
                <div className="text-[60px] inline-block font-sans animate-wobble-in -rotate-[8deg]">📄</div>
                <div className="font-caveat text-[28px] font-bold text-ink3 -rotate-[0.5deg]">No document open yet</div>
                <div className="font-patrick text-[15px] text-ink4 max-w-[280px] leading-[1.75]">Drop a PDF or DOCX into the sidebar. Everything runs in your browser — no uploads, no accounts.</div>
                <svg width="120" height="60" viewBox="0 0 120 60" className="absolute left-[265px] top-[44%] opacity-20 rotate-[15deg]">
                  <path d="M10,10 Q40,5 70,25 Q100,45 110,50" stroke="var(--color-amber)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="6,4" />
                  <path d="M100,42 L110,50 L102,58" stroke="var(--color-amber)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </svg>
              </div>
            ) : (
              <>
                <div className="flex items-center border-b-[1.5px] border-dashed border-[rgba(100,70,40,.2)] px-[24px] bg-[rgba(237,229,208,.4)] flex-shrink-0 h-[46px] gap-[2px]">
                  {innerTabs.map(t => (
                    <Tip key={t.id} tip={t.t} side="bottom">
                      <button onClick={() => setTab(t.id)} className={`px-[13px] h-[46px] text-[14px] font-bold cursor-pointer bg-transparent border-none border-b-[3px] font-caveat tracking-[0.3px] transition-all duration-150 ${tab === t.id ? "border-amber text-amber2 rotate-0" : "border-transparent text-ink4 rotate-[0.3deg]"}`}>
                        {t.l}
                      </button>
                    </Tip>
                  ))}
                  <div className="flex-1" />
                  <Tip tip={`${active.name}${active.pages ? ` · ${active.pages} pages` : ""}`} side="left">
                    <div className="flex items-center gap-[8px] cursor-default">
                      <span className="font-patrick text-[12px] text-ink4 max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap">{active.name}</span>
                      {active.pages && <span className="font-caveat text-[12px] font-bold py-[2px] px-[8px] rounded-[2px_7px_3px_6px] border-[1.5px] border-teal text-teal">{active.pages}p</span>}
                    </div>
                  </Tip>
                </div>
                <div className="flex-1 overflow-hidden flex flex-col">
                  {tab === "text" && <TView text={active.text || ""} searchQ="" />}
                  {tab === "stats" && <StatsView stats={active.stats} />}
                  {tab === "search" && <SearchView text={active.text || ""} />}
                  {tab === "export" && <ExportView doc={active} />}
                </div>
              </>
            )}
          </main>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden min-h-0">
          <ConvertPanel toast={showToast} />
        </div>
      )}

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
