"use client";

import React, { useState, useCallback } from "react";
import { useScripts } from "@/app/hooks/useScripts";
import { stem, dlBlob, dlText, parsePageRange, esc } from "@/app/lib/utils";
import { SHead, CCard, FZone, HInput, HSel, CStat, HBtn, Tip, Toast } from "@/app/components/DocLensUI";

declare global {
  interface Window {
    pdfjsLib: any;
    JSZip: any;
    PDFLib: any;
  }
}

export default function PdfToolsPage() {
  const ready = useScripts([
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
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

  const pdfjs = () => {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    return window.pdfjsLib;
  };

  const ML = (files: any[], ico: string) =>
    (files || []).length > 0 && (
      <div className="flex flex-col gap-[3px] max-h-[70px] overflow-y-auto">
        {files.map((f, i) => (
          <div key={i} className="font-patrick text-[12px] text-ink3 bg-paper2 rounded-[2px_6px_3px_5px] py-[3px] px-[9px] whitespace-nowrap overflow-hidden text-ellipsis">
            {ico} {f.name}
          </div>
        ))}
      </div>
    );

  const convFns = {
    pdfTxt: async () => {
      const f = g("pdfTxt").file;
      if (!f) return;
      await run("pdfTxt", async () => {
        const lib = pdfjs(), ab = await f.arrayBuffer(), pdf = await lib.getDocument({ data: ab }).promise;
        let t = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const p = await pdf.getPage(i), c = await p.getTextContent();
          t += `--- Page ${i} ---\n` + c.items.map((x: any) => x.str).join(" ") + "\n\n";
        }
        dlText(stem(f.name) + ".txt", t.trim());
        return `✓ ${pdf.numPages} pages extracted`;
      });
    },
    pdfImg: async () => {
      const f = g("pdfImg").file;
      if (!f) return;
      const dpi = parseInt(g("pdfImg").dpi || "150") || 150;
      await run("pdfImg", async () => {
        const lib = pdfjs(), ab = await f.arrayBuffer(), pdf = await lib.getDocument({ data: ab }).promise, zip = new window.JSZip();
        for (let i = 1; i <= pdf.numPages; i++) {
          const p = await pdf.getPage(i), vp = p.getViewport({ scale: dpi / 96 }), cv = document.createElement("canvas");
          cv.width = vp.width; cv.height = vp.height;
          await p.render({ canvasContext: cv.getContext("2d"), viewport: vp }).promise;
          const bl: Blob = await new Promise((r: any) => cv.toBlob(r, "image/png"));
          zip.file(`page-${String(i).padStart(3, "0")}.png`, bl);
          s("pdfImg", { prog: Math.round(i / pdf.numPages * 100) });
        }
        const zb = await zip.generateAsync({ type: "blob" });
        dlBlob(stem(f.name) + "_images.zip", zb);
        return `✓ ${pdf.numPages} pages → ZIP`;
      });
    },
    merge: async () => {
      const files = g("merge").files || [];
      if (files.length < 2) return;
      await run("merge", async () => {
        const { PDFDocument } = window.PDFLib, merged = await PDFDocument.create();
        for (const f of files) {
          const ab = await f.arrayBuffer(), src = await PDFDocument.load(ab), pages = await merged.copyPages(src, src.getPageIndices());
          pages.forEach((p: any) => merged.addPage(p));
        }
        const bytes = await merged.save();
        dlBlob("merged.pdf", new Blob([bytes], { type: "application/pdf" }));
        return `✓ ${files.length} PDFs merged`;
      });
    },
    split: async () => {
      const f = g("split").file, ps = g("split").pages || "";
      if (!f) return;
      await run("split", async () => {
        const { PDFDocument } = window.PDFLib, ab = await f.arrayBuffer(), src = await PDFDocument.load(ab), pages = parsePageRange(ps, src.getPageCount());
        if (!pages.length) throw new Error("No valid pages");
        const out = await PDFDocument.create(), copied = await out.copyPages(src, pages.map(p => p - 1));
        copied.forEach((p: any) => out.addPage(p));
        const bytes = await out.save();
        dlBlob(stem(f.name) + "_split.pdf", new Blob([bytes], { type: "application/pdf" }));
        return `✓ ${pages.length} page(s) extracted`;
      });
    },
    imgPdf: async () => {
      const files = g("imgPdf").files || [];
      if (!files.length) return;
      await run("imgPdf", async () => {
        const { PDFDocument } = window.PDFLib, pdf = await PDFDocument.create();
        for (const f of files) {
          const ab = await f.arrayBuffer();
          let img;
          if (f.type === "image/png") img = await pdf.embedPng(ab);
          else img = await pdf.embedJpg(ab);
          const page = pdf.addPage([img.width, img.height]);
          page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
        }
        const bytes = await pdf.save();
        dlBlob("images.pdf", new Blob([bytes], { type: "application/pdf" }));
        return `✓ ${files.length} images → PDF`;
      });
    },
    rotate: async () => {
      const f = g("rotate").file;
      if (!f) return;
      const deg = parseInt(g("rotate").deg || "90");
      await run("rotate", async () => {
        const { PDFDocument, degrees } = window.PDFLib, ab = await f.arrayBuffer(), pdf = await PDFDocument.load(ab);
        pdf.getPages().forEach((p: any) => {
          const c = p.getRotation().angle;
          p.setRotation(degrees((c + deg) % 360));
        });
        const bytes = await pdf.save();
        dlBlob(stem(f.name) + "_rotated.pdf", new Blob([bytes], { type: "application/pdf" }));
        return `✓ Rotated ${deg}°`;
      });
    },
    pdfDocx: async () => {
      const f = g("pdfDocx").file;
      if (!f) return;
      await run("pdfDocx", async () => {
        const lib = pdfjs(), ab = await f.arrayBuffer(), pdf = await lib.getDocument({ data: ab }).promise;
        const paragraphs: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const p = await pdf.getPage(i), c = await p.getTextContent();
          const lines = c.items.map((x: any) => x.str).join(" ").split(/\n/);
          lines.forEach((line: string) => {
            if (line.trim()) paragraphs.push(line.trim());
          });
          paragraphs.push("");
          s("pdfDocx", { prog: Math.round(i / pdf.numPages * 100) });
        }
        const bodyXml = paragraphs.map(p => p
          ? `<w:p><w:r><w:t xml:space="preserve">${esc(p)}</w:t></w:r></w:p>`
          : `<w:p/>`
        ).join("\n");
        const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:w10="urn:schemas-microsoft-com:office:word"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
  mc:Ignorable="w14 wp14">
  <w:body>
    ${bodyXml}
    <w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>
  </w:body>
</w:document>`;
        const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;
        const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
        const zip = new window.JSZip();
        zip.file("[Content_Types].xml", contentTypes);
        zip.file("_rels/.rels", rels);
        zip.file("word/document.xml", documentXml);
        const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
        dlBlob(stem(f.name) + ".docx", blob);
        return `✓ ${pdf.numPages} pages → DOCX`;
      });
    },
    pdfLink: async () => {
      const f = g("pdfLink").file;
      if (!f) return;
      await run("pdfLink", async () => {
        s("pdfLink", { prog: 10 });
        const ab = await f.arrayBuffer();
        const uint8 = new Uint8Array(ab);
        s("pdfLink", { prog: 30 });
        // Convert to base64
        let binary = "";
        const chunkSize = 8192;
        for (let i = 0; i < uint8.length; i += chunkSize) {
          binary += String.fromCharCode(...uint8.subarray(i, i + chunkSize));
        }
        const base64 = btoa(binary);
        s("pdfLink", { prog: 60 });
        const sizeMB = (f.size / 1048576).toFixed(1);
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(f.name)} — DocLens PDF Viewer</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
body{background:#1a1a2e;color:#fff;display:flex;flex-direction:column}
.toolbar{display:flex;align-items:center;gap:12px;padding:10px 20px;background:#16213e;border-bottom:1px solid rgba(255,255,255,.08);flex-shrink:0}
.toolbar .logo{font-weight:800;font-size:18px;letter-spacing:-0.5px}
.toolbar .logo span{color:#c07818}
.toolbar .fname{flex:1;font-size:13px;color:rgba(255,255,255,.6);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.toolbar .badge{font-size:11px;padding:3px 10px;border-radius:4px;background:#c07818;color:#fff;font-weight:600}
.toolbar .dl-btn{font-size:12px;padding:6px 14px;border-radius:5px;background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.15);cursor:pointer;text-decoration:none;transition:all .15s}
.toolbar .dl-btn:hover{background:rgba(255,255,255,.2)}
.viewer{flex:1;display:flex;align-items:stretch}
.viewer iframe,.viewer embed,.viewer object{width:100%;height:100%;border:none}
.fallback{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:32px;text-align:center}
.fallback p{color:rgba(255,255,255,.6);font-size:14px;max-width:400px;line-height:1.6}
.fallback a{display:inline-block;padding:12px 28px;background:#c07818;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;transition:background .15s}
.fallback a:hover{background:#9a5e10}
@media(max-width:640px){.toolbar{padding:8px 12px;gap:8px}.toolbar .logo{font-size:15px}.toolbar .badge{display:none}}
</style>
</head>
<body>
<div class="toolbar">
<div class="logo">Doc<span>Lens</span></div>
<div class="fname">${esc(f.name)} · ${sizeMB} MB</div>
<div class="badge">PDF</div>
<a class="dl-btn" href="data:application/pdf;base64,${base64}" download="${esc(f.name)}">⬇ Download</a>
</div>
<div class="viewer">
<iframe src="data:application/pdf;base64,${base64}" type="application/pdf"></iframe>
</div>
<noscript>
<div class="fallback">
<p>Your browser doesn't support embedded PDFs.</p>
<a href="data:application/pdf;base64,${base64}" download="${esc(f.name)}">Download PDF</a>
</div>
</noscript>
</body>
</html>`;
        s("pdfLink", { prog: 80 });
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        s("pdfLink", { prog: 100, linkUrl: url, htmlBlob: blob });
        return `✓ PDF link created — opened in new tab`;
      });
    },
  };

  const cards = [
    { ico: "📄", title: "PDF → Plain Text", desc: "Extract all text, page by page", col: "#b02020", rot: 0.3, tip: "Saves a .txt with every page's text", body: <><FZone accept=".pdf" label="Drop a PDF here" file={g("pdfTxt").file} onFile={(f: File) => s("pdfTxt", { file: f })} tip="Click to browse or drag a PDF" /><CStat msg={g("pdfTxt").status} type={g("pdfTxt").statusType} /><HBtn onClick={convFns.pdfTxt} disabled={!g("pdfTxt").file} loading={g("pdfTxt").loading} label="Convert & Download" tip="Extracts text from every page" /></> },
    { ico: "🖼️", title: "PDF → PNG Images", desc: "Render pages as images, zip download", col: "#1a5c5c", rot: -0.3, tip: "Each page becomes a PNG, bundled in a ZIP", body: <><FZone accept=".pdf" label="Drop a PDF here" file={g("pdfImg").file} onFile={(f: File) => s("pdfImg", { file: f })} tip="Click to browse or drag a PDF" /><div className="flex gap-[8px] items-center"><HInput type="number" value={g("pdfImg").dpi || "150"} min="72" max="300" onChange={(e: any) => s("pdfImg", { dpi: e.target.value })} className="max-w-[80px]" /><Tip tip="Higher = sharper image, bigger file size"><span className="font-patrick text-[13px] text-ink4 cursor-help underline decoration-dotted decoration-[from-font]">DPI (72–300)</span></Tip></div>{g("pdfImg").loading && (g("pdfImg").prog || 0) > 0 && <div className="h-[5px] bg-paper3 rounded-[2px_6px] overflow-hidden border border-[rgba(100,70,40,.2)]"><div className="h-full bg-amber transition-[width] duration-300" style={{ width: (g("pdfImg").prog || 0) + "%" }} /></div>}<CStat msg={g("pdfImg").status} type={g("pdfImg").statusType} /><HBtn onClick={convFns.pdfImg} disabled={!g("pdfImg").file} loading={g("pdfImg").loading} label="Export as ZIP" tip="Creates page-001.png, page-002.png… in a ZIP" /></> },
    { ico: "🔗", title: "Merge PDFs", desc: "Stitch multiple PDFs into one", col: "#7a4510", rot: 0.2, tip: "Files are merged in the order you pick them", body: <><FZone accept=".pdf" label="Choose multiple PDFs" multi files={g("merge").files} onFiles={(f: File[]) => s("merge", { files: f })} tip="Hold Ctrl/Cmd to select multiple files" />{ML(g("merge").files, "📄")}<CStat msg={g("merge").status} type={g("merge").statusType} /><HBtn onClick={convFns.merge} disabled={!(g("merge").files?.length >= 2)} loading={g("merge").loading} label="Merge & Download" tip="You need at least 2 PDFs to merge" /></> },
    { ico: "✂️", title: "Split PDF", desc: "Pull out specific page ranges", col: "#1a5c5c", rot: -0.2, tip: 'Enter pages like "1-3, 5, 7" to extract', body: <><FZone accept=".pdf" label="Drop a PDF here" file={g("split").file} onFile={(f: File) => s("split", { file: f })} tip="The PDF you want to extract pages from" /><Tip tip='Examples: "1-3" · "2,4,6" · "1-3,7"'><HInput placeholder="Pages: 1-3, 5, 7" value={g("split").pages || ""} onChange={(e: any) => s("split", { pages: e.target.value })} /></Tip><CStat msg={g("split").status} type={g("split").statusType} /><HBtn onClick={convFns.split} disabled={!g("split").file || !g("split").pages} loading={g("split").loading} label="Extract Pages" tip="Saves only the pages you specified" /></> },
    { ico: "🖼️", title: "Images → PDF", desc: "Bundle JPG/PNG files into a PDF", col: "#1a3a6a", rot: 0.35, tip: "Images appear as full pages, in selection order", body: <><FZone accept="image/png,image/jpeg" label="Choose images (JPG/PNG)" multi files={g("imgPdf").files} onFiles={(f: File[]) => s("imgPdf", { files: f })} tip="Select multiple images at once" />{ML(g("imgPdf").files, "🖼️")}<CStat msg={g("imgPdf").status} type={g("imgPdf").statusType} /><HBtn onClick={convFns.imgPdf} disabled={!(g("imgPdf").files?.length > 0)} loading={g("imgPdf").loading} label="Create PDF" tip="Each image becomes one full page" /></> },
    { ico: "🔄", title: "Rotate PDF", desc: "Turn all pages 90°, 180°, or 270°", col: "#c07818", rot: -0.35, tip: "Rotation is applied to every page uniformly", body: <><FZone accept=".pdf" label="Drop a PDF here" file={g("rotate").file} onFile={(f: File) => s("rotate", { file: f })} tip="The PDF whose pages you want to rotate" /><Tip tip="Choose rotation angle for all pages"><HSel value={g("rotate").deg || "90"} onChange={(e: any) => s("rotate", { deg: e.target.value })}><option value="90">↩ Rotate 90° clockwise</option><option value="180">↕ Rotate 180°</option><option value="270">↪ Rotate 270° (counter-CW)</option></HSel></Tip><CStat msg={g("rotate").status} type={g("rotate").statusType} /><HBtn onClick={convFns.rotate} disabled={!g("rotate").file} loading={g("rotate").loading} label="Rotate & Download" tip="Applies to every page in the document" /></> },
    { ico: "📝", title: "PDF → DOCX", desc: "Convert PDF text into an editable Word document", col: "#1a3c7a", rot: 0.25, tip: "Extracts text from each page and builds a real .docx file", body: <><FZone accept=".pdf" label="Drop a PDF here" file={g("pdfDocx").file} onFile={(f: File) => s("pdfDocx", { file: f })} tip="The PDF to convert to Word format" />{g("pdfDocx").loading && (g("pdfDocx").prog || 0) > 0 && <div className="h-[5px] bg-paper3 rounded-[2px_6px] overflow-hidden border border-[rgba(100,70,40,.2)]"><div className="h-full bg-amber transition-[width] duration-300" style={{ width: (g("pdfDocx").prog || 0) + "%" }} /></div>}<CStat msg={g("pdfDocx").status} type={g("pdfDocx").statusType} /><HBtn onClick={convFns.pdfDocx} disabled={!g("pdfDocx").file} loading={g("pdfDocx").loading} label="Convert to DOCX" tip="Creates an editable .docx file from PDF text" /></> },
    { ico: "🔗", title: "PDF → Link", desc: "Create a shareable viewer link for your PDF", col: "#1a5c5c", rot: -0.25, tip: "Embeds the full PDF into a branded viewer page — like Tiiny.host, but free", body: <><FZone accept=".pdf" label="Drop a PDF here" file={g("pdfLink").file} onFile={(f: File) => s("pdfLink", { file: f, linkUrl: null, htmlBlob: null })} tip="The PDF you want to share as a link" />{g("pdfLink").loading && (g("pdfLink").prog || 0) > 0 && <div className="h-[5px] bg-paper3 rounded-[2px_6px] overflow-hidden border border-[rgba(100,70,40,.2)]"><div className="h-full bg-teal transition-[width] duration-300" style={{ width: (g("pdfLink").prog || 0) + "%" }} /></div>}<CStat msg={g("pdfLink").status} type={g("pdfLink").statusType} /><HBtn onClick={convFns.pdfLink} disabled={!g("pdfLink").file} loading={g("pdfLink").loading} label="🔗 Generate Link" tip="Creates a shareable viewer page with your PDF embedded" />{g("pdfLink").linkUrl && <div className="flex flex-col gap-2 mt-2"><div className="flex items-center gap-2 flex-wrap"><Tip tip="Copy the viewer link to your clipboard"><button onClick={() => { navigator.clipboard.writeText(g("pdfLink").linkUrl); setToast("✓ Link copied to clipboard!"); }} className="flex items-center gap-[6px] py-[6px] px-[12px] rounded-[2px_8px_3px_7px] font-caveat text-[14px] font-semibold text-teal bg-[rgba(26,92,92,.08)] border-[1.5px] border-teal cursor-pointer hover:bg-[rgba(26,92,92,.15)] transition-all duration-150">📋 Copy Link</button></Tip><Tip tip="Download the viewer HTML file — host it anywhere for a permanent link"><button onClick={() => { if (g("pdfLink").htmlBlob) dlBlob((g("pdfLink").file?.name || "document") + "_viewer.html", g("pdfLink").htmlBlob); }} className="flex items-center gap-[6px] py-[6px] px-[12px] rounded-[2px_8px_3px_7px] font-caveat text-[14px] font-semibold text-ink3 bg-paper2 border-[1.5px] border-[rgba(100,70,40,.28)] cursor-pointer hover:bg-[rgba(192,120,24,.1)] hover:border-amber transition-all duration-150">💾 Download HTML</button></Tip><Tip tip="Open the viewer page again in a new tab"><button onClick={() => window.open(g("pdfLink").linkUrl, "_blank")} className="flex items-center gap-[6px] py-[6px] px-[12px] rounded-[2px_8px_3px_7px] font-caveat text-[14px] font-semibold text-ink3 bg-paper2 border-[1.5px] border-[rgba(100,70,40,.28)] cursor-pointer hover:bg-[rgba(192,120,24,.1)] hover:border-amber transition-all duration-150">↗ Re-open</button></Tip></div><div className="font-patrick text-[11px] text-ink4 leading-[1.5]">💡 <strong>Tip:</strong> Download the HTML file and host it on any web server for a permanent shareable link.</div></div>}</> },
  ];

  return (
    <div className="flex-1 overflow-y-auto py-6 md:py-[28px] px-4 md:px-[32px] lg:px-16">
      {!ready && (
        <div className="text-center mb-4">
          <span className="font-patrick text-[13px] text-ink4 italic">⏳ Loading PDF libraries…</span>
        </div>
      )}
      <SHead ico="📄" label="PDF Tools" sub="All your PDF conversion and manipulation needs" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
        {cards.map(({ ico, title, desc, col, rot, body, tip }) => (
          <Tip key={title} tip={tip} side="top">
            <CCard ico={ico} title={title} desc={desc} accentCol={col} rot={rot}>{body}</CCard>
          </Tip>
        ))}
      </div>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
