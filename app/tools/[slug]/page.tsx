"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useScripts } from "@/app/hooks/useScripts";
import {
  buildEditablePdfDocx,
  buildLayoutPdfDocx,
  buildPdfImageZip,
  extractPdfFile,
  renderPdfPages,
} from "@/app/lib/pdf-client";
import {
  comparePdfFiles,
  createRedactedPdf,
  extractPdfTextWithOcrFallback,
  extractPdfImages,
  formatBytes,
  openPrintWindow,
  optimizePdfForWeb,
  parseOrderedPageList,
  parseTerms,
  resolvePlacement,
  runPdfOcr,
  type PlacementPreset,
} from "@/app/lib/pdf-toolbox";
import {
  buildStandaloneHtml,
  convertDocxToRichHtml,
  htmlToMarkdown,
  openPrintPreviewWindow,
  parseCsv,
} from "@/app/lib/rich-exports";
import { dlBlob, dlText, esc, parsePageRange, stem } from "@/app/lib/utils";
import {
  CStat,
  FZone,
  HBtn as BaseHBtn,
  HInput,
  HSel,
  Toast,
} from "@/app/components/DocLensUI";
import { UIcon } from "@/app/components/Icons";
import ToolPageLayout from "@/app/components/ToolPageLayout";

declare global {
  interface Window {
    PDFLib: any;
    JSZip?: any;
    mammoth: any;
  }
}

