import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const MAX_HTML_CHARS = 2_500_000;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeHtml(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, "")
    .replace(/<embed\b[^>]*>/gi, "")
    .replace(/<meta[^>]+http-equiv=["']refresh["'][^>]*>/gi, "");
}

function extractTitle(html: string, fallback: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = match?.[1]?.replace(/\s+/g, " ").trim();
  return title || fallback;
}

function extractBody(html: string) {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match?.[1] || html;
}

function buildPrintableHtml(url: string, title: string, body: string) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <base href="${escapeHtml(url)}" />
  <style>
    :root {
      color-scheme: light;
    }
    * {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #111111;
      font-family: "Segoe UI", Arial, sans-serif;
      line-height: 1.6;
    }
    body {
      padding: 32px;
      max-width: 960px;
      margin: 0 auto;
    }
    img, svg, video, canvas, iframe {
      max-width: 100%;
      height: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    pre, code {
      white-space: pre-wrap;
      word-break: break-word;
    }
    a {
      color: #1a56db;
      text-decoration: none;
    }
    @page {
      size: A4;
      margin: 14mm;
    }
    @media print {
      body {
        max-width: none;
        padding: 0;
      }
      a[href]::after {
        content: " (" attr(href) ")";
        font-size: 10px;
        color: #666666;
      }
    }
  </style>
</head>
<body>
${body}
<script>
  window.addEventListener("load", function () {
    setTimeout(function () {
      window.print();
    }, 350);
  });
</script>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const url = typeof payload?.url === "string" ? payload.url.trim() : "";

    if (!url) {
      return Response.json({ error: "Enter a valid webpage URL." }, { status: 400 });
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return Response.json({ error: "The webpage URL is invalid." }, { status: 400 });
    }

    if (!["http:", "https:"].includes(targetUrl.protocol)) {
      return Response.json({ error: "Only http and https URLs are supported." }, { status: 400 });
    }

    const response = await fetch(targetUrl.toString(), {
      headers: {
        "user-agent": "Mozilla/5.0 OneDoc Webpage Capture",
        accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      return Response.json(
        { error: `Could not fetch the webpage. Received ${response.status}.` },
        { status: 502 }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return Response.json(
        { error: "That URL did not return an HTML webpage." },
        { status: 400 }
      );
    }

    let html = await response.text();
    if (html.length > MAX_HTML_CHARS) {
      html = html.slice(0, MAX_HTML_CHARS);
    }

    const title = extractTitle(html, targetUrl.hostname);
    const sanitizedBody = sanitizeHtml(extractBody(html));

    return Response.json({
      title,
      html: buildPrintableHtml(targetUrl.toString(), title, sanitizedBody),
    });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Failed to prepare the webpage for PDF export." },
      { status: 500 }
    );
  }
}
