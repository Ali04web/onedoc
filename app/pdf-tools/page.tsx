"use client";

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
import { Emoji } from "@/app/components/Icons";

declare global {
  interface Window {
    PDFLib: any;
  }
}

const PDF_JS_SRC =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDF_WORKER_SRC =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const PDF_LIB_SRC =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js";
const JSZIP_SRC =
  "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";

type ToolState = Record<string, Record<string, any>>;

export default function PdfToolsPage() {
  const ready = useScripts([PDF_JS_SRC, PDF_LIB_SRC, JSZIP_SRC]);

  const [st, setSt] = useState<ToolState>({
    pdfImg: { dpi: "192" },
    pdfDocx: { mode: "layout", dpi: "216" },
    rotate: { deg: "90" },
  });
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => setToast(msg), []);

  const g = (key: string) => st[key] || {};
  const s = (key: string, value: Record<string, any>) =>
    setSt((prev) => ({ ...prev, [key]: { ...prev[key], ...value } }));

  async function run(key: string, fn: () => Promise<string>) {
    s(key, { loading: true, status: "", statusType: "" });
    try {
      const message = await fn();
      s(key, { loading: false, status: message, statusType: "ok" });
      showToast(message);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      s(key, { loading: false, status: message, statusType: "err" });
    }
  }

  const listMarkup = (files: File[] | undefined, icon: string) =>
    (files || []).length > 0 && (
      <div className="mt-1 flex max-h-[100px] flex-col gap-1.5 overflow-y-auto pr-2">
        {files?.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="flex items-center gap-2 overflow-hidden rounded-lg border border-paper3 bg-paper px-3 py-2 text-xs font-medium text-ink3 shadow-sm"
          >
            <Emoji symbol={icon} size={14} />
            <span className="truncate">{file.name}</span>
          </div>
        ))}
      </div>
    );

  const progressBar = (key: string) =>
    g(key).loading && (g(key).prog || 0) > 0 ? (
      <div className="h-1.5 overflow-hidden rounded-full border border-paper3 bg-paper3">
        <div
          className="h-full rounded-full bg-amber transition-all duration-300"
          style={{ width: `${g(key).prog || 0}%` }}
        />
      </div>
    ) : null;

  const convFns = {
    pdfTxt: async () => {
      const file = g("pdfTxt").file as File | undefined;
      if (!file) return;

      await run("pdfTxt", async () => {
        const extraction = await extractPdfFile(file, PDF_WORKER_SRC, {
          onProgress: (prog) => s("pdfTxt", { prog }),
        });

        dlText(stem(file.name) + ".txt", extraction.text);
        return `${extraction.pageCount} pages extracted with cleaner reading order`;
      });
    },
    pdfImg: async () => {
      const file = g("pdfImg").file as File | undefined;
      if (!file) return;

      const dpi = parseInt(g("pdfImg").dpi || "192", 10) || 192;

      await run("pdfImg", async () => {
        const renderedPages = await renderPdfPages(file, PDF_WORKER_SRC, dpi, {
          onProgress: (prog) => s("pdfImg", { prog }),
        });
        const zipBlob = await buildPdfImageZip(renderedPages);
        dlBlob(stem(file.name) + "_images.zip", zipBlob);
        return `${renderedPages.length} pages exported as sharp PNG images`;
      });
    },
    merge: async () => {
      const files = (g("merge").files || []) as File[];
      if (files.length < 2) return;

      await run("merge", async () => {
        const { PDFDocument } = window.PDFLib;
        const merged = await PDFDocument.create();

        for (const file of files) {
          const source = await PDFDocument.load(await file.arrayBuffer());
          const pages = await merged.copyPages(source, source.getPageIndices());
          pages.forEach((page: unknown) => merged.addPage(page));
        }

        const bytes = await merged.save();
        dlBlob(
          stem(files[0].name) + "_merged.pdf",
          new Blob([bytes], { type: "application/pdf" })
        );
        return `${files.length} PDFs merged into one file`;
      });
    },
    split: async () => {
      const file = g("split").file as File | undefined;
      const pageRange = (g("split").pages || "") as string;
      if (!file) return;

      await run("split", async () => {
        const { PDFDocument } = window.PDFLib;
        const source = await PDFDocument.load(await file.arrayBuffer());
        const pages = parsePageRange(pageRange, source.getPageCount());

        if (!pages.length) {
          throw new Error("Enter at least one valid page or page range.");
        }

        const output = await PDFDocument.create();
        const copiedPages = await output.copyPages(
          source,
          pages.map((page) => page - 1)
        );
        copiedPages.forEach((page: unknown) => output.addPage(page));

        const bytes = await output.save();
        dlBlob(
          stem(file.name) + "_split.pdf",
          new Blob([bytes], { type: "application/pdf" })
        );
        return `${pages.length} page(s) extracted successfully`;
      });
    },
    imgPdf: async () => {
      const files = (g("imgPdf").files || []) as File[];
      if (!files.length) return;

      await run("imgPdf", async () => {
        const { PDFDocument } = window.PDFLib;
        const pdf = await PDFDocument.create();
        const margin = 24;

        for (const file of files) {
          const bytes = await file.arrayBuffer();
          const image = file.type === "image/png"
            ? await pdf.embedPng(bytes)
            : await pdf.embedJpg(bytes);

          const landscape = image.width > image.height;
          const pageWidth = landscape ? 841.89 : 595.28;
          const pageHeight = landscape ? 595.28 : 841.89;
          const page = pdf.addPage([pageWidth, pageHeight]);

          const maxWidth = pageWidth - margin * 2;
          const maxHeight = pageHeight - margin * 2;
          const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
          const drawWidth = image.width * scale;
          const drawHeight = image.height * scale;

          page.drawImage(image, {
            x: (pageWidth - drawWidth) / 2,
            y: (pageHeight - drawHeight) / 2,
            width: drawWidth,
            height: drawHeight,
          });
        }

        const bytes = await pdf.save();
        dlBlob("images.pdf", new Blob([bytes], { type: "application/pdf" }));
        return `${files.length} images fitted onto print-friendly PDF pages`;
      });
    },
    rotate: async () => {
      const file = g("rotate").file as File | undefined;
      if (!file) return;

      const degreesToRotate = parseInt(g("rotate").deg || "90", 10) || 90;

      await run("rotate", async () => {
        const { PDFDocument, degrees } = window.PDFLib;
        const pdf = await PDFDocument.load(await file.arrayBuffer());

        pdf.getPages().forEach((page: any) => {
          const current = page.getRotation().angle;
          page.setRotation(degrees((current + degreesToRotate) % 360));
        });

        const bytes = await pdf.save();
        dlBlob(
          stem(file.name) + "_rotated.pdf",
          new Blob([bytes], { type: "application/pdf" })
        );
        return `All pages rotated by ${degreesToRotate} degrees`;
      });
    },
    pdfDocx: async () => {
      const file = g("pdfDocx").file as File | undefined;
      if (!file) return;

      const mode = (g("pdfDocx").mode || "layout") as "layout" | "editable";
      const dpi = parseInt(g("pdfDocx").dpi || "216", 10) || 216;

      await run("pdfDocx", async () => {
        if (mode === "layout") {
          const renderedPages = await renderPdfPages(file, PDF_WORKER_SRC, dpi, {
            onProgress: (prog) => s("pdfDocx", { prog }),
          });
          const blob = await buildLayoutPdfDocx(renderedPages);
          dlBlob(stem(file.name) + "_accurate.docx", blob);
          return `${renderedPages.length} pages converted to a layout-preserving DOCX`;
        }

        const extraction = await extractPdfFile(file, PDF_WORKER_SRC, {
          onProgress: (prog) => s("pdfDocx", { prog }),
        });
        const meaningfulChars = extraction.text.replace(/[\W_]+/g, "").length;

        if (meaningfulChars < 60) {
          throw new Error(
            "This PDF looks scanned or image-based. Use Best accuracy mode for a page-perfect DOCX."
          );
        }

        const blob = await buildEditablePdfDocx(extraction);
        dlBlob(stem(file.name) + "_editable.docx", blob);
        return `${extraction.pageCount} pages converted to an editable DOCX draft`;
      });
    },
  };

  const cards = [
    {
      ico: "📄",
      title: "PDF -> Plain Text",
      desc: "Extract cleaner text with better reading order and paragraph spacing",
      col: "#ef4444",
      tip: "Useful for contracts, reports, essays, and searchable archives",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Drop a PDF here"
            file={g("pdfTxt").file}
            onFile={(file: File) => s("pdfTxt", { file })}
            tip="Choose the PDF you want to extract text from"
          />
          {progressBar("pdfTxt")}
          <CStat msg={g("pdfTxt").status} type={g("pdfTxt").statusType} />
          <HBtn
            onClick={convFns.pdfTxt}
            disabled={!g("pdfTxt").file}
            loading={g("pdfTxt").loading}
            label="Extract Text"
            tip="Downloads a TXT file with page markers"
          />
        </>
      ),
    },
    {
      ico: "🖼️",
      title: "PDF -> PNG Images",
      desc: "Render every page as a high-quality PNG and bundle them into a ZIP",
      col: "#10b981",
      tip: "Great for previews, design reviews, social posts, and print proofing",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Drop a PDF here"
            file={g("pdfImg").file}
            onFile={(file: File) => s("pdfImg", { file })}
            tip="Choose the PDF you want to turn into images"
          />
          <div className="flex items-center gap-2">
            <HInput
              type="number"
              min="96"
              max="300"
              value={g("pdfImg").dpi || "192"}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                s("pdfImg", { dpi: event.target.value })
              }
              className="max-w-[96px]"
            />
            <Tip tip="Higher DPI gives sharper pages but larger files">
              <span className="text-sm font-medium text-ink4">DPI (96-300)</span>
            </Tip>
          </div>
          {progressBar("pdfImg")}
          <CStat msg={g("pdfImg").status} type={g("pdfImg").statusType} />
          <HBtn
            onClick={convFns.pdfImg}
            disabled={!g("pdfImg").file}
            loading={g("pdfImg").loading}
            label="Export PNG ZIP"
            tip="Creates one PNG per page"
          />
        </>
      ),
    },
    {
      ico: "🧩",
      title: "Merge PDFs",
      desc: "Combine multiple PDFs into a single file in the order you choose",
      col: "#f59e0b",
      tip: "Useful for proposals, invoices, chapter bundles, and board packs",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Choose multiple PDFs"
            multi
            files={g("merge").files}
            onFiles={(files: File[]) => s("merge", { files })}
            tip="Pick at least two PDFs"
          />
          {listMarkup(g("merge").files as File[] | undefined, "📄")}
          <CStat msg={g("merge").status} type={g("merge").statusType} />
          <HBtn
            onClick={convFns.merge}
            disabled={!g("merge").files || g("merge").files.length < 2}
            loading={g("merge").loading}
            label="Merge Files"
            tip="Downloads one merged PDF"
          />
        </>
      ),
    },
    {
      ico: "✂️",
      title: "Split PDF",
      desc: "Pull out exact pages or page ranges without changing the originals",
      col: "#10b981",
      tip: "Examples: 1-3, 5, 7-9",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Drop a PDF here"
            file={g("split").file}
            onFile={(file: File) => s("split", { file })}
            tip="Choose the PDF you want to split"
          />
          <Tip tip="Use commas between separate pages or ranges">
            <HInput
              placeholder="Pages: 1-3, 5, 7"
              value={g("split").pages || ""}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                s("split", { pages: event.target.value })
              }
            />
          </Tip>
          <CStat msg={g("split").status} type={g("split").statusType} />
          <HBtn
            onClick={convFns.split}
            disabled={!g("split").file || !g("split").pages}
            loading={g("split").loading}
            label="Extract Pages"
            tip="Creates a new PDF from the selected pages"
          />
        </>
      ),
    },
    {
      ico: "🖼️",
      title: "Images -> PDF",
      desc: "Fit JPG and PNG files onto clean, print-friendly A4 pages",
      col: "#3b82f6",
      tip: "Keeps margins consistent and centers each image neatly",
      body: (
        <>
          <FZone
            accept="image/png,image/jpeg"
            label="Choose images (PNG or JPG)"
            multi
            files={g("imgPdf").files}
            onFiles={(files: File[]) => s("imgPdf", { files })}
            tip="Select one or more images"
          />
          {listMarkup(g("imgPdf").files as File[] | undefined, "🖼️")}
          <CStat msg={g("imgPdf").status} type={g("imgPdf").statusType} />
          <HBtn
            onClick={convFns.imgPdf}
            disabled={!g("imgPdf").files || g("imgPdf").files.length === 0}
            loading={g("imgPdf").loading}
            label="Create PDF"
            tip="Builds a polished image-to-PDF document"
          />
        </>
      ),
    },
    {
      ico: "🔄",
      title: "Rotate PDF",
      desc: "Rotate every page by the same angle for cleaner reading and printing",
      col: "#8b5cf6",
      tip: "Ideal for scanned PDFs and sideways exports",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Drop a PDF here"
            file={g("rotate").file}
            onFile={(file: File) => s("rotate", { file })}
            tip="Choose the PDF whose pages you want to rotate"
          />
          <Tip tip="Applies the chosen angle to every page">
            <HSel
              value={g("rotate").deg || "90"}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                s("rotate", { deg: event.target.value })
              }
            >
              <option value="90">Rotate 90 degrees clockwise</option>
              <option value="180">Rotate 180 degrees</option>
              <option value="270">Rotate 270 degrees counter-clockwise</option>
            </HSel>
          </Tip>
          <CStat msg={g("rotate").status} type={g("rotate").statusType} />
          <HBtn
            onClick={convFns.rotate}
            disabled={!g("rotate").file}
            loading={g("rotate").loading}
            label="Rotate PDF"
            tip="Downloads a corrected PDF"
          />
        </>
      ),
    },
    {
      ico: "📝",
      title: "PDF -> DOCX",
      desc: "Two output modes: page-perfect accuracy or an editable Word draft",
      col: "#3b82f6",
      tip: "Best accuracy keeps the original look. Editable mode rebuilds paragraphs and headings.",
      body: (
        <>
          <FZone
            accept=".pdf"
            label="Drop a PDF here"
            file={g("pdfDocx").file}
            onFile={(file: File) => s("pdfDocx", { file })}
            tip="Choose the PDF you want to convert to Word"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <Tip tip="Best accuracy preserves the page layout. Editable text rebuilds the content as paragraphs.">
              <HSel
                value={g("pdfDocx").mode || "layout"}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                  s("pdfDocx", { mode: event.target.value })
                }
              >
                <option value="layout">Best accuracy</option>
                <option value="editable">Editable text</option>
              </HSel>
            </Tip>
            <Tip tip="Only used in Best accuracy mode. Higher DPI produces sharper page images inside the DOCX.">
              <HSel
                value={g("pdfDocx").dpi || "216"}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                  s("pdfDocx", { dpi: event.target.value })
                }
              >
                <option value="144">Balanced quality</option>
                <option value="216">High accuracy</option>
                <option value="300">Maximum detail</option>
              </HSel>
            </Tip>
          </div>
          <div className="rounded-lg border border-paper3 bg-paper px-3 py-2 text-xs leading-relaxed text-ink4">
            {(g("pdfDocx").mode || "layout") === "layout"
              ? "Best accuracy creates a page-for-page DOCX that looks very close to the original PDF, including scans."
              : "Editable text rebuilds headings, bullets, and paragraphs. It is better for editing, but complex layouts can still shift."}
          </div>
          {progressBar("pdfDocx")}
          <CStat msg={g("pdfDocx").status} type={g("pdfDocx").statusType} />
          <HBtn
            onClick={convFns.pdfDocx}
            disabled={!g("pdfDocx").file}
            loading={g("pdfDocx").loading}
            label="Convert to DOCX"
            tip="Exports either a high-fidelity or editable Word file"
          />
        </>
      ),
    },
    {
      ico: "🔗",
      title: "PDF -> Link",
      desc: "Left unchanged for now while the conversion tools are upgraded",
      col: "#10b981",
      tip: "You asked to leave this feature alone for the moment",
      body: (
        <div className="relative flex flex-col items-center gap-4 py-4">
          <div className="absolute -right-2 -top-3 rounded-full border border-paper3 bg-paper px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink4">
            Paused
          </div>
          <div className="text-center text-sm font-medium leading-relaxed text-ink4">
            This feature is staying as-is right now while the PDF conversion flow
            gets the quality upgrade.
          </div>
          <Link
            href="/pdf-link"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-amber px-6 py-3 text-[15px] font-bold text-white no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber2 hover:shadow"
          >
            <Emoji symbol="🔗" size={18} /> Open PDF Link
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-y-auto px-6 py-8 md:px-10 lg:px-20">
      {!ready && (
        <div className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-amber/10 bg-amber/5 p-3 text-center text-amber">
          <Emoji symbol="⏳" size={16} />
          <span className="text-sm font-medium">Loading PDF libraries...</span>
        </div>
      )}

      <SHead
        ico="📄"
        label="PDF Tools"
        sub="Higher-fidelity exports, cleaner extraction, and sharper PDF workflows"
      />

      <div className="mb-6 rounded-2xl border border-paper3 bg-paper2/70 p-5 text-sm leading-relaxed text-ink3 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-base font-semibold text-ink2">
          <Emoji symbol="✨" size={18} /> PDF to DOCX is now quality-first
        </div>
        <div>
          Use <span className="font-semibold text-ink2">Best accuracy</span> for
          a page-faithful DOCX that mirrors the PDF, or switch to
          <span className="font-semibold text-ink2"> Editable text</span> when
          your customers need a Word file they can revise.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {cards.map(({ ico, title, desc, col, body, tip }) => (
          <Tip key={title} tip={tip} side="top">
            <CCard ico={ico} title={title} desc={desc} accentCol={col}>
              {body}
            </CCard>
          </Tip>
        ))}
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
