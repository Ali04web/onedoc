"use client";

type PdfTextItemLike = {
  str?: string;
  transform?: number[];
  width?: number;
  height?: number;
  hasEOL?: boolean;
};

type PdfTextContentLike = {
  items: unknown[];
};

export interface PdfViewportLike {
  width: number;
  height: number;
}

export interface PdfPageLike {
  getTextContent(): Promise<PdfTextContentLike>;
  getViewport(options: { scale: number }): PdfViewportLike;
  render(options: {
    canvasContext: CanvasRenderingContext2D;
    viewport: PdfViewportLike;
  }): { promise: Promise<void> };
}

export interface PdfDocumentLike {
  numPages: number;
  getPage(pageNumber: number): Promise<PdfPageLike>;
}

export interface PdfJsLibLike {
  GlobalWorkerOptions: {
    workerSrc: string;
  };
  getDocument(options: { data: ArrayBuffer }): {
    promise: Promise<PdfDocumentLike>;
  };
}

type JsZipLike = {
  file(name: string, data: Blob | ArrayBuffer | Uint8Array | string): void;
  generateAsync(options: {
    type: "blob";
    mimeType?: string;
  }): Promise<Blob>;
};

type JsZipCtor = new () => JsZipLike;

interface PdfBrowserWindow extends Window {
  pdfjsLib?: PdfJsLibLike;
  JSZip?: JsZipCtor;
}

interface PositionedToken {
  text: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
}

export interface PdfLine {
  text: string;
  y: number;
  x: number;
  width: number;
  fontSize: number;
}

export interface PdfParagraph {
  text: string;
  role: "heading" | "paragraph" | "bullet";
  blankBefore: boolean;
  fontSize: number;
}

export interface PdfExtractedPage {
  pageNumber: number;
  width: number;
  height: number;
  lines: PdfLine[];
  paragraphs: PdfParagraph[];
  text: string;
}

export interface PdfExtraction {
  pageCount: number;
  text: string;
  pages: PdfExtractedPage[];
}

export interface RenderedPdfPage {
  pageNumber: number;
  blob: Blob;
  widthPx: number;
  heightPx: number;
  pageWidthTwips: number;
  pageHeightTwips: number;
}

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const PDF_PX_TO_TWIPS = 15;
const PDF_PX_TO_EMU = 9525;
const BULLET_PATTERN = /^([\u2022\u25AA\u25E6\u2023\-]|\d+[\.\)])\s+/;

function browserWindow(): PdfBrowserWindow {
  if (typeof window === "undefined") {
    throw new Error("This feature is only available in the browser.");
  }
  return window as PdfBrowserWindow;
}

function getPdfJsLib(workerSrc: string): PdfJsLibLike {
  const lib = browserWindow().pdfjsLib;
  if (!lib) {
    throw new Error("PDF engine is still loading. Please try again in a moment.");
  }
  lib.GlobalWorkerOptions.workerSrc = workerSrc;
  return lib;
}

function createZip(): JsZipLike {
  const ZipCtor = browserWindow().JSZip;
  if (!ZipCtor) {
    throw new Error("ZIP engine is still loading. Please try again in a moment.");
  }
  return new ZipCtor();
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function round(value: number, places = 2): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2) {
    return sorted[middle];
  }
  return (sorted[middle - 1] + sorted[middle]) / 2;
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not render the PDF page."));
        return;
      }
      resolve(blob);
    }, mimeType);
  });
}

