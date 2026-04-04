"use client";

import React, { useState, useCallback } from "react";
import { useScripts } from "../hooks/useScripts";
import { extractPdfFile } from "../lib/pdf-client";
import { computeStats } from "../lib/utils";
import { Tip, Toast, DItem } from "./DocLensUI";
import { TView, StatsView, SearchView, ExportView } from "./AnalyzeViews";
import { Emoji } from "./Icons";

const PDF_WORKER_SRC =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

export default function DocLens() {
  const ready = useScripts([
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js",
  ]);

  const [docs, setDocs] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<any>(null);
  const [tab, setTab] = useState("text");
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        const extraction = await extractPdfFile(file, PDF_WORKER_SRC);
        doc.pages = extraction.pageCount;
        text = extraction.text;
      } else {
        const ab = await file.arrayBuffer(), r = await window.mammoth.extractRawText({ arrayBuffer: ab });
        text = r.value;
      }
      doc.text = text.trim() || "This file does not appear to contain extractable text.";
      doc.stats = computeStats(doc.text);
    } catch (e) {
      doc.text = "⚠️ Could not extract text from this file.";
    }
    setDocs(p => p.map(d => d.id === id ? { ...doc } : d));
    setLoading(false);
    setTab("text");
    setSidebarOpen(false);
  }

  function handleFiles(files: FileList | null) { Array.from(files || []).forEach(processFile); }
  function removeDoc(id: string) { setDocs(p => p.filter(d => d.id !== id)); if (activeId === id) setActiveId(docs.filter(d => d.id !== id)[0]?.id || null); }

  const innerTabs = [
    { id: "text", ico: "📄", l: "Text", t: "Read the extracted document text" },
    { id: "stats", ico: "📊", l: "Stats", t: "Word counts and frequency analysis" },
    { id: "search", ico: "🔍", l: "Search", t: "Find any word in the document" },
    { id: "export", ico: "💾", l: "Export", t: "Download in different file formats" },
  ];

  const qTools = [
    { i: "📋", l: "Copy all", t: "Copy full text to clipboard", f: () => navigator.clipboard.writeText(active?.text || "").then(() => showToast("Text copied!")) },
    { i: "📊", l: "Stats", t: "View word statistics", f: () => setTab("stats") },
    { i: "🔍", l: "Search", t: "Search within the document", f: () => setTab("search") },
    { i: "💾", l: "Export", t: "Save in various formats", f: () => setTab("export") },
  ];

  return (
    <div className="flex flex-1 overflow-hidden min-h-0 relative">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed bottom-5 right-5 z-[90] bg-amber text-white border-2 border-amber2 rounded-full w-[52px] h-[52px] flex items-center justify-center shadow-[3px_4px_0_rgba(30,15,5,.2)] cursor-pointer text-[22px]"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <Emoji symbol="✕" size={24} /> : <Emoji symbol="📂" size={24} />}
      </button>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-[rgba(28,17,10,.3)] z-[79]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:relative z-[80] w-[280px] md:w-[264px] border-r-2 border-dashed border-[rgba(100,70,40,.18)] flex flex-col overflow-hidden bg-paper md:bg-[rgba(237,229,208,.45)] flex-shrink-0 h-full transition-transform duration-200`}>
        <div className="md:hidden flex items-center justify-between px-[14px] py-[10px] border-b border-[rgba(100,70,40,.15)]">
          <span className="font-caveat text-[18px] font-bold text-ink2 flex items-center gap-[6px]"><Emoji symbol="📂" size={18} /> Documents</span>
          <button onClick={() => setSidebarOpen(false)} className="bg-transparent border-none text-ink4 cursor-pointer text-[18px] flex items-center justify-center p-[4px]"><Emoji symbol="✕" size={18} /></button>
        </div>

        <label onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
          className={`m-[14px] border-[2.5px] border-dashed rounded-[4px_16px_6px_14px] py-[20px] px-[14px] text-center cursor-pointer transition-all duration-200 relative block ${drag ? "border-amber bg-[rgba(192,120,24,.07)] scale-[1.02]" : "border-[rgba(100,70,40,.3)] bg-[rgba(255,255,255,.28)] scale-100"}`}>
          <input type="file" accept=".pdf,.docx" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
          <div className="mb-[10px] inline-block -rotate-5"><Emoji symbol="📂" size={42} className="text-amber2" /></div>
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
            : docs.map(doc => <DItem key={doc.id} doc={doc} active={doc.id === activeId} onSelect={() => { setActiveId(doc.id); setSidebarOpen(false); }} onRemove={() => removeDoc(doc.id)} />)}
        </div>
        <div className="py-[12px] px-[13px] border-t-[1.5px] border-dashed border-[rgba(100,70,40,.18)]">
          <div className="font-caveat text-[14px] font-semibold text-ink4 mb-[9px] tracking-[0.4px]">→ quick tools</div>
          <div className="grid grid-cols-2 gap-[7px]">
            {qTools.map(({ i, l, t, f }) => (
              <Tip key={l} tip={t}>
                <button onClick={() => active && f()} disabled={!active} className={`flex items-center gap-[7px] py-[8px] px-[10px] rounded-[2px_9px_3px_8px] font-caveat text-[15px] font-semibold text-ink2 transition-all duration-150 w-full ${active ? "cursor-pointer bg-[rgba(255,255,255,.5)] border-[1.5px] border-[rgba(100,70,40,.28)] opacity-100 hover:bg-[rgba(192,120,24,.1)] hover:border-amber hover:rotate-[0.3deg]" : "cursor-not-allowed bg-[rgba(255,255,255,.5)] border-[1.5px] border-[rgba(100,70,40,.28)] opacity-[0.4]"}`}>
                  <Emoji symbol={i} size={16} />{l}
                </button>
              </Tip>
            ))}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-col flex-1 overflow-hidden bg-transparent min-w-0">
        {loading && <div className="h-[3px] bg-gradient-to-r from-amber via-teal to-amber bg-[length:300%_100%] animate-ink-load" />}
        {!ready && <div className="px-4 py-2 text-center"><span className="font-patrick text-[12px] text-ink4 italic">Loading libraries…</span></div>}
        {!active ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-[14px] p-8 md:p-[48px] text-center relative overflow-hidden">
            <div className="inline-block font-sans animate-wobble-in -rotate-[8deg]"><Emoji symbol="📄" size={64} className="text-ink3" /></div>
            <div className="font-caveat text-[24px] md:text-[28px] font-bold text-ink3 -rotate-[0.5deg]">No document open yet</div>
            <div className="font-patrick text-[14px] md:text-[15px] text-ink4 max-w-[280px] leading-[1.75]">
              Drop a PDF or DOCX into the sidebar. Everything runs in your browser — no uploads, no accounts.
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden mt-4 py-[10px] px-[22px] bg-amber hover:bg-amber2 text-white font-caveat text-[16px] font-bold rounded-[3px_10px_4px_9px] border-2 border-amber2 shadow-[2px_2px_0_rgba(30,15,5,.12)] cursor-pointer transition-all duration-150 flex items-center gap-[8px]"
            >
              <Emoji symbol="📂" size={18} /> Open Sidebar
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center border-b-[1.5px] border-dashed border-[rgba(100,70,40,.2)] px-4 md:px-[24px] bg-[rgba(237,229,208,.4)] flex-shrink-0 h-[46px] gap-[2px] overflow-x-auto">
              {innerTabs.map(t => (
                <Tip key={t.id} tip={t.t} side="bottom">
                  <button onClick={() => setTab(t.id)} className={`px-[10px] md:px-[13px] h-[46px] text-[13px] md:text-[14px] font-bold cursor-pointer bg-transparent border-none border-b-[3px] font-caveat tracking-[0.3px] transition-all duration-150 whitespace-nowrap flex items-center gap-[5px] ${tab === t.id ? "border-amber text-amber2 rotate-0" : "border-transparent text-ink4 rotate-[0.3deg]"}`}>
                    <Emoji symbol={t.ico} size={16} />{t.l}
                  </button>
                </Tip>
              ))}
              <div className="flex-1" />
              <Tip tip={`${active.name}${active.pages ? ` · ${active.pages} pages` : ""}`} side="left">
                <div className="flex items-center gap-[8px] cursor-default">
                  <span className="font-patrick text-[12px] text-ink4 max-w-[120px] md:max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap">{active.name}</span>
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

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
