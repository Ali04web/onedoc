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

const heroPoints = [
  {
    title: "Premium reading surface",
    description:
      "Document review, search, and export live in one calm workspace that feels polished instead of improvised.",
    icon: "PanelsTopLeft",
  },
  {
    title: "Private by default",
    description:
      "Analysis runs in the browser so customers can trust the experience with sensitive files.",
    icon: "ShieldCheck",
  },
  {
    title: "Better PDF extraction",
    description:
      "The analyzer uses the stronger PDF parsing flow, which makes search and export more dependable.",
    icon: "Sparkles",
  },
];

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
      <section className="page-hero">
        <div>
          <div className="page-kicker">Premium Analysis Workspace</div>
          <h1 className="page-title">
            Review, search, and export documents in a workspace that feels
            carefully crafted.
          </h1>
          <p className="page-copy">
            OneDocs keeps analysis private, readable, and fast. Upload PDFs or
            DOCX files, inspect the text, surface patterns, and export what you
            need without sending documents away.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="premium-chip">
              <UIcon name="ShieldCheck" size={14} />
              Browser-first privacy
            </span>
            <span className="premium-chip">
              <UIcon name="FileSearch" size={14} />
              Rich document search
            </span>
            <span className="premium-chip">
              <UIcon name="Download" size={14} />
              Quick export paths
            </span>
          </div>
        </div>

        <div className="surface-panel flex flex-col gap-5 p-6 md:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-ink4">
                Workspace promise
              </div>
              <div className="mt-2 font-caveat text-[30px] leading-none tracking-[-0.03em] text-ink2">
                Better confidence for every upload
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(186,138,66,.1)] text-amber2">
              <UIcon name="Sparkles" size={20} />
            </div>
          </div>
          <div className="premium-divider" />
          <div className="grid gap-3">
            {heroPoints.map((point) => (
              <div
                key={point.title}
                className="rounded-[22px] border border-[rgba(42,34,24,.08)] bg-white/70 px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(31,90,86,.1)] text-teal">
                    <UIcon name={point.icon as any} size={16} />
                  </div>
                  <div className="text-[15px] font-semibold text-ink2">
                    {point.title}
                  </div>
                </div>
                <div className="mt-3 text-[14px] leading-relaxed text-ink4">
                  {point.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="surface-panel relative overflow-hidden p-0">
        <button
          onClick={() => setSidebarOpen((value) => !value)}
          className="fixed bottom-5 right-5 z-[90] flex h-14 w-14 items-center justify-center rounded-full border border-amber2/35 bg-gradient-to-br from-amber to-amber2 text-white shadow-[0_18px_34px_rgba(186,138,66,.3)] transition-transform duration-200 hover:scale-[1.02] md:hidden"
          aria-label="Toggle document sidebar"
        >
          <UIcon name={sidebarOpen ? "X" : "PanelsLeftBottom"} size={22} />
        </button>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-[79] bg-[rgba(24,18,12,.34)] backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="grid min-h-[760px] lg:grid-cols-[312px_minmax(0,1fr)]">
          <aside
            className={`fixed inset-y-0 left-0 z-[80] flex w-[312px] max-w-[88vw] flex-col border-r border-[rgba(42,34,24,.08)] bg-[linear-gradient(180deg,rgba(251,247,240,.98),rgba(246,240,228,.98))] transition-transform duration-200 lg:static lg:w-auto lg:max-w-none ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            }`}
          >
            <div className="flex items-center justify-between border-b border-[rgba(42,34,24,.08)] px-5 py-5">
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
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(42,34,24,.08)] bg-white/80 text-ink3 lg:hidden"
              >
                <UIcon name="X" size={16} />
              </button>
            </div>

            <div className="border-b border-[rgba(42,34,24,.08)] px-5 py-5">
              <label
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
                className={`block cursor-pointer rounded-[28px] border border-dashed px-5 py-6 text-center transition-all duration-200 ${
                  drag
                    ? "border-amber/45 bg-[rgba(186,138,66,.08)] shadow-[0_22px_38px_rgba(186,138,66,.12)]"
                    : "border-[rgba(42,34,24,.14)] bg-white/72"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.docx"
                  multiple
                  className="hidden"
                  onChange={(event) => handleFiles(event.target.files)}
                />
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(31,90,86,.1)] text-teal">
                  <UIcon name="FolderUp" size={22} />
                </div>
                <div className="mt-4 text-[16px] font-semibold text-ink2">
                  Drop PDF or DOCX files
                </div>
                <div className="mt-2 text-[13px] leading-relaxed text-ink4">
                  Click to browse or drag documents directly into the workspace.
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="premium-chip">PDF</span>
                  <span className="premium-chip">DOCX</span>
                  <span className="premium-chip">Multi-file queue</span>
                </div>
              </label>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-ink4">
                  Recent documents
                </div>
                <span className="premium-chip">{docs.length}</span>
              </div>
              {docs.length === 0 ? (
                <div className="rounded-[24px] border border-[rgba(42,34,24,.08)] bg-white/72 px-4 py-5 text-[14px] leading-relaxed text-ink4">
                  Your uploaded files will appear here. Keep multiple documents
                  ready and switch between them without leaving the analyzer.
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

            <div className="border-t border-[rgba(42,34,24,.08)] px-5 py-5">
              <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-ink4">
                Workspace details
              </div>
              <div className="mt-4 grid gap-3">
                {workspaceMetrics.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[20px] border border-[rgba(42,34,24,.08)] bg-white/72 px-4 py-3"
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

          <main className="min-w-0 bg-[linear-gradient(180deg,rgba(255,255,255,.45),rgba(248,244,236,.6))]">
            {loading && (
              <div className="h-[3px] bg-[linear-gradient(90deg,var(--color-amber),var(--color-teal),var(--color-amber2))] bg-[length:240%_100%] animate-ink-load" />
            )}

            {!ready && (
              <div className="border-b border-[rgba(42,34,24,.08)] px-5 py-3 text-[13px] text-ink4 md:px-8">
                Loading document libraries. The workspace will be ready in a
                moment.
              </div>
            )}

            {!active ? (
              <div className="flex h-full flex-col justify-center px-5 py-10 md:px-8 md:py-14">
                <div className="mx-auto flex w-full max-w-[860px] flex-col items-center text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(186,138,66,.1)] text-amber2 shadow-[0_20px_42px_rgba(186,138,66,.16)]">
                    <UIcon name="FileSearch" size={30} />
                  </div>
                  <div className="mt-6 font-caveat text-[40px] leading-none tracking-[-0.04em] text-ink2">
                    No document is open yet.
                  </div>
                  <div className="mt-4 max-w-[620px] text-[16px] leading-relaxed text-ink4">
                    Start by uploading a PDF or DOCX. Once a file is loaded you
                    can review the text, inspect document statistics, search
                    across the content, and export polished outputs.
                  </div>
                  <div className="mt-8 grid w-full gap-4 md:grid-cols-3">
                    {[
                      {
                        title: "Read clearly",
                        description:
                          "A calmer text surface makes it easier to validate extraction quality.",
                        icon: "FileText",
                      },
                      {
                        title: "Search quickly",
                        description:
                          "Jump to the exact line you need without scrolling through the whole file.",
                        icon: "Search",
                      },
                      {
                        title: "Export cleanly",
                        description:
                          "Take plain text, markdown, and reporting formats in a few clicks.",
                        icon: "Download",
                      },
                    ].map((item) => (
                      <div key={item.title} className="surface-card text-left">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(31,90,86,.1)] text-teal">
                          <UIcon name={item.icon as any} size={18} />
                        </div>
                        <div className="mt-5 font-caveat text-[28px] leading-none tracking-[-0.03em] text-ink2">
                          {item.title}
                        </div>
                        <div className="mt-3 text-[14px] leading-relaxed text-ink4">
                          {item.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-0 flex-col">
                <div className="border-b border-[rgba(42,34,24,.08)] px-5 py-5 md:px-8">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                      <div className="page-kicker">Active Document</div>
                      <div className="mt-3 font-caveat text-[36px] leading-none tracking-[-0.04em] text-ink2">
                        {active.name}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3">
                        <span className="premium-chip">
                          <UIcon
                            name={active.type === "pdf" ? "FileText" : "FileSignature"}
                            size={14}
                          />
                          {active.type.toUpperCase()}
                        </span>
                        <span className="premium-chip">
                          <UIcon name="HardDrive" size={14} />
                          {(active.size / 1048576).toFixed(1)} MB
                        </span>
                        {active.pages ? (
                          <span className="premium-chip">
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
                            className="flex items-center justify-center gap-2 rounded-[20px] border border-[rgba(42,34,24,.1)] bg-white/78 px-4 py-3 text-[14px] font-semibold text-ink3 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber/35 hover:bg-white"
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
                          className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-[14px] font-semibold transition-all duration-200 ${
                            tab === item.id
                              ? "border-amber/35 bg-[rgba(186,138,66,.1)] text-amber2 shadow-[0_12px_24px_rgba(186,138,66,.12)]"
                              : "border-[rgba(42,34,24,.08)] bg-white/72 text-ink4 hover:border-[rgba(42,34,24,.14)] hover:bg-white"
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
