"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  extractPdfFile,
  renderPdfPages,
  type PdfExtraction,
  type PdfExtractedPage,
  type RenderedPdfPage,
} from "@/app/lib/pdf-client";

declare global {
  interface Window {
    pdfjsLib?: any;
    PDFLib?: any;
    JSZip?: any;
    Tesseract?: any;
  }
}

export type PlacementPreset =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface OptimizePdfResult {
  blob: Blob;
  originalBytes: number;
  optimizedBytes: number;
}

export interface ExtractImagesResult {
  zip: Blob;
  extractedCount: number;
  fallbackUsed: boolean;
}

export interface OcrPdfResult {
  text: string;
  pageCount: number;
}

export interface RedactPdfResult {
  blob: Blob;
  matches: number;
}

export interface ComparePdfResult {
  html: string;
  text: string;
  score: number;
  identical: boolean;
  differingPages: number[];
  pageCountA: number;
  pageCountB: number;
}

type ImageCarrier = {
  blob: Blob;
  widthPx: number;
  heightPx: number;
};

const TESSERACT_SRC =
  "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";

function ensureWindow() {
  if (typeof window === "undefined") {
    throw new Error("This feature is only available in the browser.");
  }

  return window;
}

function getPdfJs(workerSrc: string) {
  const browserWindow = ensureWindow();
  if (!browserWindow.pdfjsLib) {
    throw new Error("PDF engine is still loading. Please try again in a moment.");
  }

  browserWindow.pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
  return browserWindow.pdfjsLib;
}

function getPdfLib() {
  const browserWindow = ensureWindow();
  if (!browserWindow.PDFLib) {
    throw new Error("PDF tools are still loading. Please try again in a moment.");
  }

  return browserWindow.PDFLib;
}

function getZip() {
  const browserWindow = ensureWindow();
  if (!browserWindow.JSZip) {
    throw new Error("ZIP tools are still loading. Please try again in a moment.");
  }

  return new browserWindow.JSZip();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeCompareText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function tokenizeForCompare(value: string) {
  return normalizeCompareText(value)
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
}

function similarityScore(first: string, second: string) {
  const left = new Set(tokenizeForCompare(first));
  const right = new Set(tokenizeForCompare(second));

  if (!left.size && !right.size) {
    return 1;
  }

  let intersection = 0;
  left.forEach((token) => {
    if (right.has(token)) {
      intersection += 1;
    }
  });

  const union = new Set([...left, ...right]).size;
  return union ? intersection / union : 1;
}

function percent(score: number) {
  return Math.round(score * 100);
}

function describePageComparison(score: number) {
  if (score >= 0.999) return "Exact match";
  if (score >= 0.92) return "Very similar";
  if (score >= 0.72) return "Moderate changes";
  if (score >= 0.45) return "Major changes";
  return "Completely different";
}

export function parseOrderedPageList(value: string, totalPages: number) {
  const output: number[] = [];
  const seen = new Set<number>();

  value
    .split(",")
    .map((piece) => piece.trim())
    .filter(Boolean)
    .forEach((piece) => {
      if (piece.includes("-")) {
        const [startRaw, endRaw] = piece.split("-").map((part) => Number.parseInt(part.trim(), 10));
        if (!Number.isFinite(startRaw) || !Number.isFinite(endRaw)) {
          return;
        }

        const direction = startRaw <= endRaw ? 1 : -1;
        for (
          let page = startRaw;
          direction === 1 ? page <= endRaw : page >= endRaw;
          page += direction
        ) {
          if (page < 1 || page > totalPages || seen.has(page)) {
            continue;
          }
          seen.add(page);
          output.push(page);
        }
        return;
      }

      const page = Number.parseInt(piece, 10);
      if (!Number.isFinite(page) || page < 1 || page > totalPages || seen.has(page)) {
        return;
      }

      seen.add(page);
      output.push(page);
    });

  return output;
}

export function parseTerms(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((term) => term.trim())
        .filter((term) => term.length > 0)
    )
  );
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function resolvePlacement(
  preset: PlacementPreset,
  pageWidth: number,
  pageHeight: number,
  boxWidth: number,
  boxHeight: number,
  margin = 36
) {
  const horizontal =
    preset === "top-left" || preset === "bottom-left"
      ? margin
      : preset === "top-center" || preset === "bottom-center" || preset === "center"
        ? (pageWidth - boxWidth) / 2
        : pageWidth - boxWidth - margin;

  const vertical =
    preset === "top-left" || preset === "top-center" || preset === "top-right"
      ? pageHeight - boxHeight - margin
      : preset === "center"
        ? (pageHeight - boxHeight) / 2
        : margin;

  return {
    x: clamp(horizontal, 0, Math.max(0, pageWidth - boxWidth)),
    y: clamp(vertical, 0, Math.max(0, pageHeight - boxHeight)),
  };
}

