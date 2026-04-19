"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useCallback, useMemo, useState } from "react";
import { useScripts } from "../hooks/useScripts";
import { extractPdfFile } from "../lib/pdf-client";
import { computeStats } from "../lib/utils";
import { DItem, Tip, Toast } from "./DocLensUI";
import { ExportView, SearchView, StatsView, TView } from "./AnalyzeViews";
import { UIcon } from "./Icons";

type DocType = "pdf" | "docx";

type DocRecord = {
  id: number;
  name: string;
  size: number;
  type: DocType;
  text: string | null;
  pages: number | null;
  stats: ReturnType<typeof computeStats> | null;
};

const PDF_WORKER_SRC =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

export default function DocLens() {
  const ready = useScripts([
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js",
  ]);

  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [tab, setTab] = useState<"text" | "stats" | "search" | "export">("text");
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const active = docs.find((doc) => doc.id === activeId) || null;
  const showToast = useCallback((message: string) => setToast(message), []);

  const workspaceMetrics = useMemo(() => {
    if (!active?.stats) {
      return [
        { label: "Formats", value: "PDF + DOCX" },
        { label: "Processing", value: "In browser" },
        { label: "Exports", value: "TXT, MD, CSV" },
      ];
    }

    return [
      { label: "Words", value: active.stats.wordCount.toLocaleString() },
      { label: "Read time", value: `~${active.stats.readingTime} min` },
      { label: "Pages", value: active.pages ? active.pages.toString() : active.type.toUpperCase() },
    ];
  }, [active]);

  async function processFile(file: File) {
    const isPdf = /\.pdf$/i.test(file.name);
    const isDocx = /\.docx$/i.test(file.name);

    if (!isPdf && !isDocx) {
      showToast("Only PDF and DOCX files are supported.");
      return;
    }

    const id = Date.now() + Math.round(Math.random() * 1000);
    const type: DocType = isPdf ? "pdf" : "docx";
    const nextDoc: DocRecord = {
      id, name: file.name, size: file.size, type,
      text: null, pages: null, stats: null,
    };

    setDocs((previous) => [...previous, nextDoc]);
    setActiveId(id);
    setLoading(true);

    try {
      if (!ready) {
        await new Promise((resolve) => window.setTimeout(resolve, 1200));
      }

      let text = "";

      if (type === "pdf") {
        const extraction = await extractPdfFile(file, PDF_WORKER_SRC);
        nextDoc.pages = extraction.pageCount;
        text = extraction.text;
      } else {
        const arrayBuffer = await file.arrayBuffer();
        const result = await (window as any).mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      }

      nextDoc.text = text.trim() || "No extractable text found.";
      nextDoc.stats = computeStats(nextDoc.text);
    } catch {
      nextDoc.text = "Could not extract text from this file.";
      nextDoc.stats = computeStats(nextDoc.text);
    }

    setDocs((previous) => previous.map((doc) => (doc.id === id ? { ...nextDoc } : doc)));
    setLoading(false);
    setTab("text");
    setSidebarOpen(false);
  }

  function handleFiles(files: FileList | null) {
    Array.from(files || []).forEach(processFile);
  }

  function removeDoc(id: number) {
    setDocs((previous) => {
      const next = previous.filter((doc) => doc.id !== id);
      setActiveId((current) => (current === id ? next[0]?.id ?? null : current));
      return next;
    });
  }

  const tabs = [
    { id: "text" as const, label: "Read", icon: "FileText" },
    { id: "stats" as const, label: "Insights", icon: "BarChart3" },
    { id: "search" as const, label: "Search", icon: "Search" },
    { id: "export" as const, label: "Export", icon: "Download" },
  ];

  const quickActions = [
    {
      label: "Copy",
      icon: "Clipboard",
      onClick: () =>
        navigator.clipboard.writeText(active?.text || "").then(() => showToast("Text copied.")),
    },
    { label: "Insights", icon: "ChartColumn", onClick: () => setTab("stats") },
    { label: "Search", icon: "ScanSearch", onClick: () => setTab("search") },
    { label: "Export", icon: "FileOutput", onClick: () => setTab("export") },
  ];

  return (
    <div className="page-shell">
      <div className="surface-panel relative overflow-hidden p-0">
        <Tip tip={sidebarOpen ? "Close sidebar" : "Open sidebar"} side="left">
          <button
            onClick={() => setSidebarOpen((value) => !value)}
            className="fixed bottom-5 right-5 z-[90] flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-[#12121a]/95 backdrop-blur-xl text-white shadow-xl transition-transform duration-200 hover:scale-105 md:hidden"
            aria-label="Toggle document sidebar"
          >
            <UIcon name={sidebarOpen ? "X" : "PanelsLeftBottom"} size={18} />
          </button>
        </Tip>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-[79] bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="grid min-h-[620px] md:min-h-[720px] lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside
            className={`fixed inset-y-0 left-0 z-[80] flex w-[280px] max-w-[88vw] flex-col border-r border-white/[0.04] bg-[#0a0a0f]/95 backdrop-blur-xl transition-transform duration-200 lg:static lg:w-auto lg:max-w-none ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/[0.04] px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-[#10b981]/10 border border-[#10b981]/15 flex items-center justify-center">
                  <UIcon name="NavAnalyze" size={14} className="text-[#10b981]" />
                </div>
                <div className="font-display text-[14px] font-bold text-white">Analyzer</div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-[#9294a5] lg:hidden"
              >
                <UIcon name="X" size={14} />
              </button>
            </div>

            <div className="border-b border-white/[0.04] px-4 py-4">
              <label
                onDragOver={(event) => { event.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(event) => { event.preventDefault(); setDrag(false); handleFiles(event.dataTransfer.files); }}
                className={`block cursor-pointer rounded-xl border-2 border-dashed px-4 py-5 text-center transition-all duration-200 ${
                  drag
                    ? "border-[#10b981]/40 bg-[#10b981]/[0.04]"
                    : "border-white/[0.08] bg-white/[0.02]"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.docx"
                  multiple
                  className="hidden"
                  onChange={(event) => handleFiles(event.target.files)}
                />
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] text-[#9294a5]">
                  <UIcon name="FolderUp" size={18} />
                </div>
                <div className="mt-3 text-[13px] font-semibold text-white">
                  Drop PDF or DOCX
                </div>
                <div className="mt-1 text-[11px] text-[#6b6d80]">Click or drag</div>
              </label>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-[#6b6d80]">
                  Documents
                </div>
                <span className="vintage-badge text-[10px]">{docs.length}</span>
              </div>
              {docs.length === 0 ? (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-4 text-[12px] text-[#6b6d80]">
                  Files will appear here.
                </div>
              ) : (
                docs.map((doc) => (
                  <DItem
                    key={doc.id}
                    doc={doc}
                    active={doc.id === activeId}
                    onSelect={() => { setActiveId(doc.id); setSidebarOpen(false); }}
                    onRemove={() => removeDoc(doc.id)}
                  />
                ))
              )}
            </div>

            <div className="border-t border-white/[0.04] px-4 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-[#6b6d80] mb-3">
                Quick info
              </div>
              <div className="grid gap-2">
                {workspaceMetrics.map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6d80]">{item.label}</div>
                    <div className="mt-1 text-[14px] font-semibold text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className="min-w-0 bg-transparent relative">
            {loading && (
              <div className="h-[2px] animate-ink-load" />
            )}

            {!ready && (
              <div className="border-b border-white/[0.04] px-5 py-2.5 text-[12px] text-[#6b6d80] md:px-7">
                Loading tools...
              </div>
            )}

            {!active ? (
              <div className="flex h-full flex-col justify-center px-5 py-10 md:px-7">
                <div className="mx-auto flex w-full max-w-[480px] flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06] text-[#9294a5]">
                    <UIcon name="FileSearch" size={26} />
                  </div>
                  <div className="mt-5 font-display text-2xl font-bold text-white">
                    No document yet
                  </div>
                  <div className="mt-3 text-[14px] text-[#6b6d80]">
                    Upload a PDF or DOCX from the left panel.
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-0 flex-col">
                <div className="border-b border-white/[0.04] px-5 py-4 md:px-7">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                      <div className="vintage-badge mb-2">Active Document</div>
                      <div className="font-display text-xl font-bold text-white">
                        {active.name}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="vintage-badge text-[10px]">
                          <UIcon name={active.type === "pdf" ? "FileText" : "FileSignature"} size={11} />
                          {active.type.toUpperCase()}
                        </span>
                        <span className="vintage-badge text-[10px]">
                          {(active.size / 1048576).toFixed(1)} MB
                        </span>
                        {active.pages ? (
                          <span className="vintage-badge text-[10px]">
                            {active.pages} pages
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
                      {quickActions.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => active && action.onClick()}
                          className="vintage-button w-full justify-center text-[12px]"
                        >
                          <UIcon name={action.icon as any} size={13} />
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {tabs.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setTab(item.id)}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all duration-200 ${
                          tab === item.id
                            ? "bg-[#10b981] text-white shadow-md shadow-[#10b981]/20"
                            : "bg-transparent text-[#6b6d80] hover:bg-white/[0.04] hover:text-white"
                        }`}
                      >
                        <UIcon name={item.icon as any} size={13} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="min-h-0 flex-1">
                  {tab === "text" && <TView text={active.text || ""} searchQ="" />}
                  {tab === "stats" && <StatsView stats={active.stats} />}
                  {tab === "search" && <SearchView text={active.text || ""} />}
                  {tab === "export" && <ExportView doc={active} />}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
