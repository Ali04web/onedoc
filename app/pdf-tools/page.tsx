"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
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
  };

  const cards = [
    { ico: "📄", title: "PDF → Plain Text", desc: "Extract all text, page by page", col: "#b02020", rot: 0.3, tip: "Saves a .txt with every page's text", body: <><FZone accept=".pdf" label="Drop a PDF here" file={g("pdfTxt").file} onFile={(f: File) => s("pdfTxt", { file: f })} tip="Click to browse or drag a PDF" /><CStat msg={g("pdfTxt").status} type={g("pdfTxt").statusType} /><HBtn onClick={convFns.pdfTxt} disabled={!g("pdfTxt").file} loading={g("pdfTxt").loading} label="Convert & Download" tip="Extracts text from every page" /></> },
    { ico: "🖼️", title: "PDF → PNG Images", desc: "Render pages as images, zip download", col: "#1a5c5c", rot: -0.3, tip: "Each page becomes a PNG, bundled in a ZIP", body: <><FZone accept=".pdf" label="Drop a PDF here" file={g("pdfImg").file} onFile={(f: File) => s("pdfImg", { file: f })} tip="Click to browse or drag a PDF" /><div className="flex gap-[8px] items-center"><HInput type="number" value={g("pdfImg").dpi || "150"} min="72" max="300" onChange={(e: any) => s("pdfImg", { dpi: e.target.value })} className="max-w-[80px]" /><Tip tip="Higher = sharper image, bigger file size"><span className="font-patrick text-[13px] text-ink4 cursor-help underline decoration-dotted decoration-[from-font]">DPI (72–300)</span></Tip></div>{g("pdfImg").loading && (g("pdfImg").prog || 0) > 0 && <div className="h-[5px] bg-paper3 rounded-[2px_6px] overflow-hidden border border-[rgba(100,70,40,.2)]"><div className="h-full bg-amber transition-[width] duration-300" style={{ width: (g("pdfImg").prog || 0) + "%" }} /></div>}<CStat msg={g("pdfImg").status} type={g("pdfImg").statusType} /><HBtn onClick={convFns.pdfImg} disabled={!g("pdfImg").file} loading={g("pdfImg").loading} label="Export as ZIP" tip="Creates page-001.png, page-002.png… in a ZIP" /></> },
    { ico: "🔗", title: "Merge PDFs", desc: "Stitch multiple PDFs into one", col: "#7a4510", rot: 0.2, tip: "Files are merged in the order you pick them", body: <><FZone accept=".pdf" label="Choose multiple PDFs" multi files={g("merge").files} onFiles={(f: File[]) => s("merge", { files: f })} tip="Hold Ctrl/Cmd to select multiple files" />{ML(g("merge").files, "📄")}<CStat msg={g("merge").status} type={g("merge").statusType} /><HBtn onClick={convFns.merge} disabled={!(g("merge").files?.length >= 2)} loading={g("merge").loading} label="Merge & Download" tip="You need at least 2 PDFs to merge" /></> },
    { ico: "✂️", title: "Split PDF", desc: "Pull out specific page ranges", col: "#1a5c5c", rot: -0.2, tip: 'Enter pages like "1-3, 5, 7" to extract', body: <><FZone accept=".pdf" label="Drop a PDF here" file={g("split").file} onFile={(f: File) => s("split", { file: f })} tip="The PDF you want to extract pages from" /><Tip tip='Examples: "1-3" · "2,4,6" · "1-3,7"'><HInput placeholder="Pages: 1-3, 5, 7" value={g("split").pages || ""} onChange={(e: any) => s("split", { pages: e.target.value })} /></Tip><CStat msg={g("split").status} type={g("split").statusType} /><HBtn onClick={convFns.split} disabled={!g("split").file || !g("split").pages} loading={g("split").loading} label="Extract Pages" tip="Saves only the pages you specified" /></> },
    { ico: "🖼️", title: "Images → PDF", desc: "Bundle JPG/PNG files into a PDF", col: "#1a3a6a", rot: 0.35, tip: "Images appear as full pages, in selection order", body: <><FZone accept="image/png,image/jpeg" label="Choose images (JPG/PNG)" multi files={g("imgPdf").files} onFiles={(f: File[]) => s("imgPdf", { files: f })} tip="Select multiple images at once" />{ML(g("imgPdf").files, "🖼️")}<CStat msg={g("imgPdf").status} type={g("imgPdf").statusType} /><HBtn onClick={convFns.imgPdf} disabled={!(g("imgPdf").files?.length > 0)} loading={g("imgPdf").loading} label="Create PDF" tip="Each image becomes one full page" /></> },
    { ico: "🔄", title: "Rotate PDF", desc: "Turn all pages 90°, 180°, or 270°", col: "#c07818", rot: -0.35, tip: "Rotation is applied to every page uniformly", body: <><FZone accept=".pdf" label="Drop a PDF here" file={g("rotate").file} onFile={(f: File) => s("rotate", { file: f })} tip="The PDF whose pages you want to rotate" /><Tip tip="Choose rotation angle for all pages"><HSel value={g("rotate").deg || "90"} onChange={(e: any) => s("rotate", { deg: e.target.value })}><option value="90">↩ Rotate 90° clockwise</option><option value="180">↕ Rotate 180°</option><option value="270">↪ Rotate 270° (counter-CW)</option></HSel></Tip><CStat msg={g("rotate").status} type={g("rotate").statusType} /><HBtn onClick={convFns.rotate} disabled={!g("rotate").file} loading={g("rotate").loading} label="Rotate & Download" tip="Applies to every page in the document" /></> },
    { ico: "📝", title: "PDF → DOCX", desc: "Convert PDF text into an editable Word document", col: "#1a3c7a", rot: 0.25, tip: "Extracts text from each page and builds a real .docx file", body: <><FZone accept=".pdf" label="Drop a PDF here" file={g("pdfDocx").file} onFile={(f: File) => s("pdfDocx", { file: f })} tip="The PDF to convert to Word format" />{g("pdfDocx").loading && (g("pdfDocx").prog || 0) > 0 && <div className="h-[5px] bg-paper3 rounded-[2px_6px] overflow-hidden border border-[rgba(100,70,40,.2)]"><div className="h-full bg-amber transition-[width] duration-300" style={{ width: (g("pdfDocx").prog || 0) + "%" }} /></div>}<CStat msg={g("pdfDocx").status} type={g("pdfDocx").statusType} /><HBtn onClick={convFns.pdfDocx} disabled={!g("pdfDocx").file} loading={g("pdfDocx").loading} label="Convert to DOCX" tip="Creates an editable .docx file from PDF text" /></> },
    { ico: "🔗", title: "PDF → Link", desc: "Upload & get a shareable viewer link", col: "#1a5c5c", rot: -0.25, tip: "Like Tiiny.host — upload your PDF and share a link", body: <div className="flex flex-col items-center gap-3 py-2"><div className="font-patrick text-[13px] text-ink4 text-center leading-[1.6]">Upload your PDF and get an instant shareable link that anyone can open to view and download.</div><Link href="/pdf-link" className="py-[10px] px-[22px] bg-amber hover:bg-amber2 text-white font-caveat text-[16px] font-bold rounded-[3px_10px_4px_9px] border-2 border-amber2 shadow-[2px_2px_0_rgba(30,15,5,.12)] hover:shadow-[3px_3px_0_rgba(30,15,5,.15)] hover:-translate-y-[1px] transition-all duration-150 no-underline cursor-pointer">🔗 Go to PDF Link →</Link></div> },
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
