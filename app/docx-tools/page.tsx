"use client";

import React, { useState, useCallback } from "react";
import { useScripts } from "@/app/hooks/useScripts";
import { stem, dlBlob, dlText, esc } from "@/app/lib/utils";
import { SHead, CCard, FZone, CStat, HBtn, Tip, Toast } from "@/app/components/DocLensUI";

declare global {
  interface Window {
    mammoth: any;
    PDFLib: any;
  }
}

export default function DocxToolsPage() {
  const ready = useScripts([
    "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js",
  ]);

  const [st, setSt] = useState<any>({});
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => setToast(msg), []);

  const g = (k: string) => st[k] || {};
  const s = (k: string, v: any) => setSt((p: any) => ({ ...p, [k]: { ...p[k], ...v } }));

  async function run(key: string, fn: any) {
    s(key, { loading: true, status: "", statusType: "" });
    try {
      const msg = await fn();
      s(key, { loading: false, status: msg, statusType: "ok" });
      showToast(msg);
    } catch (e: any) {
      s(key, { loading: false, status: e.message, statusType: "err" });
    }
  }

  const convFns = {
    docxHtml: async () => {
      const f = g("docxHtml").file;
      if (!f) return;
      await run("docxHtml", async () => {
        const ab = await f.arrayBuffer(), r = await window.mammoth.convertToHtml({ arrayBuffer: ab });
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Georgia,serif;max-width:820px;margin:44px auto;padding:0 28px;line-height:1.8;color:#1a1a1a}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:9px}</style></head><body>${r.value}</body></html>`;
        dlText(stem(f.name) + ".html", html);
        return "✓ DOCX → HTML";
      });
    },
    docxTxt: async () => {
      const f = g("docxTxt").file;
      if (!f) return;
      await run("docxTxt", async () => {
        const ab = await f.arrayBuffer(), r = await window.mammoth.extractRawText({ arrayBuffer: ab });
        dlText(stem(f.name) + ".txt", r.value);
        return "✓ Text extracted";
      });
    },
    docxMd: async () => {
      const f = g("docxMd").file;
      if (!f) return;
      await run("docxMd", async () => {
        const ab = await f.arrayBuffer(), r = await window.mammoth.convertToHtml({ arrayBuffer: ab });
        const md = r.value
          .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n")
          .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n")
          .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n")
          .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
          .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
          .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
          .replace(/\n{3,}/g, "\n\n").trim();
        dlText(stem(f.name) + ".md", md);
        return "✓ DOCX → Markdown";
      });
    },
    txtPdf: async () => {
      const f = g("txtPdf").file;
      if (!f) return;
      await run("txtPdf", async () => {
        const { PDFDocument, rgb } = window.PDFLib;
        const text = await f.text(), pdf = await PDFDocument.create();
        const fs = 11, lh = 15, mg = 50, pw = 595, ph = 842;
        const cpl = Math.floor((pw - mg * 2) / (fs * 0.55));
        const allLines: string[] = [];
        text.split("\n").forEach((line: string) => {
          if (!line.trim()) { allLines.push(""); return; }
          let l = line;
          while (l.length > cpl) { allLines.push(l.substring(0, cpl)); l = l.substring(cpl); }
          allLines.push(l);
        });
        let page = pdf.addPage([pw, ph]), y = ph - mg;
        for (const line of allLines) {
          if (y < mg + lh) { page = pdf.addPage([pw, ph]); y = ph - mg; }
          if (line) page.drawText(line, { x: mg, y, size: fs, color: rgb(0.1, 0.1, 0.1) });
          y -= lh;
        }
        const bytes = await pdf.save();
        dlBlob(stem(f.name) + ".pdf", new Blob([bytes], { type: "application/pdf" }));
        return "✓ PDF created";
      });
    },
    csvHtml: async () => {
      const f = g("csvHtml").file;
      if (!f) return;
      await run("csvHtml", async () => {
        const text = await f.text();
        const rows = text.split("\n").map((r: string) => r.split(",").map((c: string) => c.replace(/^"|"$/g, "").trim())).filter((r: string[]) => r.some((c: string) => c));
        if (!rows.length) throw new Error("Empty CSV");
        const [header, ...body] = rows;
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:'Patrick Hand',cursive;padding:32px;background:#f7f0e3;color:#1c110a}h2{margin-bottom:20px;font-size:20px;font-family:'Caveat',cursive}table{border-collapse:collapse;width:100%;border-radius:8px;overflow:hidden}th{background:#1c110a;color:#f7f0e3;padding:11px 14px;text-align:left;font-size:14px}td{padding:10px 14px;border-bottom:1px solid #e3d8be;font-size:13px}tr:nth-child(even) td{background:#ede5d0}</style></head><body><h2>${esc(f.name)} — ${body.length} rows</h2><table><thead><tr>${header.map((h: string) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${body.map((row: string[]) => `<tr>${row.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`;
        dlText(stem(f.name) + ".html", html);
        return `✓ ${body.length} rows converted`;
      });
    },
  };

  const docxCards = [
    { ico: "🌐", title: "DOCX → HTML", desc: "Word doc into a styled webpage", col: "#1a5c5c", rot: 0.3, tip: "Preserves headings, bold, italic, and tables", body: <><FZone accept=".docx" label="Drop a DOCX here" file={g("docxHtml").file} onFile={(f: File) => s("docxHtml", { file: f })} tip="Click to browse Word documents" /><CStat msg={g("docxHtml").status} type={g("docxHtml").statusType} /><HBtn onClick={convFns.docxHtml} disabled={!g("docxHtml").file} loading={g("docxHtml").loading} label="Convert & Download" tip="Downloads a self-contained .html file" /></> },
    { ico: "📄", title: "DOCX → TXT", desc: "Strip formatting, keep the text", col: "#5c1a1a", rot: -0.2, tip: "Plain text only — no bold, no structure", body: <><FZone accept=".docx" label="Drop a DOCX here" file={g("docxTxt").file} onFile={(f: File) => s("docxTxt", { file: f })} tip="Click to browse Word documents" /><CStat msg={g("docxTxt").status} type={g("docxTxt").statusType} /><HBtn onClick={convFns.docxTxt} disabled={!g("docxTxt").file} loading={g("docxTxt").loading} label="Convert & Download" tip="Saves a clean .txt file" /></> },
    { ico: "📑", title: "DOCX → Markdown", desc: "Word to clean .md format", col: "#1a3c7a", rot: 0.2, tip: "Headings and formatting become Markdown syntax", body: <><FZone accept=".docx" label="Drop a DOCX here" file={g("docxMd").file} onFile={(f: File) => s("docxMd", { file: f })} tip="Click to browse Word documents" /><CStat msg={g("docxMd").status} type={g("docxMd").statusType} /><HBtn onClick={convFns.docxMd} disabled={!g("docxMd").file} loading={g("docxMd").loading} label="Convert & Download" tip="Great for GitHub READMEs and note apps" /></> },
  ];

  const textCards = [
    { ico: "📜", title: "TXT → PDF", desc: "Turn any text or Markdown into a PDF", col: "#5c1a1a", rot: 0.3, tip: "Long lines wrap automatically across pages", body: <><FZone accept=".txt,.md" label="Choose a TXT or MD file" file={g("txtPdf").file} onFile={(f: File) => s("txtPdf", { file: f })} tip="Plain text or Markdown files supported" /><CStat msg={g("txtPdf").status} type={g("txtPdf").statusType} /><HBtn onClick={convFns.txtPdf} disabled={!g("txtPdf").file} loading={g("txtPdf").loading} label="Create PDF" tip="Generates a clean A4 PDF from your text" /></> },
    { ico: "📊", title: "CSV → HTML Table", desc: "Spreadsheet data as a styled webpage", col: "#1a5c20", rot: -0.3, tip: "Builds a readable HTML page from any CSV", body: <><FZone accept=".csv" label="Choose a CSV file" file={g("csvHtml").file} onFile={(f: File) => s("csvHtml", { file: f })} tip="Standard comma-separated files only" /><CStat msg={g("csvHtml").status} type={g("csvHtml").statusType} /><HBtn onClick={convFns.csvHtml} disabled={!g("csvHtml").file} loading={g("csvHtml").loading} label="Convert & Download" tip="Downloads a styled, self-contained HTML table" /></> },
  ];

  return (
    <div className="flex-1 overflow-y-auto py-6 md:py-[28px] px-4 md:px-[32px] lg:px-16">
      {!ready && (
        <div className="text-center mb-4">
          <span className="font-patrick text-[13px] text-ink4 italic">⏳ Loading libraries…</span>
        </div>
      )}

      <div className="mb-[36px]">
        <SHead ico="📝" label="DOCX Conversions" sub="Convert Word documents to various formats" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
          {docxCards.map(({ ico, title, desc, col, rot, body, tip }) => (
            <Tip key={title} tip={tip} side="top">
              <CCard ico={ico} title={title} desc={desc} accentCol={col} rot={rot}>{body}</CCard>
            </Tip>
          ))}
        </div>
      </div>

      <div className="mb-[36px]">
        <SHead ico="✏️" label="Text & Data" sub="Convert plain text and spreadsheet data" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
          {textCards.map(({ ico, title, desc, col, rot, body, tip }) => (
            <Tip key={title} tip={tip} side="top">
              <CCard ico={ico} title={title} desc={desc} accentCol={col} rot={rot}>{body}</CCard>
            </Tip>
          ))}
        </div>
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
