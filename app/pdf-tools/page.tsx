"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useCallback, useState } from "react";
import Link from "next/link";
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
import { dlBlob, dlText, parsePageRange, stem } from "@/app/lib/utils";
import {
  CCard,
  CStat,
  FZone,
  HBtn as BaseHBtn,
  HInput,
  HSel,
  Tip,
  Toast,
} from "@/app/components/DocLensUI";
import { UIcon } from "@/app/components/Icons";

declare global {
  interface Window {
    PDFLib: any;
    JSZip?: any;
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

const IMPORTANT_CARD_TOOLTIPS = new Set([
  "PDF to plain text",
  "PDF to DOCX",
  "Redact PDF",
  "Compare PDFs",
  "Extract PDF images",
  "Webpage to PDF",
  "PDF OCR",
]);

function HBtn(props: any) {
  return <BaseHBtn {...props} className={`mt-auto shrink-0 ${props.className || ""}`.trim()} />;
}

function ProgressBar({
  progress,
  label,
}: {
  progress: number;
  label?: string;
}) {
  if (!progress) return null;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 animate-fade-in">
      <div className="mb-2.5 flex items-center justify-between gap-3 text-[11px] text-[#6b6d80] font-medium">
        <span className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#7c6aff] animate-pulse" />
          {label || "Working..."}
        </span>
        <span className="font-bold text-white/60">{progress}%</span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.04]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#7c6aff] via-[#00d4aa] to-[#7c6aff] transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%`, backgroundSize: "200% 100%", animation: progress < 100 ? "shimmer 2s linear infinite" : "none" }}
        />
        {progress < 100 && (
          <div
            className="absolute top-0 h-full w-8 rounded-full bg-white/20 blur-sm"
            style={{ left: `${Math.max(0, progress - 4)}%`, transition: "left 0.5s ease-out" }}
          />
        )}
      </div>
    </div>
  );
}

function FileListPreview({
  files,
  icon,
}: {
  files?: File[];
  icon: string;
}) {
  if (!files?.length) return null;

  return (
    <div className="flex max-h-[100px] flex-col gap-1.5 overflow-y-auto">
      {files.map((file) => (
        <div
          key={`${file.name}-${file.size}`}
          className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[12px] text-[#9294a5]"
        >
          <UIcon name={icon as any} size={12} />
          <span className="truncate">{file.name}</span>
        </div>
      ))}
    </div>
  );
}

function TextAreaField({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-[108px] w-full resize-y rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] font-medium text-white outline-none transition-all duration-300 placeholder:text-[#6b6d80] focus:border-[#7c6aff]/35 focus:ring-2 focus:ring-[#7c6aff]/25 hover:border-white/[0.12] ${className}`}
    />
  );
}

function HelperNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[12px] leading-relaxed text-[#7f8296]">
      {children}
    </div>
  );
}

