"use client";

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
import { Emoji } from "@/app/components/Icons";

const MAMMOTH_SRC =
  "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js";
const PDF_LIB_SRC =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js";

function normalizePlainText(text: string): string {
  return text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export default function DocxToolsPage() {
  const ready = useScripts([MAMMOTH_SRC, PDF_LIB_SRC]);

  const [st, setSt] = useState<Record<string, Record<string, any>>>({});
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

  const convFns = {
    docxHtml: async () => {
      const file = g("docxHtml").file as File | undefined;
      if (!file) return;

      await run("docxHtml", async () => {
        const html = await convertDocxToRichHtml(
          window.mammoth,
          await file.arrayBuffer()
        );
        dlText(stem(file.name) + ".html", buildStandaloneHtml(file.name, html));
        return "DOCX exported as a styled HTML page with embedded images";
      });
    },
    docxTxt: async () => {
      const file = g("docxTxt").file as File | undefined;
      if (!file) return;

      await run("docxTxt", async () => {
        const result = await window.mammoth.extractRawText({
          arrayBuffer: await file.arrayBuffer(),
        });
        dlText(stem(file.name) + ".txt", normalizePlainText(result.value));
        return "DOCX text extracted and cleaned up";
      });
    },
    docxMd: async () => {
      const file = g("docxMd").file as File | undefined;
      if (!file) return;

      await run("docxMd", async () => {
        const html = await convertDocxToRichHtml(
          window.mammoth,
          await file.arrayBuffer()
        );
        dlText(stem(file.name) + ".md", htmlToMarkdown(html));
        return "DOCX converted to cleaner Markdown";
      });
    },
    txtPdf: async () => {
      const file = g("txtPdf").file as File | undefined;
      if (!file) return;

      await run("txtPdf", async () => {
        const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
        const text = await file.text();
        const pdf = await PDFDocument.create();
        const font = await pdf.embedFont(StandardFonts.Courier);
        const fontSize = 10.5;
        const lineHeight = 15;
        const margin = 48;
        const pageWidth = 595.28;
        const pageHeight = 841.89;
        const maxWidth = pageWidth - margin * 2;
        const lines: string[] = [];

        normalizePlainText(text)
          .split("\n")
          .forEach((line: string) => {
            if (!line.trim()) {
              lines.push("");
              return;
            }

            let current = "";
            line.split(/\s+/).forEach((word) => {
              const candidate = current ? `${current} ${word}` : word;
              const width = font.widthOfTextAtSize(candidate, fontSize);
              if (width > maxWidth && current) {
                lines.push(current);
                current = word;
              } else {
                current = candidate;
              }
            });

            if (current) lines.push(current);
          });

        let page = pdf.addPage([pageWidth, pageHeight]);
        let y = pageHeight - margin;

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

        const bytes = await pdf.save();
        dlBlob(stem(file.name) + ".pdf", new Blob([bytes], { type: "application/pdf" }));
        return "Text laid out as a clean, readable PDF";
      });
    },
    csvHtml: async () => {
      const file = g("csvHtml").file as File | undefined;
      if (!file) return;

      await run("csvHtml", async () => {
        const rows = parseCsv(await file.text());
        if (!rows.length) {
          throw new Error("The CSV file is empty.");
        }

        const [header, ...body] = rows;
        const tableHtml = `<h2>${esc(file.name)} - ${body.length} rows</h2><table><thead><tr>${header
          .map((cell) => `<th>${esc(cell)}</th>`)
          .join("")}</tr></thead><tbody>${body
          .map(
            (row) =>
              `<tr>${row
                .map((cell) => `<td>${esc(cell)}</td>`)
                .join("")}</tr>`
          )
          .join("")}</tbody></table>`;

        dlText(stem(file.name) + ".html", buildStandaloneHtml(file.name, tableHtml));
        return `${body.length} CSV row(s) converted with quoted fields handled correctly`;
      });
    },
    docxPdf: async () => {
      const file = g("docxPdf").file as File | undefined;
      if (!file) return;

      await run("docxPdf", async () => {
        const preview = openPrintPreviewWindow(stem(file.name));
        const html = await convertDocxToRichHtml(
          window.mammoth,
          await file.arrayBuffer()
        );
        const documentHtml = buildStandaloneHtml(file.name, html);
        let printed = false;
        const printOnce = () => {
          if (printed) return;
          printed = true;
          preview.print();
        };

        preview.document.open();
        preview.document.write(documentHtml);
        preview.document.close();
        preview.onload = printOnce;
        setTimeout(printOnce, 450);

        return "Print-ready DOCX preview opened with formatting preserved";
      });
    },
  };

  const docxCards = [
    {
      ico: "🌐",
      title: "DOCX -> HTML",
      desc: "Export Word documents as polished, self-contained HTML pages",
      col: "#10b981",
      tip: "Better for publishing, previews, and client reviews",
      body: (
        <>
          <FZone
            accept=".docx"
            label="Drop a DOCX here"
            file={g("docxHtml").file}
            onFile={(file: File) => s("docxHtml", { file })}
            tip="Choose the Word document you want to publish as HTML"
          />
          <CStat msg={g("docxHtml").status} type={g("docxHtml").statusType} />
          <HBtn
            onClick={convFns.docxHtml}
            disabled={!g("docxHtml").file}
            loading={g("docxHtml").loading}
            label="Export HTML"
            tip="Downloads a styled HTML file"
          />
        </>
      ),
    },
    {
      ico: "📄",
      title: "DOCX -> TXT",
      desc: "Strip away formatting and keep a cleaner plain-text version",
      col: "#ef4444",
      tip: "Ideal for AI prompts, indexing, and content cleanup",
      body: (
        <>
          <FZone
            accept=".docx"
            label="Drop a DOCX here"
            file={g("docxTxt").file}
            onFile={(file: File) => s("docxTxt", { file })}
            tip="Choose the Word document you want to flatten into text"
          />
          <CStat msg={g("docxTxt").status} type={g("docxTxt").statusType} />
          <HBtn
            onClick={convFns.docxTxt}
            disabled={!g("docxTxt").file}
            loading={g("docxTxt").loading}
            label="Extract Text"
            tip="Downloads a TXT file"
          />
        </>
      ),
    },
    {
      ico: "📑",
      title: "DOCX -> Markdown",
      desc: "Convert Word content into cleaner Markdown with headings and tables",
      col: "#3b82f6",
      tip: "Great for docs, READMEs, knowledge bases, and CMS pipelines",
      body: (
        <>
          <FZone
            accept=".docx"
            label="Drop a DOCX here"
            file={g("docxMd").file}
            onFile={(file: File) => s("docxMd", { file })}
            tip="Choose the Word document you want to turn into Markdown"
          />
          <CStat msg={g("docxMd").status} type={g("docxMd").statusType} />
          <HBtn
            onClick={convFns.docxMd}
            disabled={!g("docxMd").file}
            loading={g("docxMd").loading}
            label="Export Markdown"
            tip="Downloads a .md file"
          />
        </>
      ),
    },
    {
      ico: "🖨️",
      title: "DOCX -> PDF",
      desc: "Open a print-ready preview that preserves far more formatting",
      col: "#ef4444",
      tip: "Better visual fidelity than flattening DOCX into plain text first",
      body: (
        <>
          <FZone
            accept=".docx"
            label="Drop a DOCX here"
            file={g("docxPdf").file}
            onFile={(file: File) => s("docxPdf", { file })}
            tip="Choose the Word document you want to print as PDF"
          />
          <div className="rounded-lg border border-paper3 bg-paper px-3 py-2 text-xs leading-relaxed text-ink4">
            This opens a print-ready preview in a new tab so your browser can
            save it as PDF with much better formatting retention.
          </div>
          <CStat msg={g("docxPdf").status} type={g("docxPdf").statusType} />
          <HBtn
            onClick={convFns.docxPdf}
            disabled={!g("docxPdf").file}
            loading={g("docxPdf").loading}
            label="Open Print Preview"
            tip="Use your browser's Save as PDF option"
          />
        </>
      ),
    },
  ];

  const textCards = [
    {
      ico: "📝",
      title: "TXT -> PDF",
      desc: "Lay out plain text and Markdown content into a readable PDF",
      col: "#ef4444",
      tip: "Uses wrapped text and a monospaced font for a cleaner result",
      body: (
        <>
          <FZone
            accept=".txt,.md"
            label="Choose a TXT or MD file"
            file={g("txtPdf").file}
            onFile={(file: File) => s("txtPdf", { file })}
            tip="Plain text and Markdown files are both supported"
          />
          <CStat msg={g("txtPdf").status} type={g("txtPdf").statusType} />
          <HBtn
            onClick={convFns.txtPdf}
            disabled={!g("txtPdf").file}
            loading={g("txtPdf").loading}
            label="Create PDF"
            tip="Downloads a clean PDF"
          />
        </>
      ),
    },
    {
      ico: "📊",
      title: "CSV -> HTML Table",
      desc: "Turn spreadsheet data into a cleaner HTML table, even with quoted commas",
      col: "#10b981",
      tip: "Safer than naive CSV splitting for customer exports",
      body: (
        <>
          <FZone
            accept=".csv"
            label="Choose a CSV file"
            file={g("csvHtml").file}
            onFile={(file: File) => s("csvHtml", { file })}
            tip="Standard CSV files are supported, including quoted cells"
          />
          <CStat msg={g("csvHtml").status} type={g("csvHtml").statusType} />
          <HBtn
            onClick={convFns.csvHtml}
            disabled={!g("csvHtml").file}
            loading={g("csvHtml").loading}
            label="Export HTML"
            tip="Downloads a styled HTML table"
          />
        </>
      ),
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-y-auto px-6 py-8 md:px-10 lg:px-20">
      {!ready && (
        <div className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-amber/10 bg-amber/5 p-3 text-center text-amber">
          <Emoji symbol="⏳" size={16} />
          <span className="text-sm font-medium">Loading document libraries...</span>
        </div>
      )}

      <div className="mb-10">
        <SHead
          ico="📝"
          label="DOCX Conversions"
          sub="Cleaner exports, better formatting retention, and sturdier data handling"
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {docxCards.map(({ ico, title, desc, col, body, tip }) => (
            <Tip key={title} tip={tip} side="top">
              <CCard ico={ico} title={title} desc={desc} accentCol={col}>
                {body}
              </CCard>
            </Tip>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <SHead
          ico="✏️"
          label="Text and Data"
          sub="Sharper output for plain text, Markdown, and CSV conversions"
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {textCards.map(({ ico, title, desc, col, body, tip }) => (
            <Tip key={title} tip={tip} side="top">
              <CCard ico={ico} title={title} desc={desc} accentCol={col}>
                {body}
              </CCard>
            </Tip>
          ))}
        </div>
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
