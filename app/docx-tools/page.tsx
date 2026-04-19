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

function CsvPreview({ rows }: { rows: string[][] }) {
  if (!rows.length) return null;

  const [header, ...body] = rows;

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <div className="border-b border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#6b6d80]">
        {header.join(" · ")}
      </div>
      <div className="max-h-[120px] overflow-auto">
        {body.slice(0, 4).map((row, index) => (
          <div
            key={`${row.join("|")}-${index}`}
            className="border-b border-white/[0.04] px-4 py-2.5 text-[12px] text-[#9294a5] last:border-b-0"
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
      accent: "#f59e0b",
      icon: <UIcon name="Globe" size={18} />,
      tip: "Export as standalone web page.",
      body: (
        <>
          <FZone
            accept=".docx"
            label="Choose a DOCX"
            file={getTool("docxHtml").file}
            onFile={(file: File) => setTool("docxHtml", { file })}
          />
          <CStat msg={getTool("docxHtml").status} type={getTool("docxHtml").statusType} />
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
                return "Standalone HTML exported.";
              });
            }}
            disabled={!getTool("docxHtml").file}
            loading={getTool("docxHtml").loading}
            label="Export HTML"
          />
        </>
      ),
    },
    {
      title: "DOCX to TXT",
      accent: "#ff6b6b",
      icon: <UIcon name="FileText" size={18} />,
      tip: "Strip formatting, keep raw text.",
      body: (
        <>
          <FZone
            accept=".docx"
            label="Choose a DOCX"
            file={getTool("docxTxt").file}
            onFile={(file: File) => setTool("docxTxt", { file })}
          />
          <CStat msg={getTool("docxTxt").status} type={getTool("docxTxt").statusType} />
          <HBtn
            onClick={async () => {
              const file = getTool("docxTxt").file;
              if (!file) return;

              await run("docxTxt", async () => {
                const result = await window.mammoth.extractRawText({
                  arrayBuffer: await file.arrayBuffer(),
                });
                dlText(`${stem(file.name)}.txt`, result.value);
                return "Plain text extracted.";
              });
            }}
            disabled={!getTool("docxTxt").file}
            loading={getTool("docxTxt").loading}
            label="Extract text"
          />
        </>
      ),
    },
    {
      title: "DOCX to Markdown",
      accent: "#10b981",
      icon: <UIcon name="NotebookPen" size={18} />,
      tip: "Great for docs, wikis, GitHub.",
      body: (
        <>
          <FZone
            accept=".docx"
            label="Choose a DOCX"
            file={getTool("docxMd").file}
            onFile={(file: File) => setTool("docxMd", { file })}
          />
          <CStat msg={getTool("docxMd").status} type={getTool("docxMd").statusType} />
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
                return "Markdown exported.";
              });
            }}
            disabled={!getTool("docxMd").file}
            loading={getTool("docxMd").loading}
            label="Export Markdown"
          />
        </>
      ),
    },
    {
      title: "DOCX to PDF",
      accent: "#ffa940",
      icon: <UIcon name="Printer" size={18} />,
      tip: "Print preview, save as PDF.",
      body: (
        <>
          <FZone
            accept=".docx"
            label="Choose a DOCX"
            file={getTool("docxPdf").file}
            onFile={(file: File) => setTool("docxPdf", { file })}
          />
          <CStat msg={getTool("docxPdf").status} type={getTool("docxPdf").statusType} />
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
                  return "Print preview opened. Save as PDF from dialog.";
                } catch (error) {
                  preview?.close();
                  throw error;
                }
              });
            }}
            disabled={!getTool("docxPdf").file}
            loading={getTool("docxPdf").loading}
            label="Open PDF preview"
          />
        </>
      ),
    },
  ];

  const dataCards = [
    {
      title: "TXT/MD to PDF",
      accent: "#ff6b6b",
      icon: <UIcon name="ScrollText" size={18} />,
      tip: "Turn text to A4 PDF.",
      body: (
        <>
          <FZone
            accept=".txt,.md"
            label="Choose a TXT or MD file"
            file={getTool("txtPdf").file}
            onFile={(file: File) => setTool("txtPdf", { file })}
          />
          <CStat msg={getTool("txtPdf").status} type={getTool("txtPdf").statusType} />
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
                  x: margin, y, size: 18, font: bold, color: rgb(0.9, 0.9, 0.95),
                });
                y -= 28;
                page.drawLine({
                  start: { x: margin, y },
                  end: { x: pageWidth - margin, y },
                  thickness: 0.8,
                  color: rgb(0.3, 0.3, 0.35),
                });
                y -= 18;

                for (const line of lines) {
                  if (y < margin + lineHeight) {
                    page = pdf.addPage([pageWidth, pageHeight]);
                    y = pageHeight - margin;
                  }
                  if (line) {
                    page.drawText(line, {
                      x: margin, y, size: fontSize, font, color: rgb(0.8, 0.8, 0.85),
                    });
                  }
                  y -= lineHeight;
                }

                const output = await pdf.save();
                dlBlob(`${stem(file.name)}.pdf`, new Blob([output], { type: "application/pdf" }));
                return "PDF generated.";
              });
            }}
            disabled={!getTool("txtPdf").file}
            loading={getTool("txtPdf").loading}
            label="Create PDF"
          />
        </>
      ),
    },
    {
      title: "CSV to HTML table",
      accent: "#f59e0b",
      icon: <UIcon name="TableProperties" size={18} />,
      tip: "Standalone HTML table export.",
      body: (
        <>
          <FZone
            accept=".csv"
            label="Choose a CSV file"
            file={getTool("csvHtml").file}
            onFile={(file: File) => setTool("csvHtml", { file })}
          />
          <CsvPreview rows={getTool("csvHtml").preview || []} />
          <CStat msg={getTool("csvHtml").status} type={getTool("csvHtml").statusType} />
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
                  <p>${body.length.toLocaleString()} row${body.length === 1 ? "" : "s"} converted from <strong>${esc(file.name)}</strong>.</p>
                  <table>
                    <thead>
                      <tr>${header.map((cell) => `<th>${esc(cell)}</th>`).join("")}</tr>
                    </thead>
                    <tbody>
                      ${body.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("")}
                    </tbody>
                  </table>
                `;

                dlText(`${stem(file.name)}.html`, buildStandaloneHtml(stem(file.name), bodyHtml));
                return `${body.length.toLocaleString()} CSV row${body.length === 1 ? "" : "s"} exported to HTML.`;
              });
            }}
            disabled={!getTool("csvHtml").file}
            loading={getTool("csvHtml").loading}
            label="Export HTML"
          />
        </>
      ),
    },
  ];

  return (
    <div className="page-shell">
      {/* Page Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#10b981]/8 via-transparent to-[#ffa940]/5 border border-white/[0.06] p-8 md:p-10 animate-fade-in">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#10b981]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#ffa940]/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-start gap-5">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffa940] to-[#ff7b3a] shadow-xl shadow-[#ffa940]/25">
            <UIcon name="NavDocxTools" size={26} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">Word Tools</h1>
            <p className="mt-1.5 text-[14px] text-[#9294a5] font-medium max-w-[500px] leading-relaxed">Export DOCX to HTML, text, markdown, and PDF — plus handy data-to-table conversions.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["HTML", "Text", "Markdown", "PDF", "CSV"].map((t) => (
                <span key={t} className="rounded-lg bg-white/[0.05] border border-white/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6b6d80]">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="surface-panel p-6 md:p-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <SHead ico={<UIcon name="FileSignature" size={18} />} label="DOCX Conversions" sub="Transform Word documents to other formats" />
        <div className="grid gap-5 xl:grid-cols-2">
          {docxCards.map((card, i) => (
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
        <SHead ico={<UIcon name="FileSpreadsheet" size={18} />} label="Text & Data" sub="Convert text files and spreadsheet data" />
        <div className="grid gap-5 xl:grid-cols-2">
          {dataCards.map((card, i) => (
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

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