function normalizeHexColor(value: string | undefined, fallback: string) {
  const match = (value || fallback).trim().match(/^#?([0-9a-f]{6})$/i);
  return `#${(match?.[1] || fallback.replace("#", "")).toLowerCase()}`;
}

export default function PdfToolsPage() {
  const ready = useScripts([
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
  ]);

  const [state, setState] = useState<Record<string, any>>({});
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((message: string) => setToast(message), []);

  const getTool = (key: string) => state[key] || {};
  const setTool = (key: string, value: Record<string, unknown>) =>
    setState((previous) => ({
      ...previous,
      [key]: { ...previous[key], ...value },
    }));

  const setProgress = (key: string, progress: number, phase?: string) =>
    setTool(key, phase ? { progress, phase } : { progress });

  async function run(
    key: string,
    task: () => Promise<string>,
    options: { requiresLibs?: boolean } = {}
  ) {
    if ((options.requiresLibs ?? true) && !ready) {
      setTool(key, {
        loading: false,
        status: "PDF libraries are still loading. Please try again in a moment.",
        statusType: "err",
      });
      return;
    }

    setTool(key, { loading: true, status: "", statusType: "", progress: 0, phase: "" });
    try {
      const message = await task();
      setTool(key, { loading: false, status: message, statusType: "ok" });
      showToast(message);
    } catch (error: any) {
      setTool(key, {
        loading: false,
        status: error?.message || "Something went wrong.",
        statusType: "err",
      });
    }
  }

  function pdfColor(value: string | undefined, fallback: string) {
    const { rgb } = window.PDFLib;
    const hex = normalizeHexColor(value, fallback).slice(1);
    const red = Number.parseInt(hex.slice(0, 2), 16) / 255;
    const green = Number.parseInt(hex.slice(2, 4), 16) / 255;
    const blue = Number.parseInt(hex.slice(4, 6), 16) / 255;
    return rgb(red, green, blue);
  }

  function resolvePageTargets(input: string | undefined, totalPages: number) {
    const normalized = (input || "all").trim().toLowerCase();
    if (!normalized || normalized === "all") {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const ordered = parseOrderedPageList(normalized, totalPages);
    if (!ordered.length) {
      throw new Error('Enter a valid page number, range, or "all".');
    }

    return ordered;
  }

  function getNumber(value: string | undefined, fallback: number) {
    const parsed = Number.parseFloat(value || "");
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function wrapText(font: any, text: string, size: number, maxWidth: number) {
    const lines: string[] = [];

    text.replace(/\r/g, "").split("\n").forEach((paragraph) => {
      if (!paragraph.trim()) {
        lines.push("");
        return;
      }

      let current = "";
      paragraph.split(/\s+/).forEach((word) => {
        const candidate = current ? `${current} ${word}` : word;
        if (!current || font.widthOfTextAtSize(candidate, size) <= maxWidth) {
          current = candidate;
          return;
        }
        lines.push(current);
        current = word;
      });

      if (current) {
        lines.push(current);
      }
    });

    return lines;
  }

  async function buildTextPdfBlob(title: string, body: string) {
    const { PDFDocument, StandardFonts } = window.PDFLib;
    const pdf = await PDFDocument.create();
    const regular = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const pageWidth = 595;
    const pageHeight = 842;
    const margin = 50;
    const titleSize = title ? 20 : 0;
    const bodySize = 11;
    const titleGap = title ? 18 : 0;
    const bodyLineHeight = 16;
    const titleLineHeight = 26;
    const contentWidth = pageWidth - margin * 2;
    const titleLines = title ? wrapText(bold, title, titleSize, contentWidth) : [];
    const bodyLines = wrapText(regular, body, bodySize, contentWidth);

    let page = pdf.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    titleLines.forEach((line, index) => {
      if (y < margin + titleLineHeight) {
        page = pdf.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
      page.drawText(line, {
        x: margin,
        y,
        size: titleSize,
        font: bold,
        color: pdfColor("#f5f7fb", "#f5f7fb"),
      });
      y -= titleLineHeight;
      if (index === titleLines.length - 1) {
        y -= titleGap;
      }
    });

    bodyLines.forEach((line) => {
      if (y < margin + bodyLineHeight) {
        page = pdf.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }

      if (line) {
        page.drawText(line, {
          x: margin,
          y,
          size: bodySize,
          font: regular,
          color: pdfColor("#d7deef", "#d7deef"),
        });
      }
      y -= bodyLineHeight;
    });

    return new Blob([await pdf.save()], { type: "application/pdf" });
  }

  const conversionCards = [
    {
      title: "PDF to plain text",
      accent: "#ff6b6b",
      icon: <UIcon name="FileText" size={18} />,
      tip: "Uses improved extraction for cleaner text output.",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose a PDF"
            file={getTool("pdfTxt").file}
            onFile={(file: File) => setTool("pdfTxt", { file })}
          />
          <ProgressBar
            progress={getTool("pdfTxt").progress || 0}
            label={getTool("pdfTxt").phase || "Extracting text"}
          />
          <CStat msg={getTool("pdfTxt").status} type={getTool("pdfTxt").statusType} />
          <HBtn
            onClick={async () => {
              const file = getTool("pdfTxt").file;
              if (!file) return;
              await run("pdfTxt", async () => {
                const extraction = await extractPdfTextWithOcrFallback(file, PDF_WORKER_SRC, {
                  onProgress: (progress, label) =>
                    setProgress("pdfTxt", Math.max(6, progress), label || "Extracting text"),
                });
                dlText(`${stem(file.name)}.txt`, extraction.text);
                setProgress("pdfTxt", 100, extraction.source === "ocr" ? "OCR text ready" : "Text ready");
                return extraction.source === "ocr"
                  ? `Low native text detected, OCR text exported from ${extraction.pageCount} page${extraction.pageCount === 1 ? "" : "s"}.`
                  : `${extraction.pageCount} page${extraction.pageCount === 1 ? "" : "s"} extracted to TXT.`;
              });
            }}
            disabled={!getTool("pdfTxt").file}
            loading={getTool("pdfTxt").loading}
            label="Extract text"
          />
        </>
      ),
    },
    {
      title: "PDF to Images",
      accent: "#00d4aa",
      icon: <UIcon name="Image" size={18} />,
      tip: "Render pages as crisp images bundled in a ZIP.",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose a PDF"
            file={getTool("pdfImg").file}
            onFile={(file: File) => setTool("pdfImg", { file })}
          />
          <div className="grid gap-2">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#6b6d80]">
              Render quality
            </div>
            <HInput
              type="number"
              min="72"
              max="300"
              value={getTool("pdfImg").dpi || "180"}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setTool("pdfImg", { dpi: event.target.value })
              }
            />
          </div>
          <ProgressBar progress={getTool("pdfImg").progress || 0} label="Rendering page images" />
          <CStat msg={getTool("pdfImg").status} type={getTool("pdfImg").statusType} />
          <HBtn
            onClick={async () => {
              const file = getTool("pdfImg").file;
              if (!file) return;
              const dpi = Number.parseInt(getTool("pdfImg").dpi || "180", 10) || 180;
              await run("pdfImg", async () => {
                const rendered = await renderPdfPages(file, PDF_WORKER_SRC, dpi, {
                  onProgress: (progress) => setTool("pdfImg", { progress }),
                });
                const zip = await buildPdfImageZip(rendered);
                dlBlob(`${stem(file.name)}_images.zip`, zip);
                setTool("pdfImg", { progress: 100 });
                return `${rendered.length} page image${rendered.length === 1 ? "" : "s"} packaged in a ZIP.`;
              });
            }}
            disabled={!getTool("pdfImg").file}
            loading={getTool("pdfImg").loading}
            label="Create ZIP"
          />
        </>
      ),
    },
    {
      title: "PDF to DOCX",
      accent: "#7c6aff",
      icon: <UIcon name="FileSignature" size={18} />,
      tip: "Best Accuracy or Editable Text output.",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose a PDF"
            file={getTool("pdfDocx").file}
            onFile={(file: File) => setTool("pdfDocx", { file })}
          />
          <div className="grid gap-2">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#6b6d80]">
              Output mode
            </div>
            <HSel
              value={getTool("pdfDocx").mode || "layout"}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                setTool("pdfDocx", { mode: event.target.value })
              }
            >
              <option value="layout">Best accuracy</option>
              <option value="editable">Editable text</option>
            </HSel>
          </div>
          <ProgressBar
            progress={getTool("pdfDocx").progress || 0}
            label={getTool("pdfDocx").phase || "Building Word output"}
          />
          <CStat msg={getTool("pdfDocx").status} type={getTool("pdfDocx").statusType} />
          <HBtn
            onClick={async () => {
              const file = getTool("pdfDocx").file;
              if (!file) return;

              await run("pdfDocx", async () => {
                const selectedMode = getTool("pdfDocx").mode || "layout";
                setTool("pdfDocx", { phase: "Analyzing PDF text structure", progress: 8 });

                const extraction = await extractPdfFile(file, PDF_WORKER_SRC, {
                  onProgress: (progress) =>
                    setTool("pdfDocx", { progress: Math.round(progress * 0.5) }),
                });

                const extractedText = extraction.text.replace(/--- Page \d+ ---/g, "").trim();
                const lowTextConfidence = extractedText.length < 120;
                const useLayoutMode =
                  selectedMode === "layout" ||
                  (selectedMode === "editable" && lowTextConfidence);

                let output: Blob;

                if (useLayoutMode) {
                  setTool("pdfDocx", {
                    phase: selectedMode === "editable" && lowTextConfidence
                      ? "Low text, switching to page-faithful mode"
                      : "Rendering page-faithful Word pages",
                    progress: 55,
                  });

                  const rendered = await renderPdfPages(file, PDF_WORKER_SRC, 180, {
                    onProgress: (progress) =>
                      setTool("pdfDocx", { progress: 55 + Math.round(progress * 0.45) }),
                  });

                  output = await buildLayoutPdfDocx(rendered);
                } else {
                  setTool("pdfDocx", { phase: "Composing editable Word paragraphs", progress: 72 });
                  output = await buildEditablePdfDocx(extraction);
                  setTool("pdfDocx", { progress: 100 });
                }

                dlBlob(`${stem(file.name)}.docx`, output);

                return useLayoutMode
                  ? selectedMode === "editable" && lowTextConfidence
                    ? "Low text detected, created page-faithful DOCX."
                    : "High-accuracy DOCX created."
                  : "Editable DOCX created.";
              });
            }}
            disabled={!getTool("pdfDocx").file}
            loading={getTool("pdfDocx").loading}
            label="Convert to DOCX"
          />
        </>
      ),
    },
  ];

  const organizeCards = [
    {
      title: "Merge PDF",
      accent: "#ffa940",
      icon: <UIcon name="Combine" size={18} />,
      tip: "Files are merged in the order selected.",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose multiple PDFs"
            multi
            files={getTool("merge").files}
            onFiles={(files: File[]) => setTool("merge", { files })}
          />
          <FileListPreview files={getTool("merge").files} icon="FileText" />
          <CStat msg={getTool("merge").status} type={getTool("merge").statusType} />
          <HBtn
            onClick={async () => {
              const files = getTool("merge").files || [];
              if (files.length < 2) return;
              await run("merge", async () => {
                const { PDFDocument } = window.PDFLib;
                const merged = await PDFDocument.create();

                for (const file of files) {
                  const source = await PDFDocument.load(await file.arrayBuffer());
                  const pages = await merged.copyPages(source, source.getPageIndices());
                  pages.forEach((page: any) => merged.addPage(page));
                }

                const bytes = await merged.save();
                dlBlob("merged.pdf", new Blob([bytes], { type: "application/pdf" }));
                return `${files.length} PDFs merged.`;
              });
            }}
            disabled={!((getTool("merge").files || []).length >= 2)}
            loading={getTool("merge").loading}
            label="Merge PDF"
          />
        </>
      ),
    },
    {
      title: "Split PDF",
      accent: "#00d4aa",
      icon: <UIcon name="ScissorsLineDashed" size={18} />,
      tip: 'Use "1-3, 5, 9" syntax.',
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose a PDF"
            file={getTool("split").file}
            onFile={(file: File) => setTool("split", { file })}
          />
          <HInput
            placeholder="Page range, e.g. 1-3, 5, 9"
            value={getTool("split").pages || ""}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setTool("split", { pages: event.target.value })
            }
          />
          <CStat msg={getTool("split").status} type={getTool("split").statusType} />
          <HBtn
            onClick={async () => {
              const file = getTool("split").file;
              const pagesInput = getTool("split").pages || "";
              if (!file || !pagesInput) return;

              await run("split", async () => {
                const { PDFDocument } = window.PDFLib;
                const source = await PDFDocument.load(await file.arrayBuffer());
                const selectedPages = parsePageRange(pagesInput, source.getPageCount());

                if (!selectedPages.length) {
                  throw new Error("Enter at least one valid page range.");
                }

                const output = await PDFDocument.create();
                const pages = await output.copyPages(source, selectedPages.map((page) => page - 1));
                pages.forEach((page: any) => output.addPage(page));

                const bytes = await output.save();
                dlBlob(`${stem(file.name)}_split.pdf`, new Blob([bytes], { type: "application/pdf" }));
                return `${selectedPages.length} page${selectedPages.length === 1 ? "" : "s"} extracted.`;
              });
            }}
            disabled={!getTool("split").file || !getTool("split").pages}
            loading={getTool("split").loading}
            label="Extract pages"
          />
        </>
      ),
    },
    {
      title: "Images to PDF",
      accent: "#7c6aff",
      icon: <UIcon name="Images" size={18} />,
      tip: "Images added in selection order.",
      body: (
        <>
          <FZone
            accept="image/png,image/jpeg"
            label="Choose JPG or PNG images"
            multi
            files={getTool("imgPdf").files}
            onFiles={(files: File[]) => setTool("imgPdf", { files })}
          />
          <FileListPreview files={getTool("imgPdf").files} icon="Image" />
          <CStat msg={getTool("imgPdf").status} type={getTool("imgPdf").statusType} />
          <HBtn
            onClick={async () => {
              const files = getTool("imgPdf").files || [];
              if (!files.length) return;

              await run("imgPdf", async () => {
                const { PDFDocument } = window.PDFLib;
                const pdf = await PDFDocument.create();

                for (const file of files) {
                  const bytes = await file.arrayBuffer();
                  const image =
                    file.type === "image/png"
                      ? await pdf.embedPng(bytes)
                      : await pdf.embedJpg(bytes);

                  const page = pdf.addPage([image.width, image.height]);
                  page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
                }

                const output = await pdf.save();
                dlBlob("images.pdf", new Blob([output], { type: "application/pdf" }));
                return `${files.length} image${files.length === 1 ? "" : "s"} converted to PDF.`;
              });
            }}
            disabled={!((getTool("imgPdf").files || []).length > 0)}
            loading={getTool("imgPdf").loading}
            label="Create PDF"
          />
        </>
      ),
    },
    {
      title: "Rotate PDF pages",
      accent: "#ffa940",
      icon: <UIcon name="RotateCw" size={18} />,
      tip: "Fix sideways or upside-down pages.",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose a PDF"
            file={getTool("rotate").file}
            onFile={(file: File) => setTool("rotate", { file })}
          />
          <HSel
            value={getTool("rotate").deg || "90"}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
              setTool("rotate", { deg: event.target.value })
            }
          >
            <option value="90">Rotate 90° clockwise</option>
            <option value="180">Rotate 180°</option>
            <option value="270">Rotate 270°</option>
          </HSel>
          <CStat msg={getTool("rotate").status} type={getTool("rotate").statusType} />
          <HBtn
            onClick={async () => {
              const file = getTool("rotate").file;
              if (!file) return;

              await run("rotate", async () => {
                const { PDFDocument, degrees } = window.PDFLib;
                const pdf = await PDFDocument.load(await file.arrayBuffer());
                const amount = Number.parseInt(getTool("rotate").deg || "90", 10);

                pdf.getPages().forEach((page: any) => {
                  const current = page.getRotation().angle;
                  page.setRotation(degrees((current + amount) % 360));
                });

                const output = await pdf.save();
                dlBlob(`${stem(file.name)}_rotated.pdf`, new Blob([output], { type: "application/pdf" }));
                return `Rotated every page by ${amount}°.`;
              });
            }}
            disabled={!getTool("rotate").file}
            loading={getTool("rotate").loading}
            label="Rotate file"
          />
        </>
      ),
    },
    {
      title: "PDF Link",
      accent: "#00d4aa",
      icon: <UIcon name="Link" size={18} />,
      tip: "Dedicated shareable-link workspace.",
      body: (
        <div className="flex h-full flex-col justify-between gap-4">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[13px] leading-relaxed text-[#6b6d80]">
            Upload a PDF and get an instant shareable viewer link.
          </div>
          <Link
            href="/pdf-link"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00d4aa] to-[#00b894] px-5 py-3 text-[13px] font-bold text-white shadow-lg shadow-[#00d4aa]/20 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <UIcon name="ArrowUpRight" size={14} />
            Open PDF Link
          </Link>
        </div>
      ),
    },
  ];

  const securityCards = [
    {
      title: "Protect PDF",
      accent: "#ff6b6b",
      icon: <UIcon name="Lock" size={18} />,
      tip: "Encrypt with a password.",
      body: (
        <>
          <FZone accept=".pdf" label="Choose a PDF" file={getTool("lock").file} onFile={(file: File) => setTool("lock", { file })} />
          <HInput type="password" placeholder="Enter a secure password" value={getTool("lock").password || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool("lock", { password: e.target.value })} />
          <CStat msg={getTool("lock").status} type={getTool("lock").statusType} />
          <HBtn onClick={async () => {
             const file = getTool("lock").file;
             const password = getTool("lock").password;
             if (!file || !password) return;
             await run("lock", async () => {
                const pdfLibEncrypt = await import("pdf-lib-plus-encrypt");
                const pdf = await pdfLibEncrypt.PDFDocument.load(await file.arrayBuffer());
                const bytes = await pdf.save({ userPassword: password, ownerPassword: password } as any);
                dlBlob(`${stem(file.name)}_locked.pdf`, new Blob([bytes], { type: "application/pdf" }));
                return "PDF locked successfully.";
             });
          }} disabled={!getTool("lock").file || !getTool("lock").password} loading={getTool("lock").loading} label="Protect PDF" />
       </>
      ),
    },
    {
      title: "Unlock PDF",
      accent: "#7c6aff",
      icon: <UIcon name="Unlock" size={18} />,
      tip: "Remove password from encrypted PDF.",
      body: (
        <>
          <FZone accept=".pdf" label="Choose locked PDF" file={getTool("unlock").file} onFile={(file: File) => setTool("unlock", { file })} />
          <HInput type="password" placeholder="Enter the current password" value={getTool("unlock").password || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTool("unlock", { password: e.target.value })} />
          <CStat msg={getTool("unlock").status} type={getTool("unlock").statusType} />
          <HBtn onClick={async () => {
             const file = getTool("unlock").file;
             const password = getTool("unlock").password;
             if (!file || !password) return;
             await run("unlock", async () => {
                const pdfLibEncrypt = await import("pdf-lib-plus-encrypt");
                const pdf = await pdfLibEncrypt.PDFDocument.load(await file.arrayBuffer(), { password } as any);
                const bytes = await pdf.save();
                dlBlob(`${stem(file.name)}_unlocked.pdf`, new Blob([bytes], { type: "application/pdf" }));
                return "PDF unlocked permanently.";
             });
          }} disabled={!getTool("unlock").file || !getTool("unlock").password} loading={getTool("unlock").loading} label="Unlock PDF" />
       </>
      ),
    }
  ];

  const reviewCards = [
    {
      title: "Edit PDF",
      accent: "#eb2f96",
      icon: <UIcon name="PencilLine" size={18} />,
      tip: "Add text annotations to any page or page range.",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose a PDF"
            file={getTool("edit").file}
            onFile={(file: File) => setTool("edit", { file })}
          />
          <TextAreaField
            placeholder="Text to add to the PDF"
            value={getTool("edit").text || ""}
            onChange={(event) => setTool("edit", { text: event.target.value })}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <HInput
              placeholder='Page number, range, or "all"'
              value={getTool("edit").pages || "all"}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setTool("edit", { pages: event.target.value })
              }
            />
            <HInput
              type="number"
              min="8"
              max="72"
              placeholder="Font size"
              value={getTool("edit").size || "18"}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setTool("edit", { size: event.target.value })
              }
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <HSel
              value={getTool("edit").placement || "top-right"}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                setTool("edit", { placement: event.target.value })
              }
            >
              {PLACEMENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </HSel>
            <HInput
              placeholder="Text color (hex)"
              value={getTool("edit").color || "#ff6b6b"}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setTool("edit", { color: event.target.value })
              }
            />
          </div>
          <CStat msg={getTool("edit").status} type={getTool("edit").statusType} />
          <HBtn
            onClick={async () => {
              const file = getTool("edit").file;
              const text = (getTool("edit").text || "").trim();
              if (!file || !text) return;

              await run("edit", async () => {
                const { PDFDocument, StandardFonts } = window.PDFLib;
                const pdf = await PDFDocument.load(await file.arrayBuffer());
                const font = await pdf.embedFont(StandardFonts.Helvetica);
                const size = Math.max(8, Math.min(72, getNumber(getTool("edit").size, 18)));
                const targets = resolvePageTargets(getTool("edit").pages, pdf.getPageCount());
                const placement = (getTool("edit").placement || "top-right") as PlacementPreset;
                const color = pdfColor(getTool("edit").color, "#ff6b6b");
                const lines = text.split("\n").filter(Boolean);

                targets.forEach((pageNumber) => {
                  const page = pdf.getPage(pageNumber - 1);
                  const lineHeight = size * 1.2;
                  const textWidth = Math.max(...lines.map((line) => font.widthOfTextAtSize(line, size)));
                  const textHeight = lines.length * lineHeight;
                  const position = resolvePlacement(
                    placement,
                    page.getWidth(),
                    page.getHeight(),
                    textWidth,
                    textHeight
                  );

                  lines.forEach((line, lineIndex) => {
                    page.drawText(line, {
                      x: position.x,
                      y: position.y + textHeight - lineHeight * (lineIndex + 1),
                      size,
                      font,
                      color,
                    });
                  });
                });

                dlBlob(`${stem(file.name)}_edited.pdf`, new Blob([await pdf.save()], { type: "application/pdf" }));
                return `Added text to ${targets.length} page${targets.length === 1 ? "" : "s"}.`;
              });
            }}
            disabled={!getTool("edit").file || !getTool("edit").text}
            loading={getTool("edit").loading}
            label="Edit PDF"
          />
        </>
      ),
    },
    {
      title: "Sign PDF",
      accent: "#13c2c2",
      icon: <UIcon name="Signature" size={18} />,
      tip: "Apply a typed signature or upload a signature image.",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose a PDF"
            file={getTool("sign").file}
            onFile={(file: File) => setTool("sign", { file })}
          />
          <HSel
            value={getTool("sign").mode || "typed"}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
              setTool("sign", { mode: event.target.value })
            }
          >
            <option value="typed">Typed signature</option>
            <option value="image">Image signature</option>
          </HSel>
          {(getTool("sign").mode || "typed") === "typed" ? (
            <HInput
              placeholder="Type the signature text"
              value={getTool("sign").text || ""}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setTool("sign", { text: event.target.value })
              }
            />
          ) : (
            <FZone
              accept="image/png,image/jpeg"
              label="Choose a PNG or JPG signature"
              file={getTool("sign").signatureFile}
              onFile={(file: File) => setTool("sign", { signatureFile: file })}
            />
          )}
          <div className="grid gap-3 md:grid-cols-2">
            <HInput
              placeholder='Page number, range, or "all"'
              value={getTool("sign").pages || "all"}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setTool("sign", { pages: event.target.value })
              }
            />
            <HInput
              type="number"
              min="60"
              max="280"
              placeholder="Signature width"
              value={getTool("sign").width || "150"}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setTool("sign", { width: event.target.value })
              }
            />
          </div>
          <HSel
            value={getTool("sign").placement || "bottom-right"}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
              setTool("sign", { placement: event.target.value })
            }
          >
            {PLACEMENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </HSel>
          <CStat msg={getTool("sign").status} type={getTool("sign").statusType} />
          <HBtn
            onClick={async () => {
              const file = getTool("sign").file;
              const mode = getTool("sign").mode || "typed";
              if (!file) return;

              await run("sign", async () => {
                const { PDFDocument, StandardFonts } = window.PDFLib;
                const pdf = await PDFDocument.load(await file.arrayBuffer());
                const targets = resolvePageTargets(getTool("sign").pages, pdf.getPageCount());
                const placement = (getTool("sign").placement || "bottom-right") as PlacementPreset;

                if (mode === "typed") {
                  const signature = (getTool("sign").text || "").trim();
                  if (!signature) throw new Error("Type a signature before applying it.");
                  const font = await pdf.embedFont(StandardFonts.TimesRomanItalic);
                  const size = Math.max(18, Math.min(42, getNumber(getTool("sign").width, 150) / 5));

                  targets.forEach((pageNumber) => {
                    const page = pdf.getPage(pageNumber - 1);
                    const width = font.widthOfTextAtSize(signature, size);
                    const position = resolvePlacement(
                      placement,
                      page.getWidth(),
                      page.getHeight(),
                      width,
                      size * 1.2
                    );
                    page.drawText(signature, {
                      x: position.x,
                      y: position.y,
                      size,
                      font,
                      color: pdfColor("#101418", "#101418"),
                    });
                  });
                } else {
                  const signatureFile = getTool("sign").signatureFile as File | undefined;
                  if (!signatureFile) throw new Error("Upload a signature image first.");
                  const desiredWidth = Math.max(60, Math.min(280, getNumber(getTool("sign").width, 150)));
                  const bytes = await signatureFile.arrayBuffer();
                  const image =
                    signatureFile.type === "image/png"
                      ? await pdf.embedPng(bytes)
                      : await pdf.embedJpg(bytes);

                  targets.forEach((pageNumber) => {
                    const page = pdf.getPage(pageNumber - 1);
                    const width = Math.min(desiredWidth, page.getWidth() - 72);
                    const height = width * (image.height / image.width);
                    const position = resolvePlacement(
                      placement,
                      page.getWidth(),
                      page.getHeight(),
                      width,
                      height
                    );
                    page.drawImage(image, {
                      x: position.x,
                      y: position.y,
                      width,
                      height,
                    });
                  });
                }

                dlBlob(`${stem(file.name)}_signed.pdf`, new Blob([await pdf.save()], { type: "application/pdf" }));
                return `Signature applied to ${targets.length} page${targets.length === 1 ? "" : "s"}.`;
              });
            }}
            disabled={
              !getTool("sign").file ||
              ((getTool("sign").mode || "typed") === "typed"
                ? !getTool("sign").text
                : !getTool("sign").signatureFile)
            }
            loading={getTool("sign").loading}
            label="Sign PDF"
          />
        </>
      ),
    },
    {
      title: "Add watermark",
      accent: "#ffa940",
      icon: <UIcon name="Droplets" size={18} />,
      tip: "Stamp a repeated text watermark onto every page.",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose a PDF"
            file={getTool("watermark").file}
            onFile={(file: File) => setTool("watermark", { file })}
          />
          <HInput
            placeholder="Watermark text"
            value={getTool("watermark").text || ""}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setTool("watermark", { text: event.target.value })
            }
          />
          <div className="grid gap-3 md:grid-cols-2">
            <HInput
              type="number"
              min="12"
              max="96"
              placeholder="Font size"
              value={getTool("watermark").size || "42"}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setTool("watermark", { size: event.target.value })
              }
            />
            <HInput
              type="number"
              min="0.05"
              max="1"
              step="0.05"
              placeholder="Opacity"
              value={getTool("watermark").opacity || "0.18"}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setTool("watermark", { opacity: event.target.value })
              }
            />
          </div>
          <CStat msg={getTool("watermark").status} type={getTool("watermark").statusType} />
          <HBtn
            onClick={async () => {
              const file = getTool("watermark").file;
              const text = (getTool("watermark").text || "").trim();
              if (!file || !text) return;

              await run("watermark", async () => {
                const { PDFDocument, StandardFonts, degrees } = window.PDFLib;
                const pdf = await PDFDocument.load(await file.arrayBuffer());
                const font = await pdf.embedFont(StandardFonts.HelveticaBold);
                const size = Math.max(12, Math.min(96, getNumber(getTool("watermark").size, 42)));
                const opacity = Math.max(0.05, Math.min(1, getNumber(getTool("watermark").opacity, 0.18)));
                const textWidth = font.widthOfTextAtSize(text, size);

                pdf.getPages().forEach((page: any) => {
                  const position = resolvePlacement(
                    "center",
                    page.getWidth(),
                    page.getHeight(),
                    textWidth,
                    size * 1.4
                  );
                  page.drawText(text, {
                    x: position.x,
                    y: position.y,
                    size,
                    font,
                    color: pdfColor("#ff6b6b", "#ff6b6b"),
                    opacity,
                    rotate: degrees(-35),
                  });
                });

                dlBlob(`${stem(file.name)}_watermarked.pdf`, new Blob([await pdf.save()], { type: "application/pdf" }));
                return "Watermark added to every page.";
              });
            }}
            disabled={!getTool("watermark").file || !getTool("watermark").text}
            loading={getTool("watermark").loading}
            label="Add watermark"
          />
        </>
      ),
    },
    {
      title: "Add page numbers",
      accent: "#597ef7",
      icon: <UIcon name="ListOrdered" size={18} />,
      tip: "Add running page numbers with your own prefix and starting index.",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose a PDF"
            file={getTool("pageNumbers").file}
            onFile={(file: File) => setTool("pageNumbers", { file })}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <HInput
              placeholder="Prefix, e.g. Page "
              value={getTool("pageNumbers").prefix || ""}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setTool("pageNumbers", { prefix: event.target.value })
              }
            />
            <HInput
              type="number"
              min="1"
              placeholder="Start number"
              value={getTool("pageNumbers").start || "1"}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setTool("pageNumbers", { start: event.target.value })
              }
            />
          </div>
          <HSel
            value={getTool("pageNumbers").placement || "bottom-center"}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
              setTool("pageNumbers", { placement: event.target.value })
            }
          >
            {PLACEMENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </HSel>
          <CStat msg={getTool("pageNumbers").status} type={getTool("pageNumbers").statusType} />
          <HBtn
            onClick={async () => {
              const file = getTool("pageNumbers").file;
              if (!file) return;

              await run("pageNumbers", async () => {
                const { PDFDocument, StandardFonts } = window.PDFLib;
                const pdf = await PDFDocument.load(await file.arrayBuffer());
                const font = await pdf.embedFont(StandardFonts.Helvetica);
                const placement = (getTool("pageNumbers").placement || "bottom-center") as PlacementPreset;
                const prefix = getTool("pageNumbers").prefix || "";
                const start = Math.max(1, Number.parseInt(getTool("pageNumbers").start || "1", 10) || 1);
                const size = 12;

                pdf.getPages().forEach((page: any, index: number) => {
                  const text = `${prefix}${start + index}`;
                  const width = font.widthOfTextAtSize(text, size);
                  const position = resolvePlacement(
                    placement,
                    page.getWidth(),
                    page.getHeight(),
                    width,
                    size * 1.2
                  );
                  page.drawText(text, {
                    x: position.x,
                    y: position.y,
                    size,
                    font,
                    color: pdfColor("#d7deef", "#d7deef"),
                  });
                });

                dlBlob(`${stem(file.name)}_numbered.pdf`, new Blob([await pdf.save()], { type: "application/pdf" }));
                return `Page numbers added to ${pdf.getPageCount()} page${pdf.getPageCount() === 1 ? "" : "s"}.`;
              });
            }}
            disabled={!getTool("pageNumbers").file}
            loading={getTool("pageNumbers").loading}
            label="Add page numbers"
          />
        </>
      ),
    },
    {
      title: "Redact PDF",
      accent: "#f5222d",
      icon: <UIcon name="ShieldBan" size={18} />,
      tip: "Permanently redact matching terms by exporting a new image-based PDF.",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose a PDF"
            file={getTool("redact").file}
            onFile={(file: File) => setTool("redact", { file })}
          />
          <TextAreaField
            placeholder="Terms to redact, separated by commas"
            value={getTool("redact").terms || ""}
            onChange={(event) => setTool("redact", { terms: event.target.value })}
          />
          <ProgressBar progress={getTool("redact").progress || 0} label="Redacting PDF" />
          <HelperNote>
            This creates a permanently redacted raster PDF so the covered text is not left behind underneath.
          </HelperNote>
          <CStat msg={getTool("redact").status} type={getTool("redact").statusType} />
          <HBtn
            onClick={async () => {
              const file = getTool("redact").file;
              const terms = parseTerms(getTool("redact").terms || "");
              if (!file || !terms.length) return;

              await run("redact", async () => {
                const result = await createRedactedPdf(file, PDF_WORKER_SRC, terms, {
                  onProgress: (progress) => setProgress("redact", progress, "Creating redacted PDF"),
                });
                if (!result.matches) {
                  throw new Error("No matching text was found for those terms.");
                }
                dlBlob(`${stem(file.name)}_redacted.pdf`, result.blob);
                setProgress("redact", 100, "Redaction complete");
                return `${result.matches} redaction match${result.matches === 1 ? "" : "es"} applied.`;
              });
            }}
            disabled={!getTool("redact").file || !getTool("redact").terms}
            loading={getTool("redact").loading}
            label="Redact PDF"
          />
        </>
      ),
    },
    {
      title: "Compare PDFs",
      accent: "#00b894",
      icon: <UIcon name="GitCompareArrows" size={18} />,
      tip: "Creates HTML and TXT reports with per-page text similarity scores.",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose the first PDF"
            file={getTool("compare").left}
            onFile={(file: File) => setTool("compare", { left: file })}
          />
          <FZone
            accept=".pdf"
            label="Choose the second PDF"
            file={getTool("compare").right}
            onFile={(file: File) => setTool("compare", { right: file })}
          />
          <ProgressBar
            progress={getTool("compare").progress || 0}
            label={getTool("compare").phase || "Comparing PDFs"}
          />
          <CStat msg={getTool("compare").status} type={getTool("compare").statusType} />
          <HBtn
            onClick={async () => {
              const left = getTool("compare").left;
              const right = getTool("compare").right;
              if (!left || !right) return;

              await run("compare", async () => {
                const result = await comparePdfFiles(left, right, PDF_WORKER_SRC, {
                  onProgress: (progress, label) =>
                    setProgress("compare", progress, label || "Comparing PDFs"),
                });
                const zip = new (window.JSZip as any)();
                zip.file("comparison-report.html", result.html);
                zip.file("comparison-report.txt", result.text);
                dlBlob("pdf-comparison-report.zip", await zip.generateAsync({ type: "blob" }));
                setProgress("compare", 100, "Comparison ready");
                const ocrNote =
                  result.sourceA === "ocr" || result.sourceB === "ocr"
                    ? " OCR fallback was used for low-text pages."
                    : "";
                return result.identical
                  ? `The PDFs appear identical in the text comparison.${ocrNote}`
                  : `Comparison report created. Overall similarity: ${Math.round(result.score * 100)}%.${ocrNote}`;
              });
            }}
            disabled={!getTool("compare").left || !getTool("compare").right}
            loading={getTool("compare").loading}
            label="Compare PDFs"
          />
        </>
      ),
    },
  ];
  const extraToolCards = [
    {
      title: "PDF Converter",
      accent: "#ff6b6b",
      icon: <UIcon name="Repeat2" size={18} />,
      tip: "Quick converter for TXT and DOCX outputs from one card.",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose a PDF"
            file={getTool("quickConvert").file}
            onFile={(file: File) => setTool("quickConvert", { file })}
          />
          <HSel
            value={getTool("quickConvert").format || "txt"}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
              setTool("quickConvert", { format: event.target.value })
            }
          >
            <option value="txt">PDF to TXT</option>
            <option value="docx-layout">PDF to DOCX (best accuracy)</option>
            <option value="docx-editable">PDF to DOCX (editable text)</option>
          </HSel>
          <ProgressBar
            progress={getTool("quickConvert").progress || 0}
            label={getTool("quickConvert").phase || "Converting PDF"}
          />
          <CStat msg={getTool("quickConvert").status} type={getTool("quickConvert").statusType} />
          <HBtn
            onClick={async () => {
              const file = getTool("quickConvert").file;
              const format = getTool("quickConvert").format || "txt";
              if (!file) return;

              await run("quickConvert", async () => {
                if (format === "txt") {
                  const extraction = await extractPdfFile(file, PDF_WORKER_SRC, {
                    onProgress: (progress) => setProgress("quickConvert", Math.max(8, progress), "Extracting text"),
                  });
                  dlText(`${stem(file.name)}.txt`, extraction.text);
                  setProgress("quickConvert", 100, "TXT ready");
                  return `${extraction.pageCount} page${extraction.pageCount === 1 ? "" : "s"} exported to TXT.`;
                }

                if (format === "docx-layout") {
                  const rendered = await renderPdfPages(file, PDF_WORKER_SRC, 180, {
                    onProgress: (progress) => setProgress("quickConvert", progress, "Rendering DOCX pages"),
                  });
                  const output = await buildLayoutPdfDocx(rendered);
                  dlBlob(`${stem(file.name)}.docx`, output);
                  setProgress("quickConvert", 100, "DOCX ready");
                  return "High-accuracy DOCX created.";
                }

                const extraction = await extractPdfFile(file, PDF_WORKER_SRC, {
                  onProgress: (progress) => setProgress("quickConvert", Math.round(progress * 0.5), "Reading text structure"),
                });
                const extractedText = extraction.text.replace(/--- Page \d+ ---/g, "").trim();
                const lowTextConfidence = extractedText.length < 120;
                let output: Blob;

                if (lowTextConfidence) {
                  setProgress("quickConvert", 55, "Low text detected, switching to accurate layout mode");
                  const rendered = await renderPdfPages(file, PDF_WORKER_SRC, 180, {
                    onProgress: (progress) => setProgress("quickConvert", 55 + Math.round(progress * 0.45), "Rendering page images"),
                  });
                  output = await buildLayoutPdfDocx(rendered);
                } else {
                  setProgress("quickConvert", 72, "Composing editable Word paragraphs");
                  output = await buildEditablePdfDocx(extraction);
                  setProgress("quickConvert", 100, "DOCX ready");
                }

                dlBlob(`${stem(file.name)}.docx`, output);
                return lowTextConfidence
                  ? "Low text detected, created a page-faithful DOCX."
                  : "Editable DOCX created.";
              });
            }}
            disabled={!getTool("quickConvert").file}
            loading={getTool("quickConvert").loading}
            label="PDF Converter"
          />
        </>
      ),
    },
    {
      title: "Compress PDF",
      accent: "#fa541c",
      icon: <UIcon name="Shrink" size={18} />,
      tip: "Reduce size with balanced JPEG recompression.",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose a PDF"
            file={getTool("compress").file}
            onFile={(file: File) => setTool("compress", { file })}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <HInput
              type="number"
              min="96"
              max="220"
              placeholder="Render DPI"
              value={getTool("compress").dpi || "140"}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setTool("compress", { dpi: event.target.value })
              }
            />
            <HInput
              type="number"
              min="0.3"
              max="0.95"
              step="0.05"
              placeholder="JPEG quality"
              value={getTool("compress").quality || "0.72"}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setTool("compress", { quality: event.target.value })
              }
            />
          </div>
          <ProgressBar progress={getTool("compress").progress || 0} label="Compressing PDF" />
          <CStat msg={getTool("compress").status} type={getTool("compress").statusType} />
          <HBtn
            onClick={async () => {
              const file = getTool("compress").file;
              if (!file) return;

              await run("compress", async () => {
                const result = await optimizePdfForWeb(file, PDF_WORKER_SRC, {
                  dpi: Math.max(96, Math.min(220, Number.parseInt(getTool("compress").dpi || "140", 10) || 140)),
                  quality: Math.max(0.3, Math.min(0.95, getNumber(getTool("compress").quality, 0.72))),
                  onProgress: (progress) => setProgress("compress", progress, "Compressing PDF"),
                });
                dlBlob(`${stem(file.name)}_compressed.pdf`, result.blob);
                setProgress("compress", 100, "Compressed PDF ready");
                return `Compressed from ${formatBytes(result.originalBytes)} to ${formatBytes(result.optimizedBytes)}.`;
              });
            }}
            disabled={!getTool("compress").file}
            loading={getTool("compress").loading}
            label="Compress PDF"
          />
        </>
      ),
    },
    {
      title: "Extract PDF images",
      accent: "#9254de",
      icon: <UIcon name="GalleryHorizontal" size={18} />,
      tip: "Pull embedded images or fall back to page snapshots.",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose a PDF"
            file={getTool("extractImages").file}
            onFile={(file: File) => setTool("extractImages", { file })}
          />
          <ProgressBar progress={getTool("extractImages").progress || 0} label="Scanning PDF image objects" />
          <HelperNote>
            If the PDF has no embedded image objects, the tool exports page snapshots instead so you still get a usable ZIP.
          </HelperNote>
          <CStat msg={getTool("extractImages").status} type={getTool("extractImages").statusType} />
          <HBtn
            onClick={async () => {
              const file = getTool("extractImages").file;
              if (!file) return;

              await run("extractImages", async () => {
                const result = await extractPdfImages(file, PDF_WORKER_SRC, {
                  onProgress: (progress) => setProgress("extractImages", progress, "Reading embedded images"),
                });
                dlBlob(`${stem(file.name)}_images.zip`, result.zip);
                setProgress("extractImages", 100, "ZIP ready");
                return result.fallbackUsed
                  ? "No embedded images found, so page snapshots were exported instead."
                  : `${result.extractedCount} embedded image${result.extractedCount === 1 ? "" : "s"} extracted.`;
              });
            }}
            disabled={!getTool("extractImages").file}
            loading={getTool("extractImages").loading}
            label="Extract PDF images"
          />
        </>
      ),
    },
    {
      title: "Remove PDF pages",
      accent: "#ff7875",
      icon: <UIcon name="Trash2" size={18} />,
      tip: "Delete any pages you do not want in the final file.",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose a PDF"
            file={getTool("removePages").file}
            onFile={(file: File) => setTool("removePages", { file })}
          />
          <HInput
            placeholder="Pages to remove, e.g. 2, 4-7"
            value={getTool("removePages").pages || ""}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setTool("removePages", { pages: event.target.value })
            }
          />
          <CStat msg={getTool("removePages").status} type={getTool("removePages").statusType} />
          <HBtn
            onClick={async () => {
              const file = getTool("removePages").file;
              const pagesInput = getTool("removePages").pages || "";
              if (!file || !pagesInput) return;

              await run("removePages", async () => {
                const { PDFDocument } = window.PDFLib;
                const source = await PDFDocument.load(await file.arrayBuffer());
                const removeSet = new Set(parsePageRange(pagesInput, source.getPageCount()));
                if (!removeSet.size) throw new Error("Enter valid page numbers to remove.");

                const keepPages = source
                  .getPageIndices()
                  .map((pageIndex) => pageIndex + 1)
                  .filter((pageNumber) => !removeSet.has(pageNumber));

                if (!keepPages.length) {
                  throw new Error("You cannot remove every page from the PDF.");
                }

                const output = await PDFDocument.create();
                const copied = await output.copyPages(source, keepPages.map((page) => page - 1));
                copied.forEach((page: any) => output.addPage(page));

                dlBlob(`${stem(file.name)}_trimmed.pdf`, new Blob([await output.save()], { type: "application/pdf" }));
                return `${removeSet.size} page${removeSet.size === 1 ? "" : "s"} removed.`;
              });
            }}
            disabled={!getTool("removePages").file || !getTool("removePages").pages}
            loading={getTool("removePages").loading}
            label="Remove PDF pages"
          />
        </>
      ),
    },
    {
      title: "Rearrange PDF pages",
      accent: "#2f54eb",
      icon: <UIcon name="ArrowUpDown" size={18} />,
      tip: 'Supports custom orders like "3,1,2,8-5".',
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose a PDF"
            file={getTool("reorder").file}
            onFile={(file: File) => setTool("reorder", { file })}
          />
          <HInput
            placeholder="New page order, e.g. 3,1,2,4-6"
            value={getTool("reorder").pages || ""}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setTool("reorder", { pages: event.target.value })
            }
          />
          <CStat msg={getTool("reorder").status} type={getTool("reorder").statusType} />
          <HBtn
            onClick={async () => {
              const file = getTool("reorder").file;
              const pagesInput = getTool("reorder").pages || "";
              if (!file || !pagesInput) return;

              await run("reorder", async () => {
                const { PDFDocument } = window.PDFLib;
                const source = await PDFDocument.load(await file.arrayBuffer());
                const orderedPages = parseOrderedPageList(pagesInput, source.getPageCount());
                if (!orderedPages.length) throw new Error("Enter a valid new page order.");

                const output = await PDFDocument.create();
                const copied = await output.copyPages(source, orderedPages.map((page) => page - 1));
                copied.forEach((page: any) => output.addPage(page));

                dlBlob(`${stem(file.name)}_reordered.pdf`, new Blob([await output.save()], { type: "application/pdf" }));
                return `${orderedPages.length} page${orderedPages.length === 1 ? "" : "s"} rearranged.`;
              });
            }}
            disabled={!getTool("reorder").file || !getTool("reorder").pages}
            loading={getTool("reorder").loading}
            label="Rearrange PDF pages"
          />
        </>
      ),
    },
    {
      title: "PDF Overlay",
      accent: "#1d39c4",
      icon: <UIcon name="Layers3" size={18} />,
      tip: "Overlay another PDF on top of every page or match page-to-page.",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose the base PDF"
            file={getTool("overlay").baseFile}
            onFile={(file: File) => setTool("overlay", { baseFile: file })}
          />
          <FZone
            accept=".pdf"
            label="Choose the overlay PDF"
            file={getTool("overlay").overlayFile}
            onFile={(file: File) => setTool("overlay", { overlayFile: file })}
          />
          <HSel
            value={getTool("overlay").mode || "first"}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
              setTool("overlay", { mode: event.target.value })
            }
          >
            <option value="first">Use overlay page 1 on every page</option>
            <option value="match">Match overlay pages by page number</option>
          </HSel>
          <CStat msg={getTool("overlay").status} type={getTool("overlay").statusType} />
          <HBtn
            onClick={async () => {
              const baseFile = getTool("overlay").baseFile;
              const overlayFile = getTool("overlay").overlayFile;
              if (!baseFile || !overlayFile) return;

              await run("overlay", async () => {
                const { PDFDocument } = window.PDFLib;
                const output = await PDFDocument.load(await baseFile.arrayBuffer());
                const embeddedPages = await output.embedPdf(await overlayFile.arrayBuffer());
                const mode = getTool("overlay").mode || "first";
                if (!embeddedPages.length) throw new Error("The overlay PDF does not contain any pages.");

                output.getPages().forEach((page: any, index: number) => {
                  const overlayPage =
                    mode === "match"
                      ? embeddedPages[Math.min(index, embeddedPages.length - 1)]
                      : embeddedPages[0];
                  page.drawPage(overlayPage, {
                    x: 0,
                    y: 0,
                    width: page.getWidth(),
                    height: page.getHeight(),
                    opacity: 1,
                  });
                });

                dlBlob(`${stem(baseFile.name)}_overlay.pdf`, new Blob([await output.save()], { type: "application/pdf" }));
                return "Overlay PDF created successfully.";
              });
            }}
            disabled={!getTool("overlay").baseFile || !getTool("overlay").overlayFile}
            loading={getTool("overlay").loading}
            label="PDF Overlay"
          />
        </>
      ),
    },
    {
      title: "Webpage to PDF",
      accent: "#eb2f96",
      icon: <UIcon name="Globe" size={18} />,
      tip: "Fetches a webpage and opens a print dialog so you can save it as PDF.",
      body: (
        <>
          <HInput
            type="url"
            placeholder="https://example.com/article"
            value={getTool("webpagePdf").url || ""}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setTool("webpagePdf", { url: event.target.value })
            }
          />
          <HelperNote>
            The page is fetched on the server, converted into a print-ready view, and opened in a same-origin print window.
          </HelperNote>
          <CStat msg={getTool("webpagePdf").status} type={getTool("webpagePdf").statusType} />
          <HBtn
            onClick={async () => {
              const url = (getTool("webpagePdf").url || "").trim();
              if (!url) return;

              await run(
                "webpagePdf",
                async () => {
                  const response = await fetch("/api/webpage-capture", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url }),
                  });
                  const payload = await response.json();
                  if (!response.ok) {
                    throw new Error(payload?.error || "Could not prepare that webpage.");
                  }
                  openPrintWindow(payload.html, payload.title || "Webpage to PDF");
                  return "Print preview opened. Save as PDF from the browser dialog.";
                },
                { requiresLibs: false }
              );
            }}
            disabled={!getTool("webpagePdf").url}
            loading={getTool("webpagePdf").loading}
            label="Webpage to PDF"
          />
        </>
      ),
    },
    {
      title: "PDF OCR",
      accent: "#13c2c2",
      icon: <UIcon name="ScanSearch" size={18} />,
      tip: "Recognize text from scanned or image-only PDFs.",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose a PDF"
            file={getTool("ocr").file}
            onFile={(file: File) => setTool("ocr", { file })}
          />
          <ProgressBar progress={getTool("ocr").progress || 0} label={getTool("ocr").phase || "Running OCR"} />
          <CStat msg={getTool("ocr").status} type={getTool("ocr").statusType} />
          <HBtn
            onClick={async () => {
              const file = getTool("ocr").file;
              if (!file) return;

              await run("ocr", async () => {
                const result = await runPdfOcr(file, PDF_WORKER_SRC, {
                  onProgress: (progress, label) => setProgress("ocr", progress, label || "Running OCR"),
                });
                dlText(`${stem(file.name)}_ocr.txt`, result.text);
                setProgress("ocr", 100, "OCR ready");
                return `OCR completed for ${result.pageCount} page${result.pageCount === 1 ? "" : "s"}.`;
              });
            }}
            disabled={!getTool("ocr").file}
            loading={getTool("ocr").loading}
            label="PDF OCR"
          />
        </>
      ),
    },
    {
      title: "Create PDF",
      accent: "#722ed1",
      icon: <UIcon name="SquarePen" size={18} />,
      tip: "Generate a fresh PDF from typed text or a TXT/MD file.",
      body: (
        <>
          <HInput
            placeholder="Optional title"
            value={getTool("createPdf").title || ""}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setTool("createPdf", { title: event.target.value })
            }
          />
          <TextAreaField
            placeholder="Type or paste the text you want in the PDF..."
            value={getTool("createPdf").body || ""}
            onChange={(event) => setTool("createPdf", { body: event.target.value })}
          />
          <FZone
            accept=".txt,.md"
            label="Optional TXT or MD file"
            file={getTool("createPdf").file}
            onFile={(file: File) => setTool("createPdf", { file })}
          />
          <CStat msg={getTool("createPdf").status} type={getTool("createPdf").statusType} />
          <HBtn
            onClick={async () => {
              const title = getTool("createPdf").title || "";
              const inlineBody = (getTool("createPdf").body || "").trim();
              const sourceFile = getTool("createPdf").file as File | undefined;

              await run("createPdf", async () => {
                const body = inlineBody || (sourceFile ? await sourceFile.text() : "");
                if (!body.trim()) {
                  throw new Error("Add some text or upload a TXT/MD file first.");
                }

                const blob = await buildTextPdfBlob(title.trim(), body);
                dlBlob(`${stem(sourceFile?.name || "created-document")}.pdf`, blob);
                return "PDF created successfully.";
              });
            }}
            disabled={!getTool("createPdf").body && !getTool("createPdf").file}
            loading={getTool("createPdf").loading}
            label="Create PDF"
          />
        </>
      ),
    },
    {
      title: "Web optimize PDF",
      accent: "#00b894",
      icon: <UIcon name="Rocket" size={18} />,
      tip: "Aggressive optimization for web uploads and fast sharing.",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose a PDF"
            file={getTool("webOptimize").file}
            onFile={(file: File) => setTool("webOptimize", { file })}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <HInput
              type="number"
              min="72"
              max="180"
              placeholder="Render DPI"
              value={getTool("webOptimize").dpi || "110"}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setTool("webOptimize", { dpi: event.target.value })
              }
            />
            <HInput
              type="number"
              min="0.2"
              max="0.85"
              step="0.05"
              placeholder="JPEG quality"
              value={getTool("webOptimize").quality || "0.55"}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setTool("webOptimize", { quality: event.target.value })
              }
            />
          </div>
          <ProgressBar progress={getTool("webOptimize").progress || 0} label="Optimizing for web" />
          <CStat msg={getTool("webOptimize").status} type={getTool("webOptimize").statusType} />
          <HBtn
            onClick={async () => {
              const file = getTool("webOptimize").file;
              if (!file) return;

              await run("webOptimize", async () => {
                const result = await optimizePdfForWeb(file, PDF_WORKER_SRC, {
                  dpi: Math.max(72, Math.min(180, Number.parseInt(getTool("webOptimize").dpi || "110", 10) || 110)),
                  quality: Math.max(0.2, Math.min(0.85, getNumber(getTool("webOptimize").quality, 0.55))),
                  grayscale: true,
                  onProgress: (progress) => setProgress("webOptimize", progress, "Optimizing for web"),
                });
                dlBlob(`${stem(file.name)}_web-optimized.pdf`, result.blob);
                setProgress("webOptimize", 100, "Web PDF ready");
                return `Web-optimized from ${formatBytes(result.originalBytes)} to ${formatBytes(result.optimizedBytes)}.`;
              });
            }}
            disabled={!getTool("webOptimize").file}
            loading={getTool("webOptimize").loading}
            label="Web optimize PDF"
          />
        </>
      ),
    },
  ];

  const allCards = [
    ...conversionCards,
    ...organizeCards,
    ...securityCards,
    ...reviewCards,
    ...extraToolCards,
  ];

  return (
    <div className="page-shell">
      {/* Page Hero */}
      <div className="hidden relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ff6b6b]/8 via-transparent to-[#ffa940]/5 border border-white/[0.06] p-8 md:p-10 animate-fade-in">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#ff6b6b]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#ffa940]/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-start gap-5">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff6b6b] to-[#ee5a24] shadow-xl shadow-[#ff6b6b]/25">
            <UIcon name="FileText" size={26} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">PDF Suite</h1>
            <p className="mt-1.5 text-[14px] text-[#9294a5] font-medium max-w-[500px] leading-relaxed">Convert, merge, split, rotate, lock, and unlock — all processing happens in your browser.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Convert", "Merge", "Split", "Rotate", "Lock", "Unlock"].map((t) => (
                <span key={t} className="rounded-lg bg-white/[0.05] border border-white/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6b6d80]">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 [grid-auto-rows:1fr]">
          {allCards.map((card, i) => (
            <div key={card.title} className="animate-fade-in h-full min-h-[420px]" style={{ animationDelay: `${0.08 + i * 0.02}s` }}>
              <Tip tip={card.tip} side="top">
                <CCard ico={card.icon} title={card.title} accentCol={card.accent}>
                  {card.body}
                </CCard>
              </Tip>
            </div>
          ))}
        </div>
      </section>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
