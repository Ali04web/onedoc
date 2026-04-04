"use client";

type MammothImageLike = {
  contentType: string;
  read(format: string): Promise<string>;
};

type MammothResultLike = {
  value: string;
};

export interface MammothLike {
  convertToHtml(
    input: { arrayBuffer: ArrayBuffer },
    options?: unknown
  ): Promise<MammothResultLike>;
  extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<MammothResultLike>;
  images?: {
    imgElement(
      handler: (image: MammothImageLike) => Promise<{ src: string }>
    ): unknown;
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeMarkdown(text: string): string {
  return text
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function inlineImageOptions(mammoth: MammothLike): unknown {
  if (!mammoth.images) return undefined;

  return {
    convertImage: mammoth.images.imgElement(async (image) => ({
      src: `data:${image.contentType};base64,${await image.read("base64")}`,
    })),
  };
}

export async function convertDocxToRichHtml(
  mammoth: MammothLike,
  arrayBuffer: ArrayBuffer
): Promise<string> {
  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    inlineImageOptions(mammoth)
  );
  return result.value;
}

export function buildStandaloneHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      color-scheme: light;
      --page: #fdfbf8;
      --page-2: #f5eee1;
      --ink: #1e1911;
      --muted: #766a57;
      --line: rgba(36, 28, 18, 0.12);
      --soft: #fff;
      --accent: #275f5a;
      --amber: #b48a4b;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background:
        radial-gradient(circle at top left, rgba(180, 138, 75, 0.18), transparent 28%),
        radial-gradient(circle at bottom right, rgba(39, 95, 90, 0.14), transparent 32%),
        linear-gradient(180deg, #faf7f1 0%, #f3ede1 100%);
      color: var(--ink);
      font-family: "Segoe UI", Arial, sans-serif;
    }
    main {
      width: min(900px, calc(100vw - 32px));
      margin: 32px auto;
      background: var(--page);
      border: 1px solid var(--line);
      border-radius: 28px;
      box-shadow: 0 28px 70px rgba(28, 21, 13, 0.12);
      overflow: hidden;
    }
    header {
      padding: 30px 34px 22px;
      border-bottom: 1px solid var(--line);
      background:
        radial-gradient(circle at top right, rgba(39, 95, 90, 0.1), transparent 28%),
        linear-gradient(135deg, rgba(180, 138, 75, 0.14), rgba(255, 255, 255, 0.94));
    }
    header h1 {
      margin: 0;
      font-size: clamp(26px, 3vw, 40px);
      line-height: 1.04;
      letter-spacing: -0.03em;
      font-family: Georgia, "Times New Roman", serif;
    }
    header p {
      margin: 12px 0 0;
      color: var(--muted);
      font-size: 14px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-weight: 700;
    }
    article {
      padding: 36px 34px;
      line-height: 1.8;
      font-size: 16px;
    }
    article h1, article h2, article h3, article h4 {
      line-height: 1.15;
      margin-top: 1.8em;
      margin-bottom: 0.5em;
      font-family: Georgia, "Times New Roman", serif;
      letter-spacing: -0.02em;
    }
    article p, article ul, article ol, article table, article blockquote {
      margin: 0 0 1em;
    }
    article img {
      max-width: 100%;
      height: auto;
      border-radius: 18px;
      border: 1px solid var(--line);
      display: block;
      margin: 18px auto;
      background: var(--soft);
      box-shadow: 0 18px 40px rgba(28, 21, 13, 0.08);
    }
    article table {
      width: 100%;
      border-collapse: collapse;
      background: var(--page);
      border: 1px solid var(--line);
      border-radius: 18px;
      overflow: hidden;
    }
    article th, article td {
      border: 1px solid var(--line);
      padding: 12px 14px;
      text-align: left;
      vertical-align: top;
    }
    article th {
      background: rgba(245, 238, 225, 0.82);
      font-weight: 700;
    }
    article blockquote {
      margin-left: 0;
      padding: 16px 18px;
      border-left: 4px solid var(--amber);
      background: rgba(180, 138, 75, 0.08);
      color: var(--ink);
      border-radius: 0 18px 18px 0;
    }
    article code {
      background: rgba(245, 238, 225, 0.9);
      padding: 2px 6px;
      border-radius: 6px;
      font-family: "JetBrains Mono", Consolas, monospace;
      font-size: 0.92em;
    }
    article pre {
      background: #1d211f;
      color: #eef3f1;
      padding: 18px;
      border-radius: 18px;
      overflow: auto;
      box-shadow: 0 20px 36px rgba(28, 21, 13, 0.12);
    }
    @media print {
      body { background: #fff; }
      main { width: 100%; margin: 0; border: none; box-shadow: none; border-radius: 0; }
      header { break-after: avoid; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>${escapeHtml(title)}</h1>
      <p>Generated by OneDocs</p>
    </header>
    <article>${bodyHtml}</article>
  </main>
</body>
</html>`;
}

function tableToMarkdown(table: HTMLTableElement): string {
  const rows = Array.from(table.querySelectorAll("tr")).map((row) =>
    Array.from(row.children).map((cell) =>
      normalizeMarkdown(cell.textContent || "").replace(/\|/g, "\\|")
    )
  );

  if (!rows.length) return "";

  const header = rows[0];
  const body = rows.slice(1);
  const separator = header.map(() => "---");
  const lines = [
    `| ${header.join(" | ")} |`,
    `| ${separator.join(" | ")} |`,
    ...body.map((row) => `| ${row.join(" | ")} |`),
  ];

  return lines.join("\n") + "\n\n";
}

function nodeToMarkdown(node: ChildNode): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || "";
  }

  if (!(node instanceof HTMLElement)) {
    return "";
  }

  const tag = node.tagName.toLowerCase();
  const childText = Array.from(node.childNodes).map(nodeToMarkdown).join("");

  if (tag === "br") return "\n";
  if (tag === "strong" || tag === "b") return `**${childText.trim()}**`;
  if (tag === "em" || tag === "i") return `*${childText.trim()}*`;
  if (tag === "code") return `\`${childText.trim()}\``;
  if (tag === "a") {
    const href = node.getAttribute("href");
    return href ? `[${childText.trim() || href}](${href})` : childText;
  }
  if (tag === "h1") return `# ${normalizeMarkdown(childText)}\n\n`;
  if (tag === "h2") return `## ${normalizeMarkdown(childText)}\n\n`;
  if (tag === "h3") return `### ${normalizeMarkdown(childText)}\n\n`;
  if (tag === "h4") return `#### ${normalizeMarkdown(childText)}\n\n`;
  if (tag === "blockquote") {
    return (
      childText
        .trim()
        .split("\n")
        .map((line) => `> ${line}`.trimEnd())
        .join("\n") + "\n\n"
    );
  }
  if (tag === "ul") {
    const items = Array.from(node.children).map((child) =>
      `- ${normalizeMarkdown(child.textContent || "")}`.trimEnd()
    );
    return items.join("\n") + "\n\n";
  }
  if (tag === "ol") {
    const items = Array.from(node.children).map((child, index) =>
      `${index + 1}. ${normalizeMarkdown(child.textContent || "")}`.trimEnd()
    );
    return items.join("\n") + "\n\n";
  }
  if (tag === "table") {
    return tableToMarkdown(node as HTMLTableElement);
  }
  if (tag === "img") {
    const src = node.getAttribute("src");
    const alt = node.getAttribute("alt") || "Image";
    return src ? `![${alt}](${src})\n\n` : "";
  }
  if (tag === "p") {
    return `${normalizeMarkdown(childText)}\n\n`;
  }
  if (tag === "li") {
    return `${normalizeMarkdown(childText)}\n`;
  }

  return childText;
}

export function htmlToMarkdown(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const markdown = Array.from(doc.body.childNodes).map(nodeToMarkdown).join("");
  return normalizeMarkdown(markdown);
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (insideQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === "," && !insideQuotes) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(cell.trim());
      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell.trim());
  if (row.some((value) => value.length > 0)) {
    rows.push(row);
  }

  return rows;
}

export function openPrintPreviewWindow(title: string): Window {
  const preview = window.open("", "_blank", "noopener,noreferrer");
  if (!preview) {
    throw new Error("Your browser blocked the preview window. Please allow pop-ups and try again.");
  }

  preview.document.write(`<!DOCTYPE html><html><head><title>${escapeHtml(
    title
  )}</title><style>body{margin:0;font-family:Segoe UI,Arial,sans-serif;padding:32px;color:#1e1911;background:radial-gradient(circle at top left, rgba(180,138,75,.18), transparent 28%),linear-gradient(180deg,#faf7f1 0%,#f3ede1 100%)} .status{max-width:560px;margin:12vh auto;border:1px solid rgba(36,28,18,.12);border-radius:28px;padding:28px;background:rgba(253,251,248,.92);box-shadow:0 28px 70px rgba(28,21,13,.12)} .eyebrow{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#766a57;font-weight:700} h1{margin:12px 0 12px;font-size:34px;line-height:1.04;letter-spacing:-.03em;font-family:Georgia,'Times New Roman',serif} p{margin:0;color:#766a57;line-height:1.8}</style></head><body><div class="status"><div class="eyebrow">OneDocs Preview</div><h1>Preparing your document...</h1><p>OneDocs is building a print-ready preview with the original formatting preserved as closely as possible.</p></div></body></html>`);
  preview.document.close();
  return preview;
}