function normalizeTokenText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function normalizeParagraphText(text: string): string {
  return text
    .replace(/[ \t]+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .trim();
}

function mergeWrappedLines(previous: string, next: string): string {
  if (!previous) return next;
  const trimmedPrevious = previous.trimEnd();
  const trimmedNext = next.trimStart();
  if (!trimmedNext) return trimmedPrevious;

  if (trimmedPrevious.endsWith("-") && /^[a-z]/.test(trimmedNext)) {
    return `${trimmedPrevious.slice(0, -1)}${trimmedNext}`;
  }

  if (/[/(-]$/.test(trimmedPrevious)) {
    return `${trimmedPrevious}${trimmedNext}`;
  }

  return `${trimmedPrevious} ${trimmedNext}`;
}

function getTokenFromUnknown(item: unknown): PositionedToken | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const token = item as PdfTextItemLike;
  const rawText = typeof token.str === "string" ? token.str : "";
  const text = normalizeTokenText(rawText);
  if (!text) {
    return null;
  }

  const transform = Array.isArray(token.transform) ? token.transform : [];
  const x = typeof transform[4] === "number" ? transform[4] : 0;
  const y = typeof transform[5] === "number" ? transform[5] : 0;
  const width = typeof token.width === "number" ? token.width : text.length * 6;
  const scaleX =
    typeof transform[0] === "number" && typeof transform[1] === "number"
      ? Math.hypot(transform[0], transform[1])
      : 0;
  const scaleY =
    typeof transform[2] === "number" && typeof transform[3] === "number"
      ? Math.hypot(transform[2], transform[3])
      : 0;
  const fontSize =
    scaleY || scaleX || (typeof token.height === "number" ? token.height : 12);

  return {
    text,
    x,
    y,
    width,
    fontSize,
  };
}

function tokensToLines(tokens: PositionedToken[], pageWidth: number): PdfLine[] {
  const sorted = [...tokens].sort((a, b) => {
    if (Math.abs(a.y - b.y) > 2) {
      return b.y - a.y;
    }
    return a.x - b.x;
  });

  const buckets: Array<{ y: number; items: PositionedToken[] }> = [];

  for (const token of sorted) {
    const threshold = Math.max(3, token.fontSize * 0.45);
    let bucket: { y: number; items: PositionedToken[] } | undefined;

    for (const candidate of buckets) {
      if (Math.abs(candidate.y - token.y) <= threshold) {
        bucket = candidate;
        break;
      }
    }

    if (!bucket) {
      bucket = { y: token.y, items: [] };
      buckets.push(bucket);
    }

    bucket.items.push(token);
    bucket.y =
      bucket.items.reduce((sum, item) => sum + item.y, 0) / bucket.items.length;
  }

  const lines = buckets
    .map((bucket) => {
      const items = [...bucket.items].sort((a, b) => a.x - b.x);
      let text = "";
      let previousEnd = 0;

      items.forEach((item, index) => {
        if (!item.text) return;

        if (index === 0) {
          text = item.text;
          previousEnd = item.x + item.width;
          return;
        }

        const gap = item.x - previousEnd;
        const needsSpace =
          gap > item.fontSize * 0.18 &&
          !/^[,.;:!?)]/.test(item.text) &&
          !/[(/]$/.test(text);

        text += needsSpace ? ` ${item.text}` : item.text;
        previousEnd = Math.max(previousEnd, item.x + item.width);
      });

      const fontSize = median(items.map((item) => item.fontSize)) || 12;
      const left = Math.min(...items.map((item) => item.x));
      const right = Math.max(...items.map((item) => item.x + item.width));

      return {
        text: normalizeParagraphText(text),
        y: round(bucket.y),
        x: round(left),
        width: round(right - left),
        fontSize: round(fontSize),
      };
    })
    .filter((line) => line.text);

  const leftLines = lines.filter((line) => line.x < pageWidth * 0.45);
  const rightLines = lines.filter((line) => line.x > pageWidth * 0.55);
  const spanningLines = lines.filter(
    (line) => line.x < pageWidth * 0.55 && line.x + line.width > pageWidth * 0.45
  );
  const isTwoColumn =
    leftLines.length > 6 &&
    rightLines.length > 6 &&
    spanningLines.length < lines.length * 0.4;

  return [...lines].sort((a, b) => {
    if (!isTwoColumn) {
      if (Math.abs(a.y - b.y) > 2) return b.y - a.y;
      return a.x - b.x;
    }

    const aColumn = a.x < pageWidth / 2 ? 0 : 1;
    const bColumn = b.x < pageWidth / 2 ? 0 : 1;

    if (Math.abs(a.y - b.y) <= 8 && a.width > pageWidth * 0.7) return -1;
    if (Math.abs(a.y - b.y) <= 8 && b.width > pageWidth * 0.7) return 1;
    if (aColumn !== bColumn) return aColumn - bColumn;
    if (Math.abs(a.y - b.y) > 2) return b.y - a.y;
    return a.x - b.x;
  });
}

function detectParagraphRole(
  line: PdfLine,
  baseFontSize: number
): PdfParagraph["role"] {
  if (BULLET_PATTERN.test(line.text)) {
    return "bullet";
  }

  const looksLikeHeading =
    line.fontSize > baseFontSize * 1.18 &&
    line.text.length <= 90 &&
    !/[.!?]$/.test(line.text);

  return looksLikeHeading ? "heading" : "paragraph";
}

function linesToParagraphs(lines: PdfLine[]): PdfParagraph[] {
  const fontSizes = lines.map((line) => line.fontSize).filter(Boolean);
  const baseFontSize = median(fontSizes) || 12;
  const paragraphs: PdfParagraph[] = [];

  let current: PdfParagraph | null = null;
  let previous: PdfLine | null = null;

  for (const line of lines) {
    const role = detectParagraphRole(line, baseFontSize);
    const verticalGap = previous ? previous.y - line.y : 0;
    const indentShift = previous ? Math.abs(previous.x - line.x) : 0;
    const startsFresh =
      !current ||
      role !== current.role ||
      verticalGap > Math.max(previous?.fontSize ?? 12, line.fontSize) * 1.25 ||
      indentShift > baseFontSize * 1.2 ||
      role !== "paragraph";
    const blankBefore =
      Boolean(previous) &&
      verticalGap > Math.max(previous?.fontSize ?? 12, line.fontSize) * 1.8;

    if (startsFresh) {
      current = {
        text: line.text,
        role,
        blankBefore,
        fontSize: line.fontSize,
      };
      paragraphs.push(current);
      previous = line;
      continue;
    }

    current.text = mergeWrappedLines(current.text, line.text);
    current.fontSize = Math.max(current.fontSize, line.fontSize);
    previous = line;
  }

  return paragraphs.map((paragraph) => ({
    ...paragraph,
    text: normalizeParagraphText(paragraph.text),
  }));
}

async function openPdfDocument(
  file: File,
  workerSrc: string
): Promise<PdfDocumentLike> {
  const pdfjs = getPdfJsLib(workerSrc);
  return pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
}

export async function extractPdfFile(
  file: File,
  workerSrc: string,
  options: {
    onProgress?: (progress: number) => void;
  } = {}
): Promise<PdfExtraction> {
  const pdf = await openPdfDocument(file, workerSrc);
  const pages: PdfExtractedPage[] = [];

  for (let index = 1; index <= pdf.numPages; index += 1) {
    const page = await pdf.getPage(index);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    const tokens = content.items
      .map((item) => getTokenFromUnknown(item))
      .filter((item): item is PositionedToken => Boolean(item));
    const lines = tokensToLines(tokens, viewport.width);
    const paragraphs = linesToParagraphs(lines);
    const text = paragraphs
      .map((paragraph, paragraphIndex) => {
        const pieces: string[] = [];
        if (paragraphIndex > 0 && paragraph.blankBefore) {
          pieces.push("");
        }
        pieces.push(paragraph.text);
        return pieces.join("\n");
      })
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    pages.push({
      pageNumber: index,
      width: round(viewport.width),
      height: round(viewport.height),
      lines,
      paragraphs,
      text,
    });

    options.onProgress?.(Math.round((index / pdf.numPages) * 100));
  }

  return {
    pageCount: pdf.numPages,
    text: pages
      .map((page) => `--- Page ${page.pageNumber} ---\n${page.text}`.trim())
      .join("\n\n")
      .trim(),
    pages,
  };
}

export async function renderPdfPages(
  file: File,
  workerSrc: string,
  dpi: number,
  options: {
    onProgress?: (progress: number) => void;
  } = {}
): Promise<RenderedPdfPage[]> {
  const pdf = await openPdfDocument(file, workerSrc);
  const renderedPages: RenderedPdfPage[] = [];
  const scale = Math.max(1, dpi / 96);

  for (let index = 1; index <= pdf.numPages; index += 1) {
    const page = await pdf.getPage(index);
    const baseViewport = page.getViewport({ scale: 1 });
    const renderViewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(renderViewport.width);
    canvas.height = Math.ceil(renderViewport.height);

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not create a canvas context for PDF rendering.");
    }

    await page.render({ canvasContext: context, viewport: renderViewport }).promise;
    const blob = await canvasToBlob(canvas, "image/png");

    renderedPages.push({
      pageNumber: index,
      blob,
      widthPx: Math.ceil(baseViewport.width),
      heightPx: Math.ceil(baseViewport.height),
      pageWidthTwips: Math.ceil(baseViewport.width * PDF_PX_TO_TWIPS),
      pageHeightTwips: Math.ceil(baseViewport.height * PDF_PX_TO_TWIPS),
    });

    options.onProgress?.(Math.round((index / pdf.numPages) * 100));
  }

  return renderedPages;
}

