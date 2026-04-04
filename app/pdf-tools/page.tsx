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
    <div className="rounded-[18px] border border-[rgba(110,124,255,.1)] bg-white/74 p-3">
      <div className="mb-2 flex items-center justify-between gap-3 text-[12px] text-ink4">
        <span>{label || "Working..."}</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[rgba(110,124,255,.08)]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-red),var(--color-violet),var(--color-teal))] transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
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
    <div className="flex max-h-[112px] flex-col gap-2 overflow-y-auto">
      {files.map((file) => (
        <div
          key={`${file.name}-${file.size}`}
          className="flex items-center gap-2 rounded-[16px] border border-[rgba(110,124,255,.1)] bg-white/76 px-3 py-2 text-[13px] text-ink3"
        >
          <UIcon name={icon as any} size={14} />
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
      description:
        "Extract page-aware text for internal review, notes, or downstream automations.",
      accent: "#a34b42",
      icon: <UIcon name="FileText" size={24} />,
      tip: "Uses the improved PDF extraction flow for cleaner text output.",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose a PDF"
            file={getTool("pdfTxt").file}
            onFile={(file: File) => setTool("pdfTxt", { file })}
            tip="Upload a PDF to extract its text."
          />
          <ProgressBar
            progress={getTool("pdfTxt").progress || 0}
            label="Extracting text"
          />
          <CStat
            msg={getTool("pdfTxt").status}
            type={getTool("pdfTxt").statusType}
          />
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
                return `${extraction.pageCount} page${
                  extraction.pageCount === 1 ? "" : "s"
                } extracted to TXT.`;
              });
            }}
            disabled={!getTool("pdfTxt").file}
            loading={getTool("pdfTxt").loading}
            label="Extract text"
            tip="Download a text file with page markers and cleaner paragraph flow."
          />
        </>
      ),
    },
    {
      title: "PDF to PNG images",
      description:
        "Render each page as a crisp image and bundle everything into a ZIP.",
      accent: "#1f5a56",
      icon: <UIcon name="Image" size={24} />,
      tip: "Useful for slide decks, page thumbnails, approvals, and archival screenshots.",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose a PDF"
            file={getTool("pdfImg").file}
            onFile={(file: File) => setTool("pdfImg", { file })}
            tip="Upload a PDF for page image export."
          />
          <div className="grid gap-2">
            <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink4">
              Render quality
            </div>
            <HInput
              type="number"
              min="72"
              max="300"
              value={getTool("pdfImg").dpi || "180"}
              tip="Set the image render DPI. Higher values are sharper and larger."
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setTool("pdfImg", { dpi: event.target.value })
              }
            />
            <div className="text-[12px] leading-relaxed text-ink4">
              Higher DPI gives sharper pages but larger downloads. 180 is a good
              premium default.
            </div>
          </div>
          <ProgressBar
            progress={getTool("pdfImg").progress || 0}
            label="Rendering page images"
          />
          <CStat
            msg={getTool("pdfImg").status}
            type={getTool("pdfImg").statusType}
          />
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
                return `${rendered.length} page image${
                  rendered.length === 1 ? "" : "s"
                } packaged in a ZIP.`;
              });
            }}
            disabled={!getTool("pdfImg").file}
            loading={getTool("pdfImg").loading}
            label="Create ZIP"
            tip="Downloads PNG files named page-001, page-002, and so on."
          />
        </>
      ),
    },
    {
      title: "PDF to DOCX",
      description:
        "Offer customers both a page-faithful Word file and an editable text-first Word draft.",
      accent: "#345d9d",
      icon: <UIcon name="FileSignature" size={24} />,
      tip: "Best Accuracy reproduces the original pages. Editable Text builds a cleaner Word draft when the PDF has strong text extraction.",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose a PDF"
            file={getTool("pdfDocx").file}
            onFile={(file: File) => setTool("pdfDocx", { file })}
            tip="Upload the PDF you want to convert into Word."
          />
          <div className="grid gap-2">
            <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink4">
              Output mode
            </div>
            <HSel
              value={getTool("pdfDocx").mode || "layout"}
              tip="Choose between page-faithful accuracy and cleaner editable text."
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                setTool("pdfDocx", { mode: event.target.value })
              }
            >
              <option value="layout">Best accuracy</option>
              <option value="editable">Editable text</option>
            </HSel>
            <div className="rounded-[18px] border border-[rgba(42,34,24,.08)] bg-[rgba(255,250,243,.78)] px-4 py-3 text-[13px] leading-relaxed text-ink4">
              Best accuracy creates a page-faithful DOCX. Editable text creates
              a cleaner Word document when the PDF has a reliable text layer.
            </div>
          </div>
          <ProgressBar
            progress={getTool("pdfDocx").progress || 0}
            label={getTool("pdfDocx").phase || "Building Word output"}
          />
          <CStat
            msg={getTool("pdfDocx").status}
            type={getTool("pdfDocx").statusType}
          />
          <HBtn
            onClick={async () => {
              const file = getTool("pdfDocx").file;
              if (!file) return;

              await run("pdfDocx", async () => {
                const selectedMode = getTool("pdfDocx").mode || "layout";
                setTool("pdfDocx", {
                  phase: "Analyzing PDF text structure",
                  progress: 8,
                });

                const extraction = await extractPdfFile(file, PDF_WORKER_SRC, {
                  onProgress: (progress) =>
                    setTool("pdfDocx", {
                      progress: Math.round(progress * 0.5),
                    }),
                });

                const extractedText = extraction.text
                  .replace(/--- Page \d+ ---/g, "")
                  .trim();
                const lowTextConfidence = extractedText.length < 120;
                const useLayoutMode =
                  selectedMode === "layout" ||
                  (selectedMode === "editable" && lowTextConfidence);

                let output: Blob;

                if (useLayoutMode) {
                  setTool("pdfDocx", {
                    phase:
                      selectedMode === "editable" && lowTextConfidence
                        ? "Low text confidence detected, switching to page-faithful mode"
                        : "Rendering page-faithful Word pages",
                    progress: 55,
                  });

                  const rendered = await renderPdfPages(file, PDF_WORKER_SRC, 180, {
                    onProgress: (progress) =>
                      setTool("pdfDocx", {
                        progress: 55 + Math.round(progress * 0.45),
                      }),
                  });

                  output = await buildLayoutPdfDocx(rendered);
                } else {
                  setTool("pdfDocx", {
                    phase: "Composing editable Word paragraphs",
                    progress: 72,
                  });
                  output = await buildEditablePdfDocx(extraction);
                  setTool("pdfDocx", { progress: 100 });
                }

                dlBlob(`${stem(file.name)}.docx`, output);

                return useLayoutMode
                  ? selectedMode === "editable" && lowTextConfidence
                    ? "Low extractable text detected, so OneDocs created a page-faithful DOCX for accuracy."
                    : "High-accuracy DOCX created successfully."
                  : "Editable DOCX created successfully.";
              });
            }}
            disabled={!getTool("pdfDocx").file}
            loading={getTool("pdfDocx").loading}
            label="Convert to DOCX"
            tip="Choose the page-faithful mode when exact appearance matters most."
          />
        </>
      ),
    },
  ];

  const organizeCards = [
    {
      title: "Merge PDFs",
      description: "Combine multiple files into one polished deliverable.",
      accent: "#7a5b23",
      icon: <UIcon name="Combine" size={24} />,
      tip: "Files are merged in the order you select them.",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose multiple PDFs"
            multi
            files={getTool("merge").files}
            onFiles={(files: File[]) => setTool("merge", { files })}
            tip="Select the PDFs you want to combine."
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
                  const pages = await merged.copyPages(
                    source,
                    source.getPageIndices()
                  );
                  pages.forEach((page: any) => merged.addPage(page));
                }

                const bytes = await merged.save();
                dlBlob("merged.pdf", new Blob([bytes], { type: "application/pdf" }));
                return `${files.length} PDFs merged into one file.`;
              });
            }}
            disabled={!((getTool("merge").files || []).length >= 2)}
            loading={getTool("merge").loading}
            label="Merge PDFs"
            tip="A minimum of two PDFs is required."
          />
        </>
      ),
    },
    {
      title: "Split PDF",
      description: "Extract exact page ranges for cleaner sharing and review.",
      accent: "#1f5a56",
      icon: <UIcon name="ScissorsLineDashed" size={24} />,
      tip: 'Use values like "1-3, 5, 9" to keep only the pages you want.',
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose a PDF"
            file={getTool("split").file}
            onFile={(file: File) => setTool("split", { file })}
            tip="Upload the PDF you want to split."
          />
          <HInput
            placeholder="Page range, for example 1-3, 5, 9"
            value={getTool("split").pages || ""}
            tip="Enter pages or ranges to keep in the split file."
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
                const selectedPages = parsePageRange(
                  pagesInput,
                  source.getPageCount()
                );

                if (!selectedPages.length) {
                  throw new Error("Enter at least one valid page range.");
                }

                const output = await PDFDocument.create();
                const pages = await output.copyPages(
                  source,
                  selectedPages.map((page) => page - 1)
                );
                pages.forEach((page: any) => output.addPage(page));

                const bytes = await output.save();
                dlBlob(
                  `${stem(file.name)}_split.pdf`,
                  new Blob([bytes], { type: "application/pdf" })
                );
                return `${selectedPages.length} page${
                  selectedPages.length === 1 ? "" : "s"
                } extracted.`;
              });
            }}
            disabled={!getTool("split").file || !getTool("split").pages}
            loading={getTool("split").loading}
            label="Extract pages"
            tip="Only the requested pages will be kept in the output file."
          />
        </>
      ),
    },
    {
      title: "Images to PDF",
      description: "Bundle JPG and PNG files into one customer-ready PDF.",
      accent: "#345d9d",
      icon: <UIcon name="Images" size={24} />,
      tip: "Images are added in the same order you choose them.",
      body: (
        <>
          <FZone
            accept="image/png,image/jpeg"
            label="Choose JPG or PNG images"
            multi
            files={getTool("imgPdf").files}
            onFiles={(files: File[]) => setTool("imgPdf", { files })}
            tip="Select one or more images."
          />
          <FileListPreview files={getTool("imgPdf").files} icon="Image" />
          <CStat
            msg={getTool("imgPdf").status}
            type={getTool("imgPdf").statusType}
          />
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
                  page.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: image.width,
                    height: image.height,
                  });
                }

                const output = await pdf.save();
                dlBlob("images.pdf", new Blob([output], { type: "application/pdf" }));
                return `${files.length} image${
                  files.length === 1 ? "" : "s"
                } added to a single PDF.`;
              });
            }}
            disabled={!((getTool("imgPdf").files || []).length > 0)}
            loading={getTool("imgPdf").loading}
            label="Create PDF"
            tip="Each image becomes its own PDF page."
          />
        </>
      ),
    },
    {
      title: "Rotate PDF",
      description: "Apply a clean rotation across every page in the file.",
      accent: "#ba8a42",
      icon: <UIcon name="RotateCw" size={24} />,
      tip: "Useful for scanned pages that were saved sideways or upside down.",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose a PDF"
            file={getTool("rotate").file}
            onFile={(file: File) => setTool("rotate", { file })}
            tip="Upload the PDF you want to rotate."
          />
          <HSel
            value={getTool("rotate").deg || "90"}
            tip="Choose how much rotation to apply to every page."
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
              setTool("rotate", { deg: event.target.value })
            }
          >
            <option value="90">Rotate 90 degrees clockwise</option>
            <option value="180">Rotate 180 degrees</option>
            <option value="270">Rotate 270 degrees</option>
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
                dlBlob(
                  `${stem(file.name)}_rotated.pdf`,
                  new Blob([output], { type: "application/pdf" })
                );
                return `Rotated every page by ${amount} degrees.`;
              });
            }}
            disabled={!getTool("rotate").file}
            loading={getTool("rotate").loading}
            label="Rotate file"
            tip="Applies the same rotation to the full document."
          />
        </>
      ),
    },
    {
      title: "PDF link",
      description:
        "Keep the shareable-link flow separate while the rest of the PDF workspace gets upgraded.",
      accent: "#1f5a56",
      icon: <UIcon name="Link" size={24} />,
      tip: "This uses the dedicated PDF-to-link page, as requested.",
      body: (
        <div className="flex h-full flex-col justify-between gap-5">
          <div className="rounded-[20px] border border-[rgba(42,34,24,.08)] bg-[rgba(248,244,236,.78)] px-4 py-4 text-[14px] leading-relaxed text-ink4">
            The hosted PDF link experience stays on its own dedicated page for
            now. Everything else in this workspace has been tightened around
            accuracy and presentation.
          </div>
          <Link
            href="/pdf-link"
            className="inline-flex items-center justify-center gap-2 rounded-[20px] border border-amber2/30 bg-gradient-to-r from-amber to-amber2 px-5 py-3 text-[15px] font-semibold text-white shadow-[0_18px_30px_rgba(186,138,66,.24)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_36px_rgba(186,138,66,.28)]"
          >
            <UIcon name="ArrowUpRight" size={16} />
            Open PDF link workspace
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="page-shell">
      <section className="surface-panel mt-1 p-5 md:p-8">
        <SHead
          ico={<UIcon name="FileText" size={24} />}
          label="Conversion Tools"
          sub="Convert PDFs into the format you need."
        />
        <div className="grid gap-4 xl:grid-cols-3">
          {conversionCards.map((card) => (
            <Tip key={card.title} tip={card.tip} side="top">
              <CCard
                ico={card.icon}
                title={card.title}
                desc={card.description}
                accentCol={card.accent}
              >
                {card.body}
              </CCard>
            </Tip>
          ))}
        </div>
      </section>

      <section className="surface-panel p-6 md:p-8">
        <SHead
          ico={<UIcon name="Layers3" size={24} />}
          label="Organize And Deliver"
          sub="Merge, split, rotate, and share."
        />
        <div className="grid gap-4 xl:grid-cols-3">
          {organizeCards.map((card) => (
            <Tip key={card.title} tip={card.tip} side="top">
              <CCard
                ico={card.icon}
                title={card.title}
                desc={card.description}
                accentCol={card.accent}
              >
                {card.body}
              </CCard>
            </Tip>
          ))}
        </div>
      </section>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