const PDF_WORKER_SRC =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const PLACEMENT_OPTIONS: Array<{ value: PlacementPreset; label: string }> = [
  { value: "top-left", label: "Top left" },
  { value: "top-center", label: "Top center" },
  { value: "top-right", label: "Top right" },
  { value: "center", label: "Center" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-center", label: "Bottom center" },
  { value: "bottom-right", label: "Bottom right" },
];

/* ─── Shared helpers ─── */
function HBtn(props: any) {
  return <BaseHBtn {...props} className={`mt-auto shrink-0 ${props.className || ""}`.trim()} />;
}

function ProgressBar({ progress, label }: { progress: number; label?: string }) {
  if (!progress) return null;
  return (
    <div className="rounded-xl border border-black/[0.06] bg-[#f7f8fc] p-3.5 animate-fade-in">
      <div className="mb-2.5 flex items-center justify-between gap-3 text-[11px] text-[#9aa0a6] font-medium">
        <span className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#e5322d] animate-pulse" />
          {label || "Working..."}
        </span>
        <span className="font-bold text-[#1a1a2e]/60">{progress}%</span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-black/[0.04]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#e5322d] via-[#f97316] to-[#e5322d] transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%`, backgroundSize: "200% 100%", animation: progress < 100 ? "shimmer 2s linear infinite" : "none" }}
        />
      </div>
    </div>
  );
}

function FileListPreview({ files, icon }: { files?: File[]; icon: string }) {
  if (!files?.length) return null;
  return (
    <div className="flex max-h-[100px] flex-col gap-1.5 overflow-y-auto">
      {files.map((file) => (
        <div key={`${file.name}-${file.size}`} className="flex items-center gap-2 rounded-lg border border-black/[0.06] bg-[#f7f8fc] px-3 py-2 text-[12px] text-[#5f6368]">
          <UIcon name={icon as any} size={12} />
          <span className="truncate">{file.name}</span>
        </div>
      ))}
    </div>
  );
}

function TextAreaField({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-[108px] w-full resize-y rounded-xl border border-black/[0.08] bg-[#f7f8fc] px-4 py-3 text-[13px] font-medium text-[#1a1a2e] outline-none transition-all duration-300 placeholder:text-[#9aa0a6] focus:border-[#e5322d]/30 focus:ring-2 focus:ring-[#e5322d]/15 focus:bg-white hover:border-black/[0.12] ${className}`}
    />
  );
}

function HelperNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-[#f7f8fc] px-4 py-3 text-[12px] leading-relaxed text-[#5f6368]">{children}</div>
  );
}

function CsvPreview({ rows }: { rows: string[][] }) {
  if (!rows.length) return null;
  const [header, ...body] = rows;
  return (
    <div className="overflow-hidden rounded-xl border border-black/[0.06] bg-[#f7f8fc]">
      <div className="border-b border-black/[0.06] bg-white px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#5f6368]">
        {header.join(" · ")}
      </div>
      <div className="max-h-[120px] overflow-auto">
        {body.slice(0, 4).map((row, i) => (
          <div key={`${row.join("|")}-${i}`} className="border-b border-black/[0.04] px-4 py-2.5 text-[12px] text-[#5f6368] last:border-b-0">
            {row.join(" · ")}
          </div>
        ))}
      </div>
    </div>
  );
}

function normalizeHexColor(value: string | undefined, fallback: string) {
  const match = (value || fallback).trim().match(/^#?([0-9a-f]{6})$/i);
  return `#${(match?.[1] || fallback.replace("#", "")).toLowerCase()}`;
}

/* ─── Tool metadata registry ─── */
export type ToolMeta = {
  slug: string;
  title: string;
  description: string;
  tip?: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  scripts: "pdf" | "docx" | "both" | "none";
};

export const TOOL_REGISTRY: ToolMeta[] = [
  // PDF Conversion
  { slug: "pdf-to-text", title: "PDF to Text", description: "Extract all text from your PDF. Falls back to OCR for scanned documents.", tip: "Extracts native text first, then falls back to OCR for scanned PDFs.", icon: "FileText", iconColor: "#10b981", iconBg: "#ecfdf5", scripts: "pdf" },
  { slug: "pdf-to-images", title: "PDF to Images", description: "Render each page as a high-quality image, bundled in a ZIP.", tip: "Render pages as crisp images bundled in a ZIP.", icon: "Image", iconColor: "#f59e0b", iconBg: "#fffbeb", scripts: "pdf" },
  { slug: "pdf-to-word", title: "PDF to Word", description: "Convert your PDF to an editable DOCX file with layout or text mode.", tip: "Use page-faithful output for tricky layouts or editable text when extraction is strong.", icon: "FileSignature", iconColor: "#2563eb", iconBg: "#eff6ff", scripts: "pdf" },

  // PDF Organize
  { slug: "merge-pdf", title: "Merge PDF", description: "Combine multiple PDFs into a single document.", tip: "Files are merged in the order selected.", icon: "Combine", iconColor: "#e5322d", iconBg: "#fef2f2", scripts: "pdf" },
  { slug: "split-pdf", title: "Split PDF", description: "Extract specific pages from your PDF.", tip: 'Use "1-3, 5, 9" syntax.', icon: "ScissorsLineDashed", iconColor: "#f97316", iconBg: "#fff7ed", scripts: "pdf" },
  { slug: "images-to-pdf", title: "Images to PDF", description: "Create a PDF from JPG or PNG images.", tip: "Images added in selection order.", icon: "Images", iconColor: "#ec4899", iconBg: "#fdf2f8", scripts: "pdf" },
  { slug: "rotate-pdf", title: "Rotate PDF", description: "Fix sideways or upside-down pages.", tip: "Fix sideways or upside-down pages.", icon: "RotateCw", iconColor: "#8b5cf6", iconBg: "#f5f3ff", scripts: "pdf" },
  { slug: "remove-pages", title: "Remove PDF Pages", description: "Delete pages you don't need from the final file.", tip: "Delete any pages you do not want in the final file.", icon: "Trash2", iconColor: "#ef4444", iconBg: "#fef2f2", scripts: "pdf" },
  { slug: "rearrange-pages", title: "Rearrange PDF Pages", description: "Reorder pages in any custom order.", tip: 'Supports custom orders like "3,1,2,8-5".', icon: "ArrowUpDown", iconColor: "#6366f1", iconBg: "#eef2ff", scripts: "pdf" },

  // PDF Security
  { slug: "protect-pdf", title: "Protect PDF", description: "Encrypt your PDF with a password.", tip: "Encrypt with a password.", icon: "Lock", iconColor: "#ef4444", iconBg: "#fef2f2", scripts: "pdf" },
  { slug: "unlock-pdf", title: "Unlock PDF", description: "Remove password protection from an encrypted PDF.", tip: "Remove password from encrypted PDF.", icon: "Unlock", iconColor: "#10b981", iconBg: "#ecfdf5", scripts: "pdf" },

  // PDF Edit & Review
  { slug: "edit-pdf", title: "Edit PDF", description: "Add text annotations to any page or page range.", tip: "Add text annotations to any page or page range.", icon: "PencilLine", iconColor: "#f97316", iconBg: "#fff7ed", scripts: "pdf" },
  { slug: "sign-pdf", title: "Sign PDF", description: "Apply a typed signature or upload a signature image.", tip: "Apply a typed signature or upload a signature image.", icon: "Signature", iconColor: "#0891b2", iconBg: "#ecfeff", scripts: "pdf" },
  { slug: "add-watermark", title: "Add Watermark", description: "Stamp a repeated text watermark onto every page.", tip: "Stamp a repeated text watermark onto every page.", icon: "Droplets", iconColor: "#f59e0b", iconBg: "#fffbeb", scripts: "pdf" },
  { slug: "page-numbers", title: "Add Page Numbers", description: "Add running page numbers to your PDF.", tip: "Add running page numbers with your own prefix and starting index.", icon: "ListOrdered", iconColor: "#6366f1", iconBg: "#eef2ff", scripts: "pdf" },
  { slug: "redact-pdf", title: "Redact PDF", description: "Permanently black out sensitive text by exporting a new image-based PDF.", tip: "Permanently redacts matching terms by exporting a new image-based PDF.", icon: "EyeOff", iconColor: "#1f2937", iconBg: "#f3f4f6", scripts: "pdf" },
  { slug: "compare-pdfs", title: "Compare PDFs", description: "Find differences between two PDF documents.", tip: "Creates HTML and TXT reports with OCR fallback for low-text or scanned PDFs.", icon: "GitCompare", iconColor: "#0891b2", iconBg: "#ecfeff", scripts: "pdf" },
  { slug: "pdf-overlay", title: "PDF Overlay", description: "Overlay another PDF on top of every page or match page-to-page.", tip: "Overlay another PDF on top of every page or match page-to-page.", icon: "Layers3", iconColor: "#2563eb", iconBg: "#eff6ff", scripts: "pdf" },

  // PDF Extra
  { slug: "compress-pdf", title: "Compress PDF", description: "Reduce PDF file size with balanced recompression.", tip: "Reduce size with balanced JPEG recompression.", icon: "Minimize2", iconColor: "#3b82f6", iconBg: "#eff6ff", scripts: "pdf" },
  { slug: "extract-images", title: "Extract PDF Images", description: "Pull embedded images from your PDF.", tip: "Pulls embedded images directly and falls back to page snapshots when needed.", icon: "GalleryHorizontal", iconColor: "#8b5cf6", iconBg: "#f5f3ff", scripts: "pdf" },
  { slug: "webpage-to-pdf", title: "Webpage to PDF", description: "Save any webpage as a clean PDF.", tip: "Fetches the page server-side, sanitizes it, and opens a print-ready same-origin preview.", icon: "Globe", iconColor: "#ec4899", iconBg: "#fdf2f8", scripts: "none" },
  { slug: "pdf-ocr", title: "PDF OCR", description: "Recognize text from scanned or image-only PDFs.", tip: "Recognizes text from scanned or image-only PDFs and exports clean page-by-page OCR text.", icon: "ScanSearch", iconColor: "#0891b2", iconBg: "#ecfeff", scripts: "pdf" },
  { slug: "create-pdf", title: "Create PDF", description: "Generate a fresh PDF from typed text or a TXT/MD file.", tip: "Generate a fresh PDF from typed text or a TXT/MD file.", icon: "SquarePen", iconColor: "#8b5cf6", iconBg: "#f5f3ff", scripts: "pdf" },
  { slug: "web-optimize-pdf", title: "Web Optimize PDF", description: "Aggressive optimization for web uploads and fast sharing.", tip: "Aggressive optimization for web uploads and fast sharing.", icon: "Rocket", iconColor: "#f59e0b", iconBg: "#fffbeb", scripts: "pdf" },

  // DOCX Tools
  { slug: "docx-to-html", title: "DOCX to HTML", description: "Export your Word document as a standalone web page.", tip: "Export as standalone web page.", icon: "Globe", iconColor: "#2563eb", iconBg: "#eff6ff", scripts: "docx" },
  { slug: "docx-to-text", title: "DOCX to Text", description: "Extract plain text from your Word document.", tip: "Strip formatting, keep raw text.", icon: "FileText", iconColor: "#f59e0b", iconBg: "#fffbeb", scripts: "docx" },
  { slug: "docx-to-markdown", title: "DOCX to Markdown", description: "Convert Word to Markdown for docs, wikis, and GitHub.", tip: "Great for docs, wikis, GitHub.", icon: "NotebookPen", iconColor: "#10b981", iconBg: "#ecfdf5", scripts: "docx" },
  { slug: "docx-to-pdf", title: "DOCX to PDF", description: "Open a print preview to save your Word document as PDF.", tip: "Print preview, save as PDF.", icon: "Printer", iconColor: "#e5322d", iconBg: "#fef2f2", scripts: "docx" },
  { slug: "txt-to-pdf", title: "TXT/MD to PDF", description: "Turn a text or Markdown file into an A4 PDF document.", tip: "Turn text to A4 PDF.", icon: "ScrollText", iconColor: "#ef4444", iconBg: "#fef2f2", scripts: "pdf" },
  { slug: "csv-to-html", title: "CSV to HTML Table", description: "Export CSV data as a styled standalone HTML table.", tip: "Standalone HTML table export.", icon: "TableProperties", iconColor: "#f59e0b", iconBg: "#fffbeb", scripts: "docx" },
];

/* ─── slug → ToolMeta lookup ─── */
const toolBySlug = Object.fromEntries(TOOL_REGISTRY.map((t) => [t.slug, t]));

/* ─── MAIN COMPONENT ─── */
export default function ToolPage() {
  const params = useParams();
  const slug = params.slug as string;
  const meta = toolBySlug[slug];

  const needsPdf = meta?.scripts === "pdf" || meta?.scripts === "both";
  const needsDocx = meta?.scripts === "docx" || meta?.scripts === "both";

  const pdfScripts = needsPdf
    ? [
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
      ]
    : [];
  const docxScripts = needsDocx
    ? [
        "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js",
      ]
    : [];

  const allScripts = [...new Set([...pdfScripts, ...docxScripts])];
  const ready = useScripts(allScripts);

  const [state, setState] = useState<Record<string, any>>({});
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((message: string) => setToast(message), []);

  const getTool = (key: string) => state[key] || {};
  const setTool = (key: string, value: Record<string, unknown>) =>
    setState((prev) => ({ ...prev, [key]: { ...prev[key], ...value } }));
  const setProgress = (key: string, progress: number, phase?: string) =>
    setTool(key, phase ? { progress, phase } : { progress });

  async function run(key: string, task: () => Promise<string>, options: { requiresLibs?: boolean } = {}) {
    if ((options.requiresLibs ?? true) && !ready && allScripts.length > 0) {
      setTool(key, { loading: false, status: "Libraries are still loading. Please try again.", statusType: "err" });
      return;
    }
    setTool(key, { loading: true, status: "", statusType: "", progress: 0, phase: "" });
    try {
      const message = await task();
      setTool(key, { loading: false, status: message, statusType: "ok" });
      showToast(message);
    } catch (error: any) {
      setTool(key, { loading: false, status: error?.message || "Something went wrong.", statusType: "err" });
    }
  }

  function pdfColor(value: string | undefined, fallback: string) {
    const { rgb } = window.PDFLib;
    const hex = normalizeHexColor(value, fallback).slice(1);
    const r = Number.parseInt(hex.slice(0, 2), 16) / 255;
    const g = Number.parseInt(hex.slice(2, 4), 16) / 255;
    const b = Number.parseInt(hex.slice(4, 6), 16) / 255;
    return rgb(r, g, b);
  }

  function resolvePageTargets(input: string | undefined, totalPages: number) {
    const normalized = (input || "all").trim().toLowerCase();
    if (!normalized || normalized === "all") return Array.from({ length: totalPages }, (_, i) => i + 1);
    const ordered = parseOrderedPageList(normalized, totalPages);
    if (!ordered.length) throw new Error('Enter a valid page number, range, or "all".');
    return ordered;
  }

  function getNumber(value: string | undefined, fallback: number) {
    const parsed = Number.parseFloat(value || "");
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function wrapText(font: any, text: string, size: number, maxWidth: number) {
    const lines: string[] = [];
    text.replace(/\r/g, "").split("\n").forEach((para) => {
      if (!para.trim()) { lines.push(""); return; }
      let current = "";
      para.split(/\s+/).forEach((word) => {
        const candidate = current ? `${current} ${word}` : word;
        if (!current || font.widthOfTextAtSize(candidate, size) <= maxWidth) { current = candidate; return; }
        lines.push(current);
        current = word;
      });
      if (current) lines.push(current);
    });
    return lines;
  }

  async function buildTextPdfBlob(title: string, body: string) {
    const { PDFDocument, StandardFonts } = window.PDFLib;
    const pdf = await PDFDocument.create();
    const regular = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const W = 595, H = 842, M = 50;
    const tSize = title ? 20 : 0, bSize = 11, tGap = title ? 18 : 0, bLH = 16, tLH = 26;
    const cW = W - M * 2;
    const tLines = title ? wrapText(bold, title, tSize, cW) : [];
    const bLines = wrapText(regular, body, bSize, cW);
    let page = pdf.addPage([W, H]);
    let y = H - M;
    tLines.forEach((line, i) => {
      if (y < M + tLH) { page = pdf.addPage([W, H]); y = H - M; }
      page.drawText(line, { x: M, y, size: tSize, font: bold, color: pdfColor("#1a1a2e", "#1a1a2e") });
      y -= tLH;
      if (i === tLines.length - 1) y -= tGap;
    });
    bLines.forEach((line) => {
      if (y < M + bLH) { page = pdf.addPage([W, H]); y = H - M; }
      if (line) page.drawText(line, { x: M, y, size: bSize, font: regular, color: pdfColor("#5f6368", "#5f6368") });
      y -= bLH;
    });
    return new Blob([await pdf.save()], { type: "application/pdf" });
  }

  /* ─── 404 ─── */
  if (!meta) {
    return (
      <div className="page-shell max-w-[680px]">
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f7f8fc] border border-black/[0.06] text-[#9aa0a6] mb-5">
            <UIcon name="Search" size={26} />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#1a1a2e] mb-2">Tool not found</h1>
          <p className="text-[14px] text-[#5f6368] mb-6">The tool &quot;{slug}&quot; doesn&apos;t exist.</p>
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-[#e5322d] px-6 py-3 text-[14px] font-bold text-white no-underline shadow-md shadow-[#e5322d]/15 transition-all hover:-translate-y-0.5 hover:bg-[#d42b26]">
            <UIcon name="ArrowLeft" size={14} />
            Back to All Tools
          </Link>
        </div>
      </div>
    );
  }

  /* ─── Tool body renderer ─── */
  const k = slug; // shorthand for state key
  const body = renderToolBody(k);

  function renderToolBody(key: string): React.ReactNode {
    switch (slug) {
      /* ═══ PDF TO TEXT ═══ */
      case "pdf-to-text":
        return (
          <>
            <FZone accept=".pdf" label="Choose a PDF" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <ProgressBar progress={getTool(key).progress || 0} label={getTool(key).phase || "Extracting text"} />
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn
              onClick={async () => {
                const file = getTool(key).file;
                if (!file) return;
                await run(key, async () => {
                  const extraction = await extractPdfTextWithOcrFallback(file, PDF_WORKER_SRC, {
                    onProgress: (p, l) => setProgress(key, Math.max(6, p), l || "Extracting text"),
                  });
                  dlText(`${stem(file.name)}.txt`, extraction.text);
                  setProgress(key, 100, extraction.source === "ocr" ? "OCR text ready" : "Text ready");
                  return extraction.source === "ocr"
                    ? `Low native text, OCR text exported from ${extraction.pageCount} page${extraction.pageCount === 1 ? "" : "s"}.`
                    : `${extraction.pageCount} page${extraction.pageCount === 1 ? "" : "s"} extracted to TXT.`;
                });
              }}
              disabled={!getTool(key).file} loading={getTool(key).loading} label="Extract Text"
            />
          </>
        );

      /* ═══ PDF TO IMAGES ═══ */
      case "pdf-to-images":
        return (
          <>
            <FZone accept=".pdf" label="Choose a PDF" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <div className="grid gap-2">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-[#9aa0a6]">Render quality (DPI)</div>
              <HInput type="number" min="72" max="300" value={getTool(key).dpi || "180"} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool(key, { dpi: e.target.value })} />
            </div>
            <ProgressBar progress={getTool(key).progress || 0} label="Rendering page images" />
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn
              onClick={async () => {
                const file = getTool(key).file; if (!file) return;
                const dpi = Number.parseInt(getTool(key).dpi || "180", 10) || 180;
                await run(key, async () => {
                  const rendered = await renderPdfPages(file, PDF_WORKER_SRC, dpi, { onProgress: (p) => setTool(key, { progress: p }) });
                  const zip = await buildPdfImageZip(rendered);
                  dlBlob(`${stem(file.name)}_images.zip`, zip);
                  setTool(key, { progress: 100 });
                  return `${rendered.length} page image${rendered.length === 1 ? "" : "s"} packaged in a ZIP.`;
                });
              }}
              disabled={!getTool(key).file} loading={getTool(key).loading} label="Create ZIP"
            />
          </>
        );

      /* ═══ PDF TO WORD ═══ */
      case "pdf-to-word":
        return (
          <>
            <FZone accept=".pdf" label="Choose a PDF" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <div className="grid gap-2">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-[#9aa0a6]">Output mode</div>
              <HSel value={getTool(key).mode || "layout"} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTool(key, { mode: e.target.value })}>
                <option value="layout">Best accuracy</option>
                <option value="editable">Editable text</option>
              </HSel>
            </div>
            <ProgressBar progress={getTool(key).progress || 0} label={getTool(key).phase || "Building Word output"} />
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn
              onClick={async () => {
                const file = getTool(key).file; if (!file) return;
                await run(key, async () => {
                  const mode = getTool(key).mode || "layout";
                  setTool(key, { phase: "Analyzing PDF text structure", progress: 8 });
                  const extraction = await extractPdfFile(file, PDF_WORKER_SRC, { onProgress: (p) => setTool(key, { progress: Math.round(p * 0.5) }) });
                  const extracted = extraction.text.replace(/--- Page \d+ ---/g, "").trim();
                  const lowText = extracted.length < 120;
                  const useLayout = mode === "layout" || (mode === "editable" && lowText);
                  let output: Blob;
                  if (useLayout) {
                    setTool(key, { phase: mode === "editable" && lowText ? "Low text, switching to page-faithful mode" : "Rendering page-faithful Word pages", progress: 55 });
                    const rendered = await renderPdfPages(file, PDF_WORKER_SRC, 180, { onProgress: (p) => setTool(key, { progress: 55 + Math.round(p * 0.45) }) });
                    output = await buildLayoutPdfDocx(rendered);
                  } else {
                    setTool(key, { phase: "Composing editable Word paragraphs", progress: 72 });
                    output = await buildEditablePdfDocx(extraction);
                    setTool(key, { progress: 100 });
                  }
                  dlBlob(`${stem(file.name)}.docx`, output);
                  return useLayout ? (mode === "editable" && lowText ? "Low text detected, created page-faithful DOCX." : "High-accuracy DOCX created.") : "Editable DOCX created.";
                });
              }}
              disabled={!getTool(key).file} loading={getTool(key).loading} label="Convert to DOCX"
            />
          </>
        );

      /* ═══ MERGE PDF ═══ */
      case "merge-pdf":
        return (
          <>
            <FZone accept=".pdf" label="Choose multiple PDFs" multi files={getTool(key).files} onFiles={(f: File[]) => setTool(key, { files: f })} />
            <FileListPreview files={getTool(key).files} icon="FileText" />
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn
              onClick={async () => {
                const files = getTool(key).files || []; if (files.length < 2) return;
                await run(key, async () => {
                  const { PDFDocument } = window.PDFLib;
                  const merged = await PDFDocument.create();
                  for (const f of files) { const src = await PDFDocument.load(await f.arrayBuffer()); const pages = await merged.copyPages(src, src.getPageIndices()); pages.forEach((p: any) => merged.addPage(p)); }
                  dlBlob("merged.pdf", new Blob([await merged.save()], { type: "application/pdf" }));
                  return `${files.length} PDFs merged.`;
                });
              }}
              disabled={!((getTool(key).files || []).length >= 2)} loading={getTool(key).loading} label="Merge PDFs"
            />
          </>
        );

      /* ═══ SPLIT PDF ═══ */
      case "split-pdf":
        return (
          <>
            <FZone accept=".pdf" label="Choose a PDF" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <HInput placeholder="Page range, e.g. 1-3, 5, 9" value={getTool(key).pages || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool(key, { pages: e.target.value })} />
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn
              onClick={async () => {
                const file = getTool(key).file; const pagesInput = getTool(key).pages || ""; if (!file || !pagesInput) return;
                await run(key, async () => {
                  const { PDFDocument } = window.PDFLib;
                  const src = await PDFDocument.load(await file.arrayBuffer());
                  const sel = parsePageRange(pagesInput, src.getPageCount());
                  if (!sel.length) throw new Error("Enter at least one valid page range.");
                  const out = await PDFDocument.create();
                  const pages = await out.copyPages(src, sel.map((p) => p - 1));
                  pages.forEach((p: any) => out.addPage(p));
                  dlBlob(`${stem(file.name)}_split.pdf`, new Blob([await out.save()], { type: "application/pdf" }));
                  return `${sel.length} page${sel.length === 1 ? "" : "s"} extracted.`;
                });
              }}
              disabled={!getTool(key).file || !getTool(key).pages} loading={getTool(key).loading} label="Extract Pages"
            />
          </>
        );

      /* ═══ IMAGES TO PDF ═══ */
      case "images-to-pdf":
        return (
          <>
            <FZone accept="image/png,image/jpeg" label="Choose JPG or PNG images" multi files={getTool(key).files} onFiles={(f: File[]) => setTool(key, { files: f })} />
            <FileListPreview files={getTool(key).files} icon="Image" />
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn
              onClick={async () => {
                const files = getTool(key).files || []; if (!files.length) return;
                await run(key, async () => {
                  const { PDFDocument } = window.PDFLib;
                  const pdf = await PDFDocument.create();
                  for (const f of files) { const b = await f.arrayBuffer(); const img = f.type === "image/png" ? await pdf.embedPng(b) : await pdf.embedJpg(b); const page = pdf.addPage([img.width, img.height]); page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height }); }
                  dlBlob("images.pdf", new Blob([await pdf.save()], { type: "application/pdf" }));
                  return `${files.length} image${files.length === 1 ? "" : "s"} converted to PDF.`;
                });
              }}
              disabled={!((getTool(key).files || []).length > 0)} loading={getTool(key).loading} label="Create PDF"
            />
          </>
        );

      /* ═══ ROTATE PDF ═══ */
      case "rotate-pdf":
        return (
          <>
            <FZone accept=".pdf" label="Choose a PDF" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <HSel value={getTool(key).deg || "90"} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTool(key, { deg: e.target.value })}>
              <option value="90">Rotate 90° clockwise</option>
              <option value="180">Rotate 180°</option>
              <option value="270">Rotate 270°</option>
            </HSel>
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn
              onClick={async () => {
                const file = getTool(key).file; if (!file) return;
                await run(key, async () => {
                  const { PDFDocument, degrees } = window.PDFLib;
                  const pdf = await PDFDocument.load(await file.arrayBuffer());
                  const amt = Number.parseInt(getTool(key).deg || "90", 10);
                  pdf.getPages().forEach((p: any) => { const c = p.getRotation().angle; p.setRotation(degrees((c + amt) % 360)); });
                  dlBlob(`${stem(file.name)}_rotated.pdf`, new Blob([await pdf.save()], { type: "application/pdf" }));
                  return `Rotated every page by ${amt}°.`;
                });
              }}
              disabled={!getTool(key).file} loading={getTool(key).loading} label="Rotate PDF"
            />
          </>
        );

      /* ═══ PROTECT PDF ═══ */
      case "protect-pdf":
        return (
          <>
            <FZone accept=".pdf" label="Choose a PDF" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <HInput type="password" placeholder="Enter a secure password" value={getTool(key).password || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool(key, { password: e.target.value })} />
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn onClick={async () => {
              const file = getTool(key).file; const pw = getTool(key).password; if (!file || !pw) return;
              await run(key, async () => {
                const pdfLibEncrypt = await import("pdf-lib-plus-encrypt");
                const pdf = await pdfLibEncrypt.PDFDocument.load(await file.arrayBuffer());
                const b = await pdf.save({ userPassword: pw, ownerPassword: pw } as any);
                dlBlob(`${stem(file.name)}_locked.pdf`, new Blob([b], { type: "application/pdf" }));
                return "PDF locked successfully.";
              });
            }} disabled={!getTool(key).file || !getTool(key).password} loading={getTool(key).loading} label="Protect PDF" />
          </>
        );

      /* ═══ UNLOCK PDF ═══ */
      case "unlock-pdf":
        return (
          <>
            <FZone accept=".pdf" label="Choose locked PDF" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <HInput type="password" placeholder="Enter the current password" value={getTool(key).password || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool(key, { password: e.target.value })} />
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn onClick={async () => {
              const file = getTool(key).file; const pw = getTool(key).password; if (!file || !pw) return;
              await run(key, async () => {
                const pdfLibEncrypt = await import("pdf-lib-plus-encrypt");
                const pdf = await pdfLibEncrypt.PDFDocument.load(await file.arrayBuffer(), { password: pw } as any);
                const b = await pdf.save();
                dlBlob(`${stem(file.name)}_unlocked.pdf`, new Blob([b], { type: "application/pdf" }));
                return "PDF unlocked permanently.";
              });
            }} disabled={!getTool(key).file || !getTool(key).password} loading={getTool(key).loading} label="Unlock PDF" />
          </>
        );

      /* ═══ EDIT PDF ═══ */
      case "edit-pdf":
        return (
          <>
            <FZone accept=".pdf" label="Choose a PDF" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <TextAreaField placeholder="Text to add to the PDF" value={getTool(key).text || ""} onChange={(e) => setTool(key, { text: e.target.value })} />
            <div className="grid gap-3 md:grid-cols-2">
              <HInput placeholder='Pages: "all" or "1-3, 5"' value={getTool(key).pages || "all"} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool(key, { pages: e.target.value })} />
              <HInput type="number" min="8" max="72" placeholder="Font size" value={getTool(key).size || "18"} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool(key, { size: e.target.value })} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <HSel value={getTool(key).placement || "top-right"} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTool(key, { placement: e.target.value })}>
                {PLACEMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </HSel>
              <HInput placeholder="Text color (hex)" value={getTool(key).color || "#ff6b6b"} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool(key, { color: e.target.value })} />
            </div>
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn onClick={async () => {
              const file = getTool(key).file; const text = (getTool(key).text || "").trim(); if (!file || !text) return;
              await run(key, async () => {
                const { PDFDocument, StandardFonts } = window.PDFLib;
                const pdf = await PDFDocument.load(await file.arrayBuffer());
                const font = await pdf.embedFont(StandardFonts.Helvetica);
                const size = Math.max(8, Math.min(72, getNumber(getTool(key).size, 18)));
                const targets = resolvePageTargets(getTool(key).pages, pdf.getPageCount());
                const placement = (getTool(key).placement || "top-right") as PlacementPreset;
                const color = pdfColor(getTool(key).color, "#ff6b6b");
                const lines = text.split("\n").filter(Boolean);
                targets.forEach((pn) => {
                  const page = pdf.getPage(pn - 1); const lh = size * 1.2;
                  const tw = Math.max(...lines.map((l) => font.widthOfTextAtSize(l, size)));
                  const th = lines.length * lh;
                  const pos = resolvePlacement(placement, page.getWidth(), page.getHeight(), tw, th);
                  lines.forEach((l, li) => { page.drawText(l, { x: pos.x, y: pos.y + th - lh * (li + 1), size, font, color }); });
                });
                dlBlob(`${stem(file.name)}_edited.pdf`, new Blob([await pdf.save()], { type: "application/pdf" }));
                return `Added text to ${targets.length} page${targets.length === 1 ? "" : "s"}.`;
              });
            }} disabled={!getTool(key).file || !getTool(key).text} loading={getTool(key).loading} label="Edit PDF" />
          </>
        );

      /* ═══ SIGN PDF ═══ */
      case "sign-pdf":
        return (
          <>
            <FZone accept=".pdf" label="Choose a PDF" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <HSel value={getTool(key).mode || "typed"} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTool(key, { mode: e.target.value })}>
              <option value="typed">Typed signature</option>
              <option value="image">Image signature</option>
            </HSel>
            {(getTool(key).mode || "typed") === "typed" ? (
              <HInput placeholder="Type the signature text" value={getTool(key).text || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool(key, { text: e.target.value })} />
            ) : (
              <FZone accept="image/png,image/jpeg" label="Choose a signature image" file={getTool(key).signatureFile} onFile={(f: File) => setTool(key, { signatureFile: f })} />
            )}
            <div className="grid gap-3 md:grid-cols-2">
              <HInput placeholder='Pages: "all" or "1-3"' value={getTool(key).pages || "all"} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool(key, { pages: e.target.value })} />
              <HInput type="number" min="60" max="280" placeholder="Signature width" value={getTool(key).width || "150"} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool(key, { width: e.target.value })} />
            </div>
            <HSel value={getTool(key).placement || "bottom-right"} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTool(key, { placement: e.target.value })}>
              {PLACEMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </HSel>
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn onClick={async () => {
              const file = getTool(key).file; const mode = getTool(key).mode || "typed"; if (!file) return;
              await run(key, async () => {
                const { PDFDocument, StandardFonts } = window.PDFLib;
                const pdf = await PDFDocument.load(await file.arrayBuffer());
                const targets = resolvePageTargets(getTool(key).pages, pdf.getPageCount());
                const placement = (getTool(key).placement || "bottom-right") as PlacementPreset;
                if (mode === "typed") {
                  const sig = (getTool(key).text || "").trim(); if (!sig) throw new Error("Type a signature first.");
                  const font = await pdf.embedFont(StandardFonts.TimesRomanItalic);
                  const size = Math.max(18, Math.min(42, getNumber(getTool(key).width, 150) / 5));
                  targets.forEach((pn) => { const page = pdf.getPage(pn - 1); const w = font.widthOfTextAtSize(sig, size); const pos = resolvePlacement(placement, page.getWidth(), page.getHeight(), w, size * 1.2); page.drawText(sig, { x: pos.x, y: pos.y, size, font, color: pdfColor("#101418", "#101418") }); });
                } else {
                  const sf = getTool(key).signatureFile as File | undefined; if (!sf) throw new Error("Upload a signature image first.");
                  const dW = Math.max(60, Math.min(280, getNumber(getTool(key).width, 150)));
                  const bytes = await sf.arrayBuffer(); const img = sf.type === "image/png" ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
                  targets.forEach((pn) => { const page = pdf.getPage(pn - 1); const w = Math.min(dW, page.getWidth() - 72); const h = w * (img.height / img.width); const pos = resolvePlacement(placement, page.getWidth(), page.getHeight(), w, h); page.drawImage(img, { x: pos.x, y: pos.y, width: w, height: h }); });
                }
                dlBlob(`${stem(file.name)}_signed.pdf`, new Blob([await pdf.save()], { type: "application/pdf" }));
                return `Signature applied to ${targets.length} page${targets.length === 1 ? "" : "s"}.`;
              });
            }} disabled={!getTool(key).file || ((getTool(key).mode || "typed") === "typed" ? !getTool(key).text : !getTool(key).signatureFile)} loading={getTool(key).loading} label="Sign PDF" />
          </>
        );

      /* ═══ ADD WATERMARK ═══ */
      case "add-watermark":
        return (
          <>
            <FZone accept=".pdf" label="Choose a PDF" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <HInput placeholder="Watermark text" value={getTool(key).text || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool(key, { text: e.target.value })} />
            <div className="grid gap-3 md:grid-cols-2">
              <HInput type="number" min="12" max="96" placeholder="Font size" value={getTool(key).size || "42"} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool(key, { size: e.target.value })} />
              <HInput type="number" min="0.05" max="1" step="0.05" placeholder="Opacity" value={getTool(key).opacity || "0.18"} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool(key, { opacity: e.target.value })} />
            </div>
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn onClick={async () => {
              const file = getTool(key).file; const text = (getTool(key).text || "").trim(); if (!file || !text) return;
              await run(key, async () => {
                const { PDFDocument, StandardFonts, degrees } = window.PDFLib;
                const pdf = await PDFDocument.load(await file.arrayBuffer());
                const font = await pdf.embedFont(StandardFonts.HelveticaBold);
                const size = Math.max(12, Math.min(96, getNumber(getTool(key).size, 42)));
                const opacity = Math.max(0.05, Math.min(1, getNumber(getTool(key).opacity, 0.18)));
                const tw = font.widthOfTextAtSize(text, size);
                pdf.getPages().forEach((page: any) => {
                  const pos = resolvePlacement("center", page.getWidth(), page.getHeight(), tw, size * 1.4);
                  page.drawText(text, { x: pos.x, y: pos.y, size, font, color: pdfColor("#ff6b6b", "#ff6b6b"), opacity, rotate: degrees(-35) });
                });
                dlBlob(`${stem(file.name)}_watermarked.pdf`, new Blob([await pdf.save()], { type: "application/pdf" }));
                return "Watermark added to every page.";
              });
            }} disabled={!getTool(key).file || !getTool(key).text} loading={getTool(key).loading} label="Add Watermark" />
          </>
        );

      /* ═══ PAGE NUMBERS ═══ */
      case "page-numbers":
        return (
          <>
            <FZone accept=".pdf" label="Choose a PDF" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <div className="grid gap-3 md:grid-cols-2">
              <HInput placeholder='Prefix, e.g. "Page "' value={getTool(key).prefix || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool(key, { prefix: e.target.value })} />
              <HInput type="number" min="1" placeholder="Start number" value={getTool(key).start || "1"} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool(key, { start: e.target.value })} />
            </div>
            <HSel value={getTool(key).placement || "bottom-center"} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTool(key, { placement: e.target.value })}>
              {PLACEMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </HSel>
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn onClick={async () => {
              const file = getTool(key).file; if (!file) return;
              await run(key, async () => {
                const { PDFDocument, StandardFonts } = window.PDFLib;
                const pdf = await PDFDocument.load(await file.arrayBuffer());
                const font = await pdf.embedFont(StandardFonts.Helvetica);
                const placement = (getTool(key).placement || "bottom-center") as PlacementPreset;
                const prefix = getTool(key).prefix || ""; const start = Math.max(1, Number.parseInt(getTool(key).start || "1", 10) || 1);
                const size = 12;
                pdf.getPages().forEach((page: any, i: number) => {
                  const t = `${prefix}${start + i}`; const w = font.widthOfTextAtSize(t, size);
                  const pos = resolvePlacement(placement, page.getWidth(), page.getHeight(), w, size * 1.2);
                  page.drawText(t, { x: pos.x, y: pos.y, size, font, color: pdfColor("#5f6368", "#5f6368") });
                });
                dlBlob(`${stem(file.name)}_numbered.pdf`, new Blob([await pdf.save()], { type: "application/pdf" }));
                return `Page numbers added to ${pdf.getPageCount()} page${pdf.getPageCount() === 1 ? "" : "s"}.`;
              });
            }} disabled={!getTool(key).file} loading={getTool(key).loading} label="Add Page Numbers" />
          </>
        );

      /* ═══ REDACT PDF ═══ */
      case "redact-pdf":
        return (
          <>
            <FZone accept=".pdf" label="Choose a PDF" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <TextAreaField placeholder="Terms to redact, separated by commas" value={getTool(key).terms || ""} onChange={(e) => setTool(key, { terms: e.target.value })} />
            <ProgressBar progress={getTool(key).progress || 0} label="Redacting PDF" />
            <HelperNote>Creates a permanently redacted raster PDF so covered text is not left behind.</HelperNote>
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn onClick={async () => {
              const file = getTool(key).file; const terms = parseTerms(getTool(key).terms || ""); if (!file || !terms.length) return;
              await run(key, async () => {
                const result = await createRedactedPdf(file, PDF_WORKER_SRC, terms, { onProgress: (p) => setProgress(key, p, "Creating redacted PDF") });
                if (!result.matches) throw new Error("No matching text was found.");
                dlBlob(`${stem(file.name)}_redacted.pdf`, result.blob);
                setProgress(key, 100, "Redaction complete");
                return `${result.matches} redaction match${result.matches === 1 ? "" : "es"} applied.`;
              });
            }} disabled={!getTool(key).file || !getTool(key).terms} loading={getTool(key).loading} label="Redact PDF" />
          </>
        );

      /* ═══ COMPARE PDFS ═══ */
      case "compare-pdfs":
        return (
          <>
            <FZone accept=".pdf" label="Choose the first PDF" file={getTool(key).left} onFile={(f: File) => setTool(key, { left: f })} />
            <FZone accept=".pdf" label="Choose the second PDF" file={getTool(key).right} onFile={(f: File) => setTool(key, { right: f })} />
            <ProgressBar progress={getTool(key).progress || 0} label={getTool(key).phase || "Comparing PDFs"} />
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn onClick={async () => {
              const left = getTool(key).left; const right = getTool(key).right; if (!left || !right) return;
              await run(key, async () => {
                const result = await comparePdfFiles(left, right, PDF_WORKER_SRC, { onProgress: (p, l) => setProgress(key, p, l || "Comparing PDFs") });
                const zip = new (window.JSZip as any)();
                zip.file("comparison-report.html", result.html); zip.file("comparison-report.txt", result.text);
                dlBlob("pdf-comparison-report.zip", await zip.generateAsync({ type: "blob" }));
                setProgress(key, 100, "Comparison ready");
                const ocrNote = result.sourceA === "ocr" || result.sourceB === "ocr" ? " OCR fallback was used for low-text pages." : "";
                return result.identical ? `The PDFs appear identical.${ocrNote}` : `Similarity: ${Math.round(result.score * 100)}%.${ocrNote}`;
              });
            }} disabled={!getTool(key).left || !getTool(key).right} loading={getTool(key).loading} label="Compare PDFs" />
          </>
        );

      /* ═══ REMOVE PAGES ═══ */
      case "remove-pages":
        return (
          <>
            <FZone accept=".pdf" label="Choose a PDF" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <HInput placeholder="Pages to remove, e.g. 2, 4-7" value={getTool(key).pages || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool(key, { pages: e.target.value })} />
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn onClick={async () => {
              const file = getTool(key).file; const pi = getTool(key).pages || ""; if (!file || !pi) return;
              await run(key, async () => {
                const { PDFDocument } = window.PDFLib;
                const src = await PDFDocument.load(await file.arrayBuffer());
                const removeSet = new Set(parsePageRange(pi, src.getPageCount()));
                if (!removeSet.size) throw new Error("Enter valid page numbers.");
                const keep = src.getPageIndices().map((i) => i + 1).filter((n) => !removeSet.has(n));
                if (!keep.length) throw new Error("Cannot remove every page.");
                const out = await PDFDocument.create();
                const cp = await out.copyPages(src, keep.map((p) => p - 1));
                cp.forEach((p: any) => out.addPage(p));
                dlBlob(`${stem(file.name)}_trimmed.pdf`, new Blob([await out.save()], { type: "application/pdf" }));
                return `${removeSet.size} page${removeSet.size === 1 ? "" : "s"} removed.`;
              });
            }} disabled={!getTool(key).file || !getTool(key).pages} loading={getTool(key).loading} label="Remove Pages" />
          </>
        );

      /* ═══ REARRANGE PAGES ═══ */
      case "rearrange-pages":
        return (
          <>
            <FZone accept=".pdf" label="Choose a PDF" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <HInput placeholder="New page order, e.g. 3,1,2,4-6" value={getTool(key).pages || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool(key, { pages: e.target.value })} />
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn onClick={async () => {
              const file = getTool(key).file; const pi = getTool(key).pages || ""; if (!file || !pi) return;
              await run(key, async () => {
                const { PDFDocument } = window.PDFLib;
                const src = await PDFDocument.load(await file.arrayBuffer());
                const ordered = parseOrderedPageList(pi, src.getPageCount());
                if (!ordered.length) throw new Error("Enter a valid new page order.");
                const out = await PDFDocument.create();
                const cp = await out.copyPages(src, ordered.map((p) => p - 1));
                cp.forEach((p: any) => out.addPage(p));
                dlBlob(`${stem(file.name)}_reordered.pdf`, new Blob([await out.save()], { type: "application/pdf" }));
                return `${ordered.length} page${ordered.length === 1 ? "" : "s"} rearranged.`;
              });
            }} disabled={!getTool(key).file || !getTool(key).pages} loading={getTool(key).loading} label="Rearrange Pages" />
          </>
        );

      /* ═══ PDF OVERLAY ═══ */
      case "pdf-overlay":
        return (
          <>
            <FZone accept=".pdf" label="Choose the base PDF" file={getTool(key).baseFile} onFile={(f: File) => setTool(key, { baseFile: f })} />
            <FZone accept=".pdf" label="Choose the overlay PDF" file={getTool(key).overlayFile} onFile={(f: File) => setTool(key, { overlayFile: f })} />
            <HSel value={getTool(key).mode || "first"} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTool(key, { mode: e.target.value })}>
              <option value="first">Use overlay page 1 on every page</option>
              <option value="match">Match overlay pages by number</option>
            </HSel>
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn onClick={async () => {
              const bf = getTool(key).baseFile; const of2 = getTool(key).overlayFile; if (!bf || !of2) return;
              await run(key, async () => {
                const { PDFDocument } = window.PDFLib;
                const out = await PDFDocument.load(await bf.arrayBuffer());
                const ep = await out.embedPdf(await of2.arrayBuffer());
                const mode = getTool(key).mode || "first";
                if (!ep.length) throw new Error("Overlay PDF has no pages.");
                out.getPages().forEach((page: any, i: number) => {
                  const op = mode === "match" ? ep[Math.min(i, ep.length - 1)] : ep[0];
                  const s = Math.min(page.getWidth() / op.width, page.getHeight() / op.height);
                  const dw = op.width * s; const dh = op.height * s;
                  page.drawPage(op, { x: (page.getWidth() - dw) / 2, y: (page.getHeight() - dh) / 2, width: dw, height: dh, opacity: 1 });
                });
                dlBlob(`${stem(bf.name)}_overlay.pdf`, new Blob([await out.save()], { type: "application/pdf" }));
                return "Overlay PDF created.";
              });
            }} disabled={!getTool(key).baseFile || !getTool(key).overlayFile} loading={getTool(key).loading} label="Apply Overlay" />
          </>
        );

      /* ═══ COMPRESS PDF ═══ */
      case "compress-pdf":
        return (
          <>
            <FZone accept=".pdf" label="Choose a PDF" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <div className="grid gap-3 md:grid-cols-2">
              <HInput type="number" min="96" max="220" placeholder="Render DPI" value={getTool(key).dpi || "140"} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool(key, { dpi: e.target.value })} />
              <HInput type="number" min="0.3" max="0.95" step="0.05" placeholder="JPEG quality" value={getTool(key).quality || "0.72"} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool(key, { quality: e.target.value })} />
            </div>
            <ProgressBar progress={getTool(key).progress || 0} label="Compressing PDF" />
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn onClick={async () => {
              const file = getTool(key).file; if (!file) return;
              await run(key, async () => {
                const result = await optimizePdfForWeb(file, PDF_WORKER_SRC, { dpi: Math.max(96, Math.min(220, Number.parseInt(getTool(key).dpi || "140", 10) || 140)), quality: Math.max(0.3, Math.min(0.95, getNumber(getTool(key).quality, 0.72))), onProgress: (p) => setProgress(key, p, "Compressing PDF") });
                dlBlob(`${stem(file.name)}_compressed.pdf`, result.blob);
                setProgress(key, 100, "Compressed");
                return `Compressed from ${formatBytes(result.originalBytes)} to ${formatBytes(result.optimizedBytes)}.`;
              });
            }} disabled={!getTool(key).file} loading={getTool(key).loading} label="Compress PDF" />
          </>
        );

      /* ═══ EXTRACT IMAGES ═══ */
      case "extract-images":
        return (
          <>
            <FZone accept=".pdf" label="Choose a PDF" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <ProgressBar progress={getTool(key).progress || 0} label="Scanning PDF image objects" />
            <HelperNote>If the PDF has no embedded image objects, page snapshots are exported instead.</HelperNote>
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn onClick={async () => {
              const file = getTool(key).file; if (!file) return;
              await run(key, async () => {
                const result = await extractPdfImages(file, PDF_WORKER_SRC, { onProgress: (p) => setProgress(key, p, "Reading embedded images") });
                dlBlob(`${stem(file.name)}_images.zip`, result.zip);
                setProgress(key, 100, "ZIP ready");
                return result.fallbackUsed ? "No embedded images found, page snapshots exported." : `${result.extractedCount} image${result.extractedCount === 1 ? "" : "s"} extracted.`;
              });
            }} disabled={!getTool(key).file} loading={getTool(key).loading} label="Extract Images" />
          </>
        );

      /* ═══ WEBPAGE TO PDF ═══ */
      case "webpage-to-pdf":
        return (
          <>
            <HInput type="url" placeholder="https://example.com/article" value={getTool(key).url || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool(key, { url: e.target.value })} />
            <HelperNote>The page is fetched on the server, converted into a print-ready view, and opened in a same-origin print window.</HelperNote>
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn onClick={async () => {
              const url = (getTool(key).url || "").trim(); if (!url) return;
              await run(key, async () => {
                const res = await fetch("/api/webpage-capture", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
                const payload = await res.json();
                if (!res.ok) throw new Error(payload?.error || "Could not prepare that webpage.");
                openPrintWindow(payload.html, payload.title || "Webpage to PDF");
                return "Print preview opened. Save as PDF from the browser dialog.";
              }, { requiresLibs: false });
            }} disabled={!getTool(key).url} loading={getTool(key).loading} label="Webpage to PDF" />
          </>
        );

      /* ═══ PDF OCR ═══ */
      case "pdf-ocr":
        return (
          <>
            <FZone accept=".pdf" label="Choose a PDF" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <ProgressBar progress={getTool(key).progress || 0} label={getTool(key).phase || "Running OCR"} />
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn onClick={async () => {
              const file = getTool(key).file; if (!file) return;
              await run(key, async () => {
                const result = await runPdfOcr(file, PDF_WORKER_SRC, { onProgress: (p, l) => setProgress(key, p, l || "Running OCR") });
                dlText(`${stem(file.name)}_ocr.txt`, result.text);
                setProgress(key, 100, "OCR ready");
                return `OCR completed for ${result.pageCount} page${result.pageCount === 1 ? "" : "s"}.`;
              });
            }} disabled={!getTool(key).file} loading={getTool(key).loading} label="Run OCR" />
          </>
        );

      /* ═══ CREATE PDF ═══ */
      case "create-pdf":
        return (
          <>
            <HInput placeholder="Optional title" value={getTool(key).title || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool(key, { title: e.target.value })} />
            <TextAreaField placeholder="Type or paste the text you want in the PDF..." value={getTool(key).body || ""} onChange={(e) => setTool(key, { body: e.target.value })} />
            <FZone accept=".txt,.md" label="or upload a TXT/MD file" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn onClick={async () => {
              const title = getTool(key).title || ""; const inlineBody = (getTool(key).body || "").trim(); const sf = getTool(key).file as File | undefined;
              await run(key, async () => {
                const body = inlineBody || (sf ? await sf.text() : "");
                if (!body.trim()) throw new Error("Add some text or upload a file first.");
                const blob = await buildTextPdfBlob(title.trim(), body);
                dlBlob(`${stem(sf?.name || "created-document")}.pdf`, blob);
                return "PDF created successfully.";
              });
            }} disabled={!getTool(key).body && !getTool(key).file} loading={getTool(key).loading} label="Create PDF" />
          </>
        );

      /* ═══ WEB OPTIMIZE PDF ═══ */
      case "web-optimize-pdf":
        return (
          <>
            <FZone accept=".pdf" label="Choose a PDF" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <div className="grid gap-3 md:grid-cols-2">
              <HInput type="number" min="72" max="180" placeholder="Render DPI" value={getTool(key).dpi || "110"} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool(key, { dpi: e.target.value })} />
              <HInput type="number" min="0.2" max="0.85" step="0.05" placeholder="JPEG quality" value={getTool(key).quality || "0.55"} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool(key, { quality: e.target.value })} />
            </div>
            <ProgressBar progress={getTool(key).progress || 0} label="Optimizing for web" />
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn onClick={async () => {
              const file = getTool(key).file; if (!file) return;
              await run(key, async () => {
                const result = await optimizePdfForWeb(file, PDF_WORKER_SRC, { dpi: Math.max(72, Math.min(180, Number.parseInt(getTool(key).dpi || "110", 10) || 110)), quality: Math.max(0.2, Math.min(0.85, getNumber(getTool(key).quality, 0.55))), grayscale: true, onProgress: (p) => setProgress(key, p, "Optimizing for web") });
                dlBlob(`${stem(file.name)}_web-optimized.pdf`, result.blob);
                setProgress(key, 100, "Web PDF ready");
                return `Web-optimized from ${formatBytes(result.originalBytes)} to ${formatBytes(result.optimizedBytes)}.`;
              });
            }} disabled={!getTool(key).file} loading={getTool(key).loading} label="Web Optimize" />
          </>
        );

      /* ═══ DOCX TO HTML ═══ */
      case "docx-to-html":
        return (
          <>
            <FZone accept=".docx" label="Choose a DOCX" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn onClick={async () => {
              const file = getTool(key).file; if (!file) return;
              await run(key, async () => {
                const htmlBody = await convertDocxToRichHtml(window.mammoth, await file.arrayBuffer());
                const page = buildStandaloneHtml(stem(file.name), htmlBody);
                dlText(`${stem(file.name)}.html`, page);
                return "Standalone HTML exported.";
              });
            }} disabled={!getTool(key).file} loading={getTool(key).loading} label="Export HTML" />
          </>
        );

      /* ═══ DOCX TO TEXT ═══ */
      case "docx-to-text":
        return (
          <>
            <FZone accept=".docx" label="Choose a DOCX" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn onClick={async () => {
              const file = getTool(key).file; if (!file) return;
              await run(key, async () => {
                const result = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
                dlText(`${stem(file.name)}.txt`, result.value);
                return "Plain text extracted.";
              });
            }} disabled={!getTool(key).file} loading={getTool(key).loading} label="Extract Text" />
          </>
        );

      /* ═══ DOCX TO MARKDOWN ═══ */
      case "docx-to-markdown":
        return (
          <>
            <FZone accept=".docx" label="Choose a DOCX" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn onClick={async () => {
              const file = getTool(key).file; if (!file) return;
              await run(key, async () => {
                const htmlBody = await convertDocxToRichHtml(window.mammoth, await file.arrayBuffer());
                const md = htmlToMarkdown(htmlBody);
                dlText(`${stem(file.name)}.md`, md);
                return "Markdown exported.";
              });
            }} disabled={!getTool(key).file} loading={getTool(key).loading} label="Export Markdown" />
          </>
        );

      /* ═══ DOCX TO PDF ═══ */
      case "docx-to-pdf":
        return (
          <>
            <FZone accept=".docx" label="Choose a DOCX" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn onClick={async () => {
              const file = getTool(key).file; if (!file) return;
              let preview: Window | null = null;
              try { preview = openPrintPreviewWindow(`${stem(file.name)} Preview`); } catch (error: any) {
                setTool(key, { status: error?.message || "Could not open preview.", statusType: "err" }); return;
              }
              await run(key, async () => {
                try {
                  const htmlBody = await convertDocxToRichHtml(window.mammoth, await file.arrayBuffer());
                  const page = buildStandaloneHtml(stem(file.name), htmlBody);
                  preview?.document.open(); preview?.document.write(page); preview?.document.close();
                  window.setTimeout(() => preview?.print(), 180);
                  return "Print preview opened. Save as PDF from dialog.";
                } catch (error) { preview?.close(); throw error; }
              });
            }} disabled={!getTool(key).file} loading={getTool(key).loading} label="Open PDF Preview" />
          </>
        );

      /* ═══ TXT/MD TO PDF ═══ */
      case "txt-to-pdf":
        return (
          <>
            <FZone accept=".txt,.md" label="Choose a TXT or MD file" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn onClick={async () => {
              const file = getTool(key).file; if (!file) return;
              await run(key, async () => {
                const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
                const text = await file.text();
                const pdf = await PDFDocument.create();
                const font = await pdf.embedFont(StandardFonts.Helvetica);
                const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
                const fSize = 11, lh = 16, m = 54, W = 595, H = 842, mW = W - m * 2;
                const lines: string[] = [];
                text.split("\n").forEach((line: string) => {
                  if (!line.trim()) { lines.push(""); return; }
                  let cur = "";
                  for (const word of line.split(/\s+/)) { const c = cur ? `${cur} ${word}` : word; if (font.widthOfTextAtSize(c, fSize) > mW && cur) { lines.push(cur); cur = word; } else { cur = c; } }
                  if (cur) lines.push(cur);
                });
                let page = pdf.addPage([W, H]); let y = H - m;
                page.drawText(stem(file.name), { x: m, y, size: 18, font: bold, color: rgb(0.1, 0.1, 0.18) });
                y -= 28;
                page.drawLine({ start: { x: m, y }, end: { x: W - m, y }, thickness: 0.8, color: rgb(0.85, 0.85, 0.88) });
                y -= 18;
                for (const line of lines) {
                  if (y < m + lh) { page = pdf.addPage([W, H]); y = H - m; }
                  if (line) page.drawText(line, { x: m, y, size: fSize, font, color: rgb(0.37, 0.39, 0.42) });
                  y -= lh;
                }
                dlBlob(`${stem(file.name)}.pdf`, new Blob([await pdf.save()], { type: "application/pdf" }));
                return "PDF generated.";
              });
            }} disabled={!getTool(key).file} loading={getTool(key).loading} label="Create PDF" />
          </>
        );

      /* ═══ CSV TO HTML ═══ */
      case "csv-to-html":
        return (
          <>
            <FZone accept=".csv" label="Choose a CSV file" file={getTool(key).file} onFile={(f: File) => setTool(key, { file: f })} />
            <CsvPreview rows={getTool(key).preview || []} />
            <CStat msg={getTool(key).status} type={getTool(key).statusType} />
            <HBtn onClick={async () => {
              const file = getTool(key).file; if (!file) return;
              await run(key, async () => {
                const rows = parseCsv(await file.text());
                if (!rows.length) throw new Error("The CSV file appears empty.");
                const [header, ...body] = rows;
                setTool(key, { preview: rows.slice(0, 5) });
                const bodyHtml = `<p>${body.length.toLocaleString()} row${body.length === 1 ? "" : "s"} from <strong>${esc(file.name)}</strong>.</p><table><thead><tr>${header.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
                dlText(`${stem(file.name)}.html`, buildStandaloneHtml(stem(file.name), bodyHtml));
                return `${body.length.toLocaleString()} CSV row${body.length === 1 ? "" : "s"} exported to HTML.`;
              });
            }} disabled={!getTool(key).file} loading={getTool(key).loading} label="Export HTML" />
          </>
        );

      default:
        return <p className="text-[#9aa0a6]">This tool is not implemented yet.</p>;
    }
  }

  return (
    <>
      <ToolPageLayout
        title={meta.title}
        description={meta.description}
        icon={<UIcon name={meta.icon as any} size={24} />}
        iconColor={meta.iconColor}
        iconBg={meta.iconBg}
        tip={meta.tip}
      >
        {body}
      </ToolPageLayout>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </>
  );
}