export async function buildPdfImageZip(
  renderedPages: RenderedPdfPage[]
): Promise<Blob> {
  const zip = createZip();

  renderedPages.forEach((page) => {
    zip.file(
      `page-${String(page.pageNumber).padStart(3, "0")}.png`,
      page.blob
    );
  });

  return zip.generateAsync({ type: "blob" });
}

function buildDocumentRelationships(imageCount: number): string {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
  ];

  for (let index = 1; index <= imageCount; index += 1) {
    lines.push(
      `<Relationship Id="rId${index}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/page-${String(index).padStart(3, "0")}.png"/>`
    );
  }

  lines.push("</Relationships>");
  return lines.join("");
}

function buildContentTypes(includeImages: boolean): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  ${includeImages ? '<Default Extension="png" ContentType="image/png"/>' : ""}
  <Override PartName="/word/document.xml" ContentType="${DOCX_MIME}.main+xml"/>
</Types>`;
}

function buildRootRelationships(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
}

function buildSectionProperties(pageWidthTwips: number, pageHeightTwips: number): string {
  return `<w:sectPr><w:pgSz w:w="${pageWidthTwips}" w:h="${pageHeightTwips}"/><w:pgMar w:top="0" w:right="0" w:bottom="0" w:left="0" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr>`;
}

function buildTextParagraphXml(paragraph: PdfParagraph): string {
  const safeText =
    paragraph.role === "bullet" && !BULLET_PATTERN.test(paragraph.text)
      ? `\u2022 ${paragraph.text}`
      : paragraph.text;
  const fontHalfPoints =
    paragraph.role === "heading"
      ? Math.min(40, Math.max(26, Math.round(paragraph.fontSize * 1.6)))
      : 22;
  const spacingAfter = paragraph.role === "heading" ? 180 : 120;
  const indent =
    paragraph.role === "bullet"
      ? '<w:ind w:left="720" w:hanging="360"/>'
      : "";
  const bold = paragraph.role === "heading" ? "<w:b/>" : "";

  return `<w:p><w:pPr><w:spacing w:before="0" w:after="${spacingAfter}"/>${indent}</w:pPr><w:r><w:rPr>${bold}<w:sz w:val="${fontHalfPoints}"/></w:rPr><w:t xml:space="preserve">${escapeXml(
    safeText
  )}</w:t></w:r></w:p>`;
}

function buildTextDocumentXml(extraction: PdfExtraction): string {
  const bodyParts: string[] = [];
  const pageWidthTwips = Math.max(
    ...extraction.pages.map((page) => Math.ceil(page.width * PDF_PX_TO_TWIPS)),
    12240
  );
  const pageHeightTwips = Math.max(
    ...extraction.pages.map((page) => Math.ceil(page.height * PDF_PX_TO_TWIPS)),
    15840
  );

  extraction.pages.forEach((page, pageIndex) => {
    page.paragraphs.forEach((paragraph, paragraphIndex) => {
      if (paragraphIndex > 0 && paragraph.blankBefore) {
        bodyParts.push("<w:p/>");
      }
      bodyParts.push(buildTextParagraphXml(paragraph));
    });

    if (pageIndex < extraction.pages.length - 1) {
      bodyParts.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
    }
  });

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  mc:Ignorable="w14 wp14">
  <w:body>
    ${bodyParts.join("")}
    ${buildSectionProperties(pageWidthTwips, pageHeightTwips)}
  </w:body>
</w:document>`;
}

