"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useCallback, useState } from "react";
import { useScripts } from "@/app/hooks/useScripts";
import {
  buildStandaloneHtml,
  convertDocxToRichHtml,
  htmlToMarkdown,
  openPrintPreviewWindow,
  parseCsv,
} from "@/app/lib/rich-exports";
import { dlBlob, dlText, esc, stem } from "@/app/lib/utils";
import {
  CCard,
  CStat,
  FZone,
  HBtn,
  SHead,
  Tip,
  Toast,
} from "@/app/components/DocLensUI";
import { UIcon } from "@/app/components/Icons";

function CsvPreview({
  rows,
}: {
  rows: string[][];
}) {
  if (!rows.length) return null;

  const [header, ...body] = rows;

  return (
    <div className="overflow-hidden rounded-[20px] border border-[rgba(42,34,24,.08)] bg-white/72">
      <div className="grid grid-cols-1 border-b border-[rgba(42,34,24,.08)] bg-[rgba(248,244,236,.85)] px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink4">
        {header.join(" · ")}
      </div>
      <div className="max-h-[140px] overflow-auto">
        {body.slice(0, 4).map((row, index) => (
          <div
            key={`${row.join("|")}-${index}`}
            className="grid grid-cols-1 gap-1 border-b border-[rgba(42,34,24,.06)] px-4 py-3 text-[13px] text-ink3 last:border-b-0"
          >
            {row.join(" · ")}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DocxToolsPage() {
  const ready = useScripts([
    "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js",
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
        status: "DOCX libraries are still loading. Please try again in a moment.",
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

  const docxCards = [
    {
      title: "DOCX to HTML",
      description:
        "Convert Word documents into richer standalone web pages with stronger structure preservation.",
      accent: "#1f5a56",
      icon: <UIcon name="Globe" size={24} />,
      tip: "Great for sending formatted content to clients or publishing internal drafts.",
      body: (
        <>
          <FZone
            accept=".docx"
            label="Choose a DOCX"
            file={getTool("docxHtml").file}
            onFile={(file: File) => setTool("docxHtml", { file })}
            tip="Upload a Word file to export a standalone HTML page."
          />
          <CStat
            msg={getTool("docxHtml").status}
            type={getTool("docxHtml").statusType}
          />
          <HBtn
            onClick={async () => {
              const file = getTool("docxHtml").file;
              if (!file) return;

              await run("docxHtml", async () => {
                const htmlBody = await convertDocxToRichHtml(
                  (window as any).mammoth,
                  await file.arrayBuffer()
                );
                const page = buildStandaloneHtml(stem(file.name), htmlBody);
                dlText(`${stem(file.name)}.html`, page);
                return "Standalone HTML exported successfully.";
              });
            }}
            disabled={!getTool("docxHtml").file}
            loading={getTool("docxHtml").loading}
            label="Export HTML"
            tip="Builds a self-contained premium HTML document."
          />
        </>
      ),
    },
    {
      title: "DOCX to TXT",
      description:
        "Strip formatting and keep only the readable text for indexing, notes, or downstream tooling.",
      accent: "#a34b42",
      icon: <UIcon name="FileText" size={24} />,
      tip: "Useful when you need clean raw text rather than visual formatting.",
      body: (
        <>
          <FZone
            accept=".docx"
            label="Choose a DOCX"
            file={getTool("docxTxt").file}
            onFile={(file: File) => setTool("docxTxt", { file })}
            tip="Upload a Word file to extract plain text."
          />
          <CStat
            msg={getTool("docxTxt").status}
            type={getTool("docxTxt").statusType}
          />
          <HBtn
            onClick={async () => {
              const file = getTool("docxTxt").file;
              if (!file) return;

              await run("docxTxt", async () => {
                const result = await window.mammoth.extractRawText({
                  arrayBuffer: await file.arrayBuffer(),
                });
                dlText(`${stem(file.name)}.txt`, result.value);
                return "Plain text extracted successfully.";
              });
            }}
            disabled={!getTool("docxTxt").file}
            loading={getTool("docxTxt").loading}
            label="Extract text"
            tip="Downloads a clean TXT file."
          />
        </>
      ),
    },
    {
      title: "DOCX to Markdown",
      description:
        "Produce cleaner markdown from richer HTML conversion instead of a basic text dump.",
      accent: "#345d9d",
      icon: <UIcon name="NotebookPen" size={24} />,
      tip: "Works well for product docs, changelogs, knowledge bases, and GitHub content.",
      body: (
        <>
          <FZone
            accept=".docx"
            label="Choose a DOCX"
            file={getTool("docxMd").file}
            onFile={(file: File) => setTool("docxMd", { file })}
            tip="Upload a Word file to convert it into markdown."
          />
          <CStat
            msg={getTool("docxMd").status}
            type={getTool("docxMd").statusType}
          />
          <HBtn
            onClick={async () => {
              const file = getTool("docxMd").file;
              if (!file) return;

              await run("docxMd", async () => {
                const htmlBody = await convertDocxToRichHtml(
                  (window as any).mammoth,
                  await file.arrayBuffer()
                );
                const markdown = htmlToMarkdown(htmlBody);
                dlText(`${stem(file.name)}.md`, markdown);
                return "Markdown exported successfully.";
              });
            }}
            disabled={!getTool("docxMd").file}
            loading={getTool("docxMd").loading}
            label="Export Markdown"
            tip="Uses the richer HTML conversion flow before translating to markdown."
          />
        </>
      ),
    },
    {
      title: "DOCX to PDF",
      description:
        "Open a print-ready preview that preserves more structure and can be saved as PDF from the browser print flow.",
      accent: "#ba8a42",
      icon: <UIcon name="Printer" size={24} />,
      tip: "This avoids low-quality text-only PDF output by using a richer preview path.",
      body: (
        <>
          <FZone
            accept=".docx"
            label="Choose a DOCX"
            file={getTool("docxPdf").file}
            onFile={(file: File) => setTool("docxPdf", { file })}
            tip="Upload a Word file to prepare a print-ready PDF view."
          />
          <CStat
            msg={getTool("docxPdf").status}
            type={getTool("docxPdf").statusType}
          />
          <HBtn
            onClick={async () => {
              const file = getTool("docxPdf").file;
              if (!file) return;

              let preview: Window | null = null;
              try {
                preview = openPrintPreviewWindow(`${stem(file.name)} Preview`);
              } catch (error: any) {
                setTool("docxPdf", {
                  status: error?.message || "Could not open the preview window.",
                  statusType: "err",
                });
                return;
              }

              await run("docxPdf", async () => {
                try {
                  const htmlBody = await convertDocxToRichHtml(
                    (window as any).mammoth,
                    await file.arrayBuffer()
                  );
                  const page = buildStandaloneHtml(stem(file.name), htmlBody);
                  preview?.document.open();
                  preview?.document.write(page);
                  preview?.document.close();
                  window.setTimeout(() => preview?.print(), 180);
                  return "Print-ready preview opened. Save as PDF from the print dialog.";
                } catch (error) {
                  preview?.close();
                  throw error;
                }
              });
            }}
            disabled={!getTool("docxPdf").file}
            loading={getTool("docxPdf").loading}
            label="Open PDF preview"
            tip="Opens a new print dialog path that can be saved as a PDF."
          />
        </>
      ),
    },
  ];

  const dataCards = [
    {
      title: "TXT or MD to PDF",
      description:
        "Turn plain text content into a simple A4 PDF for quick delivery or review.",
      accent: "#a34b42",
      icon: <UIcon name="ScrollText" size={24} />,
      tip: "Useful for reports, notes, markdown drafts, and quick handoffs.",
      body: (
        <>
          <FZone
            accept=".txt,.md"
            label="Choose a TXT or MD file"
            file={getTool("txtPdf").file}
            onFile={(file: File) => setTool("txtPdf", { file })}
            tip="Upload plain text or markdown."
          />
          <CStat
            msg={getTool("txtPdf").status}
            type={getTool("txtPdf").statusType}
          />
          <HBtn
            onClick={async () => {
              const file = getTool("txtPdf").file;
              if (!file) return;

              await run("txtPdf", async () => {
                const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
                const text = await file.text();
                const pdf = await PDFDocument.create();
                const font = await pdf.embedFont(StandardFonts.Helvetica);
                const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

                const fontSize = 11;
                const lineHeight = 16;
                const margin = 54;
                const pageWidth = 595;
                const pageHeight = 842;
                const maxWidth = pageWidth - margin * 2;
                const lines: string[] = [];

                text.split("\n").forEach((line: string) => {
                  if (!line.trim()) {
                    lines.push("");
                    return;
                  }

                  const words = line.split(/\s+/);
                  let current = "";
                  for (const word of words) {
                    const candidate = current ? `${current} ${word}` : word;
                    if (font.widthOfTextAtSize(candidate, fontSize) > maxWidth && current) {
                      lines.push(current);
                      current = word;
                    } else {
                      current = candidate;
                    }
                  }
                  if (current) lines.push(current);
                });

                let page = pdf.addPage([pageWidth, pageHeight]);
                let y = pageHeight - margin;

                page.drawText(stem(file.name), {
                  x: margin,
                  y,
                  size: 18,
                  font: bold,
                  color: rgb(0.12, 0.07, 0.04),
                });
                y -= 28;
                page.drawLine({
                  start: { x: margin, y },
                  end: { x: pageWidth - margin, y },
                  thickness: 0.8,
                  color: rgb(0.8, 0.75, 0.68),
                });
                y -= 18;

                for (const line of lines) {
                  if (y < margin + lineHeight) {
                    page = pdf.addPage([pageWidth, pageHeight]);
                    y = pageHeight - margin;
                  }
                  if (line) {
                    page.drawText(line, {
                      x: margin,
                      y,
                      size: fontSize,
                      font,
                      color: rgb(0.1, 0.1, 0.1),
                    });
                  }
                  y -= lineHeight;
                }

                const output = await pdf.save();
                dlBlob(`${stem(file.name)}.pdf`, new Blob([output], { type: "application/pdf" }));
                return "PDF generated successfully.";
              });
            }}
            disabled={!getTool("txtPdf").file}
            loading={getTool("txtPdf").loading}
            label="Create PDF"
            tip="Builds a clean PDF from your text content."
          />
        </>
      ),
    },
    {
      title: "CSV to HTML table",
      description:
        "Create a cleaner, presentation-ready HTML table using more reliable CSV parsing.",
      accent: "#1f5a56",
      icon: <UIcon name="TableProperties" size={24} />,
      tip: "Supports quoted cells and produces a stronger standalone HTML export.",
      body: (
        <>
          <FZone
            accept=".csv"
            label="Choose a CSV file"
            file={getTool("csvHtml").file}
            onFile={(file: File) => setTool("csvHtml", { file })}
            tip="Upload comma-separated data."
          />
          <CsvPreview rows={getTool("csvHtml").preview || []} />
          <CStat
            msg={getTool("csvHtml").status}
            type={getTool("csvHtml").statusType}
          />
          <HBtn
            onClick={async () => {
              const file = getTool("csvHtml").file;
              if (!file) return;

              await run("csvHtml", async () => {
                const rows = parseCsv(await file.text());
                if (!rows.length) {
                  throw new Error("The CSV file appears to be empty.");
                }

                const [header, ...body] = rows;
                setTool("csvHtml", { preview: rows.slice(0, 5) });

                const bodyHtml = `
                  <p>${body.length.toLocaleString()} row${
                    body.length === 1 ? "" : "s"
                  } converted from <strong>${esc(file.name)}</strong>.</p>
                  <table>
                    <thead>
                      <tr>${header
                        .map((cell) => `<th>${esc(cell)}</th>`)
                        .join("")}</tr>
                    </thead>
                    <tbody>
                      ${body
                        .map(
                          (row) =>
                            `<tr>${row
                              .map((cell) => `<td>${esc(cell)}</td>`)
                              .join("")}</tr>`
                        )
                        .join("")}
                    </tbody>
                  </table>
                `;

                dlText(
                  `${stem(file.name)}.html`,
                  buildStandaloneHtml(stem(file.name), bodyHtml)
                );

                return `${body.length.toLocaleString()} CSV row${
                  body.length === 1 ? "" : "s"
                } exported to HTML.`;
              });
            }}
            disabled={!getTool("csvHtml").file}
            loading={getTool("csvHtml").loading}
            label="Export HTML"
            tip="Builds a standalone HTML page with a styled table."
          />
        </>
      ),
    },
  ];

  return (
    <div className="page-shell">
      <section className="page-hero p-6 md:p-7">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="page-kicker mb-4">DOCX tools</div>
            <h1 className="page-title">Convert DOCX files without the extra noise.</h1>
            <p className="page-copy mt-3">
              Export Word files into simpler formats and print-ready views.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <span className="premium-chip">HTML</span>
            <span className="premium-chip">Markdown</span>
            <span className="premium-chip">Text</span>
            <span className="premium-chip">PDF preview</span>
          </div>
        </div>
      </section>

      <section className="surface-panel mt-5 p-6 md:p-8">
        <SHead
          ico={<UIcon name="FileSignature" size={24} />}
          label="DOCX Conversions"
          sub="Core conversions for Word documents."
        />
        <div className="grid gap-4 xl:grid-cols-2">
          {docxCards.map((card) => (
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
          ico={<UIcon name="FileSpreadsheet" size={24} />}
          label="Text And Data"
          sub="Simple helpers for text and CSV files."
        />
        <div className="grid gap-4 xl:grid-cols-2">
          {dataCards.map((card) => (
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