export async function ensureScriptLoaded(url: string, globalKey: keyof Window) {
  const browserWindow = ensureWindow();
  if (browserWindow[globalKey]) {
    return;
  }

  const existing = document.querySelector(`script[src="${url}"]`) as HTMLScriptElement | null;
  if (existing) {
    await new Promise<void>((resolve, reject) => {
      if (browserWindow[globalKey]) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load script: ${url}`)), {
        once: true,
      });
    });
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error(`Failed to load script: ${url}`)), {
      once: true,
    });
    document.head.appendChild(script);
  });
}

async function renderedPageToCanvas(page: RenderedPdfPage) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not create a canvas context for image processing.");
  }

  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(page.blob);
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return { canvas, context };
  }

  const objectUrl = URL.createObjectURL(page.blob);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Could not decode image data."));
      element.src = objectUrl;
    });

    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  return { canvas, context };
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not render an image from the PDF."));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

function applyGrayscale(context: CanvasRenderingContext2D, width: number, height: number) {
  const image = context.getImageData(0, 0, width, height);
  for (let index = 0; index < image.data.length; index += 4) {
    const red = image.data[index];
    const green = image.data[index + 1];
    const blue = image.data[index + 2];
    const gray = Math.round(red * 0.299 + green * 0.587 + blue * 0.114);

    image.data[index] = gray;
    image.data[index + 1] = gray;
    image.data[index + 2] = gray;
  }
  context.putImageData(image, 0, 0);
}

async function buildPdfFromImages(pages: ImageCarrier[]) {
  const { PDFDocument } = getPdfLib();
  const pdf = await PDFDocument.create();

  for (const page of pages) {
    const bytes = await page.blob.arrayBuffer();
    const embedded =
      page.blob.type === "image/png"
        ? await pdf.embedPng(bytes)
        : await pdf.embedJpg(bytes);
    const outputPage = pdf.addPage([page.widthPx, page.heightPx]);

    outputPage.drawImage(embedded, {
      x: 0,
      y: 0,
      width: page.widthPx,
      height: page.heightPx,
    });
  }

  return new Blob([await pdf.save()], { type: "application/pdf" });
}

function buildRectForLineMatch(
  page: PdfExtractedPage,
  canvas: HTMLCanvasElement,
  line: PdfExtractedPage["lines"][number],
  term: string,
  index: number
) {
  const scaleX = canvas.width / page.width;
  const scaleY = canvas.height / page.height;
  const characterWidth = line.width / Math.max(line.text.length, 1);
  const lineHeight = Math.max(line.fontSize * 1.3, 12);

  const x = Math.max(0, (line.x + characterWidth * index) * scaleX - 2);
  const width = Math.min(
    canvas.width - x,
    Math.max(characterWidth * term.length * scaleX + 6, line.fontSize * scaleX * 0.85)
  );
  const y = Math.max(0, canvas.height - line.y * scaleY - lineHeight * scaleY);
  const height = Math.min(canvas.height - y, Math.max(lineHeight * scaleY, 12));

  return { x, y, width, height };
}

function cleanOcrText(value: string) {
  return value.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function buildComparisonText(
  fileA: File,
  fileB: File,
  extractionA: PdfExtraction,
  extractionB: PdfExtraction,
  overallScore: number,
  differingPages: number[],
  pageSummaries: Array<{ pageNumber: number; score: number; left: string; right: string }>
) {
  const lines = [
    "PDF comparison report",
    "",
    `File A: ${fileA.name}`,
    `File B: ${fileB.name}`,
    `Overall similarity: ${percent(overallScore)}%`,
    `Page count: ${extractionA.pageCount} vs ${extractionB.pageCount}`,
    differingPages.length
      ? `Pages with notable differences: ${differingPages.join(", ")}`
      : "No page-level differences detected.",
    "",
  ];

  pageSummaries.forEach((page) => {
    lines.push(`Page ${page.pageNumber}: ${percent(page.score)}% (${describePageComparison(page.score)})`);
    if (page.left && page.right && page.score < 0.92) {
      lines.push(`A: ${page.left.slice(0, 180)}`);
      lines.push(`B: ${page.right.slice(0, 180)}`);
    }
    lines.push("");
  });

  return lines.join("\n").trim();
}

function buildComparisonHtml(
  fileA: File,
  fileB: File,
  extractionA: PdfExtraction,
  extractionB: PdfExtraction,
  overallScore: number,
  pageSummaries: Array<{ pageNumber: number; score: number; left: string; right: string }>
) {
  const rows = pageSummaries
    .map((page) => {
      return `
        <tr>
          <td>${page.pageNumber}</td>
          <td>${percent(page.score)}%</td>
          <td>${escapeHtml(describePageComparison(page.score))}</td>
          <td>${escapeHtml(page.left.slice(0, 220) || "-")}</td>
          <td>${escapeHtml(page.right.slice(0, 220) || "-")}</td>
        </tr>
      `;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>PDF comparison report</title>
  <style>
    body {
      margin: 0;
      padding: 32px;
      background: #0d0f1a;
      color: #f5f7fb;
      font-family: "Segoe UI", system-ui, sans-serif;
    }
    .shell {
      max-width: 1180px;
      margin: 0 auto;
    }
    h1 {
      margin: 0 0 10px;
      font-size: 30px;
    }
    p {
      color: #aab2c5;
      line-height: 1.6;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 14px;
      margin: 24px 0 30px;
    }
    .card {
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.03);
      border-radius: 16px;
      padding: 16px 18px;
    }
    .label {
      color: #8f97a8;
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .value {
      margin-top: 8px;
      font-size: 24px;
      font-weight: 700;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      overflow: hidden;
      border-radius: 18px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.03);
    }
    th, td {
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      vertical-align: top;
      font-size: 14px;
      line-height: 1.5;
    }
    th {
      color: #8f97a8;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    tr:last-child td {
      border-bottom: none;
    }
    code {
      font-family: Consolas, monospace;
      color: #d6dcff;
    }
  </style>
</head>
<body>
  <div class="shell">
    <h1>PDF comparison report</h1>
    <p>Comparing <code>${escapeHtml(fileA.name)}</code> and <code>${escapeHtml(
      fileB.name
    )}</code> using extracted text similarity per page.</p>
    <div class="stats">
      <div class="card">
        <div class="label">Overall similarity</div>
        <div class="value">${percent(overallScore)}%</div>
      </div>
      <div class="card">
        <div class="label">Pages in file A</div>
        <div class="value">${extractionA.pageCount}</div>
      </div>
      <div class="card">
        <div class="label">Pages in file B</div>
        <div class="value">${extractionB.pageCount}</div>
      </div>
      <div class="card">
        <div class="label">Report type</div>
        <div class="value">Text-based</div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Page</th>
          <th>Similarity</th>
          <th>Status</th>
          <th>File A preview</th>
          <th>File B preview</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
</body>
</html>`;
}

function dataToCanvas(data: Uint8ClampedArray, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create a canvas for image extraction.");
  }

  context.putImageData(new ImageData(data, width, height), 0, 0);
  return canvas;
}

async function imageObjectToCanvas(raw: any): Promise<HTMLCanvasElement | null> {
  if (!raw) return null;

  if (typeof ImageBitmap !== "undefined" && raw instanceof ImageBitmap) {
    const canvas = document.createElement("canvas");
    canvas.width = raw.width;
    canvas.height = raw.height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not create a canvas for image extraction.");
    }
    context.drawImage(raw, 0, 0);
    return canvas;
  }

  if (raw instanceof HTMLCanvasElement) {
    const canvas = document.createElement("canvas");
    canvas.width = raw.width;
    canvas.height = raw.height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not create a canvas for image extraction.");
    }
    context.drawImage(raw, 0, 0);
    return canvas;
  }

  if (raw instanceof HTMLImageElement) {
    const canvas = document.createElement("canvas");
    canvas.width = raw.naturalWidth || raw.width;
    canvas.height = raw.naturalHeight || raw.height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not create a canvas for image extraction.");
    }
    context.drawImage(raw, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  if (raw.bitmap) {
    return imageObjectToCanvas(raw.bitmap);
  }

  if (raw.data && raw.width && raw.height) {
    const bytes =
      raw.data instanceof Uint8ClampedArray
        ? raw.data
        : new Uint8ClampedArray(raw.data);
    const pixelCount = raw.width * raw.height;

    if (bytes.length === pixelCount * 4) {
      return dataToCanvas(bytes, raw.width, raw.height);
    }

    if (bytes.length === pixelCount * 3) {
      const rgba = new Uint8ClampedArray(pixelCount * 4);
      for (let sourceIndex = 0, targetIndex = 0; sourceIndex < bytes.length; sourceIndex += 3, targetIndex += 4) {
        rgba[targetIndex] = bytes[sourceIndex];
        rgba[targetIndex + 1] = bytes[sourceIndex + 1];
        rgba[targetIndex + 2] = bytes[sourceIndex + 2];
        rgba[targetIndex + 3] = 255;
      }
      return dataToCanvas(rgba, raw.width, raw.height);
    }

    if (bytes.length === pixelCount) {
      const rgba = new Uint8ClampedArray(pixelCount * 4);
      for (let sourceIndex = 0, targetIndex = 0; sourceIndex < bytes.length; sourceIndex += 1, targetIndex += 4) {
        const value = bytes[sourceIndex];
        rgba[targetIndex] = value;
        rgba[targetIndex + 1] = value;
        rgba[targetIndex + 2] = value;
        rgba[targetIndex + 3] = 255;
      }
      return dataToCanvas(rgba, raw.width, raw.height);
    }
  }

  return null;
}

function resolvePdfImageObject(pageLike: any, objectId: string) {
  return new Promise<any>((resolve, reject) => {
    const stores = [pageLike?.objs, pageLike?.commonObjs].filter(Boolean);
    let settled = false;
    const finish = (value: any) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    try {
      for (const store of stores) {
        const direct = store?.get?.(objectId);
        if (direct) {
          finish(direct);
          return;
        }
      }
    } catch {
      // Ignore direct-access errors and fall back to callback mode.
    }

    try {
      stores.forEach((store) => {
        store?.get?.(objectId, (value: any) => finish(value));
      });
    } catch (error) {
      fail(error);
      return;
    }

    window.setTimeout(() => {
      if (!settled) {
        fail(new Error("Timed out while extracting an embedded PDF image."));
      }
    }, 1800);
  });
}

export async function optimizePdfForWeb(
  file: File,
  workerSrc: string,
  options: {
    dpi: number;
    quality: number;
    grayscale?: boolean;
    onProgress?: (progress: number) => void;
  }
): Promise<OptimizePdfResult> {
  const rendered = await renderPdfPages(file, workerSrc, options.dpi, {
    onProgress: (progress) => options.onProgress?.(Math.round(progress * 0.6)),
  });

  const transformedPages: ImageCarrier[] = [];

  for (let index = 0; index < rendered.length; index += 1) {
    const page = rendered[index];
    const { canvas, context } = await renderedPageToCanvas(page);

    if (options.grayscale) {
      applyGrayscale(context, canvas.width, canvas.height);
    }

    const blob = await canvasToBlob(canvas, "image/jpeg", clamp(options.quality, 0.2, 0.98));
    transformedPages.push({
      blob,
      widthPx: page.widthPx,
      heightPx: page.heightPx,
    });

    options.onProgress?.(60 + Math.round(((index + 1) / rendered.length) * 25));
  }

  const output = await buildPdfFromImages(transformedPages);
  options.onProgress?.(100);

  return {
    blob: output,
    originalBytes: file.size,
    optimizedBytes: output.size,
  };
}

export async function extractPdfImages(
  file: File,
  workerSrc: string,
  options: {
    onProgress?: (progress: number) => void;
  } = {}
): Promise<ExtractImagesResult> {
  const pdfjs = getPdfJs(workerSrc);
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const zip = getZip();
  let extractedCount = 0;
  const seenObjects = new Set<string>();

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const operatorList = await page.getOperatorList?.();

    if (operatorList) {
      for (let index = 0; index < operatorList.fnArray.length; index += 1) {
        const fn = operatorList.fnArray[index];
        const args = operatorList.argsArray[index];
        const isInline = fn === pdfjs.OPS.paintInlineImageXObject;
        const isObjectImage =
          fn === pdfjs.OPS.paintImageXObject ||
          fn === pdfjs.OPS.paintImageXObjectRepeat ||
          fn === pdfjs.OPS.paintJpegXObject;

        if (!isInline && !isObjectImage) {
          continue;
        }

        try {
          const imageSource = isInline
            ? args?.[0]
            : await resolvePdfImageObject(page as any, String(args?.[0] ?? ""));
          const objectId = isInline
            ? `inline-${pageNumber}-${index}`
            : `page-${pageNumber}-${String(args?.[0] ?? index)}`;

          if (seenObjects.has(objectId)) {
            continue;
          }

          const canvas = await imageObjectToCanvas(imageSource);
          if (!canvas) {
            continue;
          }

          seenObjects.add(objectId);
          extractedCount += 1;
          const blob = await canvasToBlob(canvas, "image/png");
          zip.file(
            `page-${String(pageNumber).padStart(3, "0")}-image-${String(extractedCount).padStart(3, "0")}.png`,
            blob
          );
        } catch {
          // Skip malformed image objects and continue extracting the rest.
        }
      }
    }

    options.onProgress?.(Math.round((pageNumber / pdf.numPages) * 100));
  }

  let fallbackUsed = false;

  if (!extractedCount) {
    fallbackUsed = true;
    const rendered = await renderPdfPages(file, workerSrc, 150, {
      onProgress: (progress) => options.onProgress?.(Math.round(progress)),
    });

    rendered.forEach((page) => {
      zip.file(`page-${String(page.pageNumber).padStart(3, "0")}.png`, page.blob);
    });
  }

  return {
    zip: await zip.generateAsync({ type: "blob" }),
    extractedCount,
    fallbackUsed,
  };
}