function buildImageParagraphXml(page: RenderedPdfPage): string {
  const widthEmu = page.widthPx * PDF_PX_TO_EMU;
  const heightEmu = page.heightPx * PDF_PX_TO_EMU;
  const id = page.pageNumber;

  return `<w:p><w:pPr><w:spacing w:before="0" w:after="0"/><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><wp:extent cx="${widthEmu}" cy="${heightEmu}"/><wp:docPr id="${id}" name="PDF Page ${id}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${id}" name="page-${String(
    id
  ).padStart(3, "0")}.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rId${id}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${widthEmu}" cy="${heightEmu}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
}

function buildImageDocumentXml(renderedPages: RenderedPdfPage[]): string {
  const bodyParts: string[] = [];
  const pageWidthTwips = Math.max(
    ...renderedPages.map((page) => page.pageWidthTwips),
    12240
  );
  const pageHeightTwips = Math.max(
    ...renderedPages.map((page) => page.pageHeightTwips),
    15840
  );

  renderedPages.forEach((page, pageIndex) => {
    bodyParts.push(buildImageParagraphXml(page));
    if (pageIndex < renderedPages.length - 1) {
      bodyParts.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
    }
  });

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  mc:Ignorable="w14 wp14">
  <w:body>
    ${bodyParts.join("")}
    ${buildSectionProperties(pageWidthTwips, pageHeightTwips)}
  </w:body>
</w:document>`;
}

async function buildDocxBlob(
  documentXml: string,
  imagePages: RenderedPdfPage[] = []
): Promise<Blob> {
  const zip = createZip();

  zip.file("[Content_Types].xml", buildContentTypes(imagePages.length > 0));
  zip.file("_rels/.rels", buildRootRelationships());
  zip.file("word/document.xml", documentXml);
  zip.file(
    "word/_rels/document.xml.rels",
    buildDocumentRelationships(imagePages.length)
  );

  imagePages.forEach((page) => {
    zip.file(
      `word/media/page-${String(page.pageNumber).padStart(3, "0")}.png`,
      page.blob
    );
  });

  return zip.generateAsync({ type: "blob", mimeType: DOCX_MIME });
}

export async function buildEditablePdfDocx(
  extraction: PdfExtraction
): Promise<Blob> {
  return buildDocxBlob(buildTextDocumentXml(extraction));
}

export async function buildLayoutPdfDocx(
  renderedPages: RenderedPdfPage[]
): Promise<Blob> {
  return buildDocxBlob(buildImageDocumentXml(renderedPages), renderedPages);
}
