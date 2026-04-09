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
      {
        label: "Words",
        value: active.stats.wordCount.toLocaleString(),
      },
      {
        label: "Read time",
        value: `~${active.stats.readingTime} min`,
      },
      {
        label: "Pages",
        value: active.pages ? active.pages.toString() : active.type.toUpperCase(),
      },
    ];
  }, [active]);

  async function processFile(file: File) {
    const isPdf = /\.pdf$/i.test(file.name);
    const isDocx = /\.docx$/i.test(file.name);

    if (!isPdf && !isDocx) {
      showToast("Only PDF and DOCX files are supported here.");
      return;
    }

    const id = Date.now() + Math.round(Math.random() * 1000);
    const type: DocType = isPdf ? "pdf" : "docx";
    const nextDoc: DocRecord = {
      id,
      name: file.name,
      size: file.size,
      type,
      text: null,
      pages: null,
      stats: null,
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

      nextDoc.text =
        text.trim() || "This file does not appear to contain extractable text.";
      nextDoc.stats = computeStats(nextDoc.text);
    } catch {
      nextDoc.text =
        "We could not extract usable text from this file. Please try another document.";
      nextDoc.stats = computeStats(nextDoc.text);
    }

    setDocs((previous) =>
      previous.map((doc) => (doc.id === id ? { ...nextDoc } : doc))
    );
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
    {
      id: "text" as const,
      label: "Read",
      tip: "Review the extracted text surface.",
      icon: "FileText",
    },
    {
      id: "stats" as const,
      label: "Insights",
      tip: "Word counts, frequency, and readability signals.",
      icon: "BarChart3",
    },
    {
      id: "search" as const,
      label: "Search",
      tip: "Find exact terms inside the extracted text.",
      icon: "Search",
    },
    {
      id: "export" as const,
      label: "Export",
      tip: "Download text and reporting formats.",
      icon: "Download",
    },
  ];

  const quickActions = [
    {
      label: "Copy text",
      tip: "Copy the full extracted text to your clipboard.",
      icon: "Clipboard",
      onClick: () =>
        navigator.clipboard
          .writeText(active?.text || "")
          .then(() => showToast("Extracted text copied.")),
    },
    {
      label: "Open insights",
      tip: "Jump directly to the analysis tab.",
      icon: "ChartColumn",
      onClick: () => setTab("stats"),
    },
    {
      label: "Search",
      tip: "Switch into document search mode.",
      icon: "ScanSearch",
      onClick: () => setTab("search"),
    },
    {
      label: "Export",
      tip: "Jump into download options.",
      icon: "FileOutput",
      onClick: () => setTab("export"),
    },
  ];

  return (
    <div className="page-shell">
      <div className="surface-panel relative mt-1 overflow-hidden p-0">
        <Tip tip={sidebarOpen ? "Close the document list." : "Open the document list."} side="left">
          <button
            onClick={() => setSidebarOpen((value) => !value)}
            title={sidebarOpen ? "Close the document list." : "Open the document list."}
            className="fixed bottom-5 right-5 z-[90] flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-white text-ink2 shadow-xl transition-transform duration-200 hover:scale-[1.02] md:hidden"
            aria-label="Toggle document sidebar"
          >
            <UIcon name={sidebarOpen ? "X" : "PanelsLeftBottom"} size={22} />
          </button>
        </Tip>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-[79] bg-white/50 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="grid min-h-[620px] md:min-h-[760px] lg:grid-cols-[312px_minmax(0,1fr)]">
          <aside
            className={`fixed inset-y-0 left-0 z-[80] flex w-[312px] max-w-[88vw] flex-col border-r border-black/5 bg-paper2/95 backdrop-blur-md transition-transform duration-200 lg:static lg:w-auto lg:max-w-none ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            }`}
          >
            <div className="flex items-center justify-between border-b border-black/5 px-5 py-5">
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-ink4">
                  Document queue
                </div>
                <div className="mt-2 font-caveat text-[28px] leading-none tracking-[-0.03em] text-ink2">
                  Analyzer
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                title="Close the document list."
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-white/80 text-ink3 lg:hidden"
              >
                <UIcon name="X" size={16} />
              </button>
            </div>

            <div className="border-b border-black/5 px-5 py-5">
              <label
                title="Upload PDFs or DOCX files into the analyzer."
                onDragOver={(event) => {
                  event.preventDefault();
                  setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDrag(false);
                  handleFiles(event.dataTransfer.files);
                }}
                className={`block cursor-pointer rounded-2xl border-2 border-dashed px-5 py-6 text-center transition-all duration-200 ${
                  drag
                    ? "border-[var(--color-vintage-gold)] bg-black/5 shadow-md"
                    : "border-black/10 bg-black/5"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.docx"
                  multiple
                  className="hidden"
                  onChange={(event) => handleFiles(event.target.files)}
                />
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white border border-black/5 text-ink2 shadow-sm">
                  <UIcon name="FolderUp" size={22} />
                </div>
                <div className="mt-4 text-[16px] font-semibold text-ink2">
                  Drop PDF or DOCX files
                </div>
                <div className="mt-2 text-[13px] leading-relaxed text-ink4">Click or drag to upload.</div>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="vintage-badge">PDF</span>
                  <span className="vintage-badge">DOCX</span>
                  <span className="vintage-badge">Multi-file</span>
                </div>
              </label>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-ink4">
                  Recent documents
                </div>
                <span className="vintage-badge">{docs.length}</span>
              </div>
              {docs.length === 0 ? (
                <div className="rounded-2xl border border-black/10 bg-white/70 px-4 py-5 text-[14px] leading-relaxed text-ink4">
                  Your files will appear here.
                </div>
              ) : (
                docs.map((doc) => (
                  <DItem
                    key={doc.id}
                    doc={doc}
                    active={doc.id === activeId}
                    onSelect={() => {
                      setActiveId(doc.id);
                      setSidebarOpen(false);
                    }}
                    onRemove={() => removeDoc(doc.id)}
                  />
                ))
              )}
            </div>

            <div className="border-t border-black/5 px-5 py-5">
              <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-ink4">
                Quick info
              </div>
              <div className="mt-4 grid gap-3">
                {workspaceMetrics.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3"
                  >
                    <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink4">
                      {item.label}
                    </div>
                    <div className="mt-2 text-[16px] font-semibold text-ink2">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className="min-w-0 bg-transparent relative">
            {loading && (
              <div className="h-[3px] bg-ink2 bg-[length:240%_100%] animate-ink-load" />
            )}

            {!ready && (
              <div className="border-b border-black/5 px-5 py-3 text-[13px] text-ink4 md:px-8">
                Loading tools...
              </div>
            )}

            {!active ? (
              <div className="flex h-full flex-col justify-center px-5 py-10 md:px-8 md:py-14">
                <div className="mx-auto flex w-full max-w-[560px] flex-col items-center text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white border border-black/5 text-ink2 shadow-md">
                    <UIcon name="FileSearch" size={30} />
                  </div>
                  <div className="mt-6 font-caveat text-[40px] leading-none tracking-[-0.04em] text-ink2">
                    No document yet
                  </div>
                  <div className="mt-4 max-w-[620px] text-[16px] leading-relaxed text-ink4">
                    Upload a PDF or DOCX from the left panel to begin.
                  </div>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <span className="vintage-badge">Read</span>
                    <span className="vintage-badge">Search</span>
                    <span className="vintage-badge">Export</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-0 flex-col">
                <div className="border-b border-black/5 px-5 py-5 md:px-8">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                      <div className="page-kicker">Active Document</div>
                      <div className="mt-3 font-caveat text-[36px] leading-none tracking-[-0.04em] text-ink2">
                        {active.name}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3">
                        <span className="vintage-badge">
                          <UIcon
                            name={active.type === "pdf" ? "FileText" : "FileSignature"}
                            size={14}
                          />
                          {active.type.toUpperCase()}
                        </span>
                        <span className="vintage-badge">
                          <UIcon name="HardDrive" size={14} />
                          {(active.size / 1048576).toFixed(1)} MB
                        </span>
                        {active.pages ? (
                          <span className="vintage-badge">
                            <UIcon name="Layers3" size={14} />
                            {active.pages} pages
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                      {quickActions.map((action) => (
                        <Tip key={action.label} tip={action.tip}>
                          <button
                            onClick={() => active && action.onClick()}
                            className="vintage-button w-full justify-center text-[13px] text-ink3 hover:text-ink2 bg-white"
                          >
                            <UIcon name={action.icon as any} size={16} />
                            {action.label}
                          </button>
                        </Tip>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {tabs.map((item) => (
                      <Tip key={item.id} tip={item.tip}>
                        <button
                          onClick={() => setTab(item.id)}
                          className={`flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold transition-all duration-200 ${
                            tab === item.id
                              ? "bg-ink2 text-white shadow-md"
                              : "bg-transparent text-ink4 hover:bg-black/5 hover:text-ink2"
                          }`}
                        >
                          <UIcon name={item.icon as any} size={16} />
                          {item.label}
                        </button>
                      </Tip>
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
