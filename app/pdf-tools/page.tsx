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
import { dlBlob, dlText, parsePageRange, stem } from "@/app/lib/utils";
import {
  CCard,
  CStat,
  FZone,
  HBtn,
  HInput,
  HSel,
  SHead,
  Tip,
  Toast,
} from "@/app/components/DocLensUI";
import { UIcon } from "@/app/components/Icons";

declare global {
  interface Window {
    PDFLib: any;
  }
}

const PDF_WORKER_SRC =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

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

  async function run(key: string, task: () => Promise<string>) {
    if (!ready) {
      setTool(key, {
        loading: false,
        status: "PDF libraries are still loading. Please try again in a moment.",
        statusType: "err",
      });
      return;
    }

    setTool(key, { loading: true, status: "", statusType: "" });
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
          <ProgressBar progress={getTool("pdfTxt").progress || 0} label="Extracting text" />
          <CStat msg={getTool("pdfTxt").status} type={getTool("pdfTxt").statusType} />
          <HBtn
            onClick={async () => {
              const file = getTool("pdfTxt").file;
              if (!file) return;
              await run("pdfTxt", async () => {
                const extraction = await extractPdfFile(file, PDF_WORKER_SRC, {
                  onProgress: (progress) =>
                    setTool("pdfTxt", { progress: Math.max(6, progress) }),
                });
                dlText(`${stem(file.name)}.txt`, extraction.text);
                setTool("pdfTxt", { progress: 100 });
                return `${extraction.pageCount} page${extraction.pageCount === 1 ? "" : "s"} extracted to TXT.`;
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
      title: "PDF to PNG images",
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
      title: "Merge PDFs",
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
            label="Merge PDFs"
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
      title: "Rotate PDF",
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
      title: "Lock PDF",
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
          }} disabled={!getTool("lock").file || !getTool("lock").password} loading={getTool("lock").loading} label="Lock PDF" />
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

  return (
    <div className="page-shell">
      {/* Page Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ff6b6b]/8 via-transparent to-[#ffa940]/5 border border-white/[0.06] p-8 md:p-10 animate-fade-in">
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

      <section className="surface-panel p-6 md:p-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <SHead ico={<UIcon name="FileText" size={18} />} label="Conversion Tools" sub="Transform PDFs to other formats" />
        <div className="grid gap-5 xl:grid-cols-3">
          {conversionCards.map((card, i) => (
            <div key={card.title} className="animate-fade-in" style={{ animationDelay: `${0.15 + i * 0.05}s` }}>
              <Tip tip={card.tip} side="top">
                <CCard ico={card.icon} title={card.title} accentCol={card.accent}>
                  {card.body}
                </CCard>
              </Tip>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-panel p-6 md:p-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <SHead ico={<UIcon name="Layers3" size={18} />} label="Organize & Deliver" sub="Restructure and combine your documents" />
        <div className="grid gap-5 xl:grid-cols-3">
          {organizeCards.map((card, i) => (
            <div key={card.title} className="animate-fade-in" style={{ animationDelay: `${0.25 + i * 0.05}s` }}>
              <Tip tip={card.tip} side="top">
                <CCard ico={card.icon} title={card.title} accentCol={card.accent}>
                  {card.body}
                </CCard>
              </Tip>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-panel p-6 md:p-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <SHead ico={<UIcon name="ShieldCheck" size={18} />} label="Security" sub="Protect or unlock PDF files" />
        <div className="grid gap-5 xl:grid-cols-2">
          {securityCards.map((card, i) => (
            <div key={card.title} className="animate-fade-in" style={{ animationDelay: `${0.35 + i * 0.05}s` }}>
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