export async function runPdfOcr(
  file: File,
  workerSrc: string,
  options: {
    language?: string;
    dpi?: number;
    onProgress?: (progress: number, label?: string) => void;
  } = {}
): Promise<OcrPdfResult> {
  await ensureScriptLoaded(TESSERACT_SRC, "Tesseract");

  const rendered = await renderPdfPages(file, workerSrc, options.dpi ?? 170, {
    onProgress: (progress) => options.onProgress?.(Math.round(progress * 0.35), "Rendering PDF pages"),
  });

  let text = "";

  for (let index = 0; index < rendered.length; index += 1) {
    const page = rendered[index];
    const objectUrl = URL.createObjectURL(page.blob);

    try {
      const result = await ensureWindow().Tesseract.recognize(
        objectUrl,
        options.language || "eng",
        {
          logger: (message: any) => {
            if (typeof message?.progress !== "number") {
              return;
            }

            const base = 35 + (index / rendered.length) * 65;
            const span = 65 / rendered.length;
            options.onProgress?.(
              Math.min(99, Math.round(base + message.progress * span)),
              `OCR on page ${index + 1} of ${rendered.length}`
            );
          },
        }
      );

      const pageText = cleanOcrText(result?.data?.text || "");
      text += `--- Page ${page.pageNumber} ---\n${pageText}\n\n`;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  options.onProgress?.(100, "OCR complete");

  return {
    text: text.trim(),
    pageCount: rendered.length,
  };
}

export async function createRedactedPdf(
  file: File,
  workerSrc: string,
  terms: string[],
  options: {
    dpi?: number;
    onProgress?: (progress: number) => void;
  } = {}
): Promise<RedactPdfResult> {
  const cleanTerms = terms.map((term) => term.toLowerCase());
  const extraction = await extractPdfFile(file, workerSrc, {
    onProgress: (progress) => options.onProgress?.(Math.round(progress * 0.35)),
  });
  const rendered = await renderPdfPages(file, workerSrc, options.dpi ?? 170, {
    onProgress: (progress) => options.onProgress?.(35 + Math.round(progress * 0.35)),
  });

  const redactedPages: ImageCarrier[] = [];
  let matches = 0;

  for (let index = 0; index < rendered.length; index += 1) {
    const page = rendered[index];
    const extractedPage = extraction.pages[index];
    const { canvas, context } = await renderedPageToCanvas(page);

    context.fillStyle = "#000000";

    extractedPage.lines.forEach((line) => {
      const normalizedLine = line.text.toLowerCase();
      cleanTerms.forEach((term) => {
        let offset = 0;
        while (offset < normalizedLine.length) {
          const foundAt = normalizedLine.indexOf(term, offset);
          if (foundAt === -1) break;

          const rect = buildRectForLineMatch(extractedPage, canvas, line, term, foundAt);
          context.fillRect(rect.x, rect.y, rect.width, rect.height);
          matches += 1;
          offset = foundAt + term.length;
        }
      });
    });

    redactedPages.push({
      blob: await canvasToBlob(canvas, "image/png"),
      widthPx: page.widthPx,
      heightPx: page.heightPx,
    });

    options.onProgress?.(70 + Math.round(((index + 1) / rendered.length) * 25));
  }

  const blob = await buildPdfFromImages(redactedPages);
  options.onProgress?.(100);

  return { blob, matches };
}

export async function comparePdfFiles(
  fileA: File,
  fileB: File,
  workerSrc: string,
  options: {
    onProgress?: (progress: number) => void;
  } = {}
): Promise<ComparePdfResult> {
  const extractionA = await extractPdfFile(fileA, workerSrc, {
    onProgress: (progress) => options.onProgress?.(Math.round(progress * 0.45)),
  });
  const extractionB = await extractPdfFile(fileB, workerSrc, {
    onProgress: (progress) => options.onProgress?.(45 + Math.round(progress * 0.45)),
  });

  const pageCount = Math.max(extractionA.pageCount, extractionB.pageCount);
  const pageSummaries: Array<{ pageNumber: number; score: number; left: string; right: string }> = [];
  const differingPages: number[] = [];

  for (let index = 0; index < pageCount; index += 1) {
    const left = extractionA.pages[index]?.text || "";
    const right = extractionB.pages[index]?.text || "";
    const score = similarityScore(left, right);

    if (score < 0.999) {
      differingPages.push(index + 1);
    }

    pageSummaries.push({
      pageNumber: index + 1,
      score,
      left: left.replace(/\s+/g, " ").trim(),
      right: right.replace(/\s+/g, " ").trim(),
    });
  }

  const overallScore = similarityScore(extractionA.text, extractionB.text);
  const html = buildComparisonHtml(fileA, fileB, extractionA, extractionB, overallScore, pageSummaries);
  const text = buildComparisonText(
    fileA,
    fileB,
    extractionA,
    extractionB,
    overallScore,
    differingPages,
    pageSummaries
  );

  options.onProgress?.(100);

  return {
    html,
    text,
    score: overallScore,
    identical: differingPages.length === 0 && extractionA.pageCount === extractionB.pageCount,
    differingPages,
    pageCountA: extractionA.pageCount,
    pageCountB: extractionB.pageCount,
  };
}

export function openPrintWindow(html: string, title: string) {
  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) {
    throw new Error("Allow pop-ups in your browser to open the print preview.");
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.title = title;
  printWindow.document.close();
  printWindow.focus();
}
