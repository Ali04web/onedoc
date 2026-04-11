/* eslint-disable @next/next/no-html-link-for-pages */
import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import { BrandSymbol } from "@/app/components/BrandSymbol";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

type UploadMeta = {
  originalName: string;
  storedName: string;
  size: number;
  uploadedAt: string;
};

export default async function ViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let meta: UploadMeta;
  try {
    const metaRaw = await fs.readFile(
      path.join(UPLOAD_DIR, `${id}.json`),
      "utf-8"
    );
    meta = JSON.parse(metaRaw);
  } catch {
    notFound();
  }

  const pdfUrl = `/uploads/${meta.storedName}`;
  const sizeMB = (meta.size / 1048576).toFixed(1);
  const uploadDate = new Date(meta.uploadedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>{meta.originalName} | OneDoc Viewer</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              :root{
                color-scheme: dark;
              }
              *{box-sizing:border-box}
              html,body{height:100%}
              body{
                margin:0;
                font-family:'Inter',system-ui,sans-serif;
                color:#e4e4ef;
                background-color:#0a0a0f;
                overflow:hidden;
              }
              body::before{
                content:"";
                position:fixed;
                top:-40%;left:-20%;
                width:80%;height:80%;
                border-radius:50%;
                background:radial-gradient(circle,rgba(124,106,255,0.06) 0%,transparent 70%);
                pointer-events:none;
              }
              .shell{
                min-height:100%;
                display:flex;
                flex-direction:column;
                padding:16px;
                gap:14px;
              }
              .toolbar{
                display:flex;
                align-items:center;
                gap:14px;
                padding:14px 18px;
                border:1px solid rgba(255,255,255,0.06);
                border-radius:20px;
                background:rgba(255,255,255,0.025);
                backdrop-filter:blur(24px);
                flex-shrink:0;
              }
              .brand{
                min-width:0;
                display:flex;
                align-items:center;
                gap:12px;
              }
              .brand-mark{
                width:42px;height:42px;
                border-radius:14px;
                display:flex;align-items:center;justify-content:center;
                background:rgba(255,255,255,0.04);
                border:1px solid rgba(255,255,255,0.06);
              }
              .brand-copy{min-width:0}
              .eyebrow{
                font-size:10px;
                letter-spacing:.18em;
                text-transform:uppercase;
                color:#6b6d80;
                font-weight:600;
              }
              .title{
                margin-top:4px;
                font-size:clamp(16px,2vw,22px);
                line-height:1.1;
                font-weight:700;
                color:#fff;
                white-space:nowrap;
                overflow:hidden;
                text-overflow:ellipsis;
              }
              .meta{
                margin-top:6px;
                display:flex;flex-wrap:wrap;gap:6px;
              }
              .chip{
                display:inline-flex;align-items:center;gap:4px;
                padding:4px 10px;border-radius:999px;
                border:1px solid rgba(124,106,255,0.12);
                background:rgba(124,106,255,0.08);
                color:#a78bfa;font-size:11px;font-weight:600;
              }
              .actions{
                margin-left:auto;
                display:flex;flex-wrap:wrap;gap:8px;
              }
              .btn{
                display:inline-flex;align-items:center;justify-content:center;
                gap:6px;border-radius:14px;padding:10px 16px;
                text-decoration:none;font-size:13px;font-weight:700;
                transition:transform .18s ease,box-shadow .18s ease;
                white-space:nowrap;border:none;
              }
              .btn-primary{
                color:#fff;
                background:linear-gradient(135deg,#7c6aff,#5b4bcf);
                box-shadow:0 8px 24px rgba(124,106,255,0.25);
              }
              .btn-secondary{
                color:#e4e4ef;
                background:rgba(255,255,255,0.04);
                border:1px solid rgba(255,255,255,0.06);
              }
              .btn:hover{transform:translateY(-1px)}
              .viewer-shell{
                min-height:0;flex:1;display:flex;gap:14px;
              }
              .viewer-panel{
                min-width:0;flex:1;display:flex;flex-direction:column;
                border:1px solid rgba(255,255,255,0.06);
                border-radius:20px;overflow:hidden;
                background:rgba(255,255,255,0.025);
                backdrop-filter:blur(16px);
              }
              .viewer-head{
                display:flex;align-items:center;justify-content:space-between;
                gap:10px;padding:12px 16px;
                border-bottom:1px solid rgba(255,255,255,0.04);
                background:rgba(255,255,255,0.02);
              }
              .viewer-head strong{font-size:13px;color:#fff}
              .viewer-head span{color:#6b6d80;font-size:11px}
              .viewer-frame{
                min-height:0;flex:1;padding:12px;
                background:rgba(255,255,255,0.01);
              }
              .viewer-frame iframe{
                width:100%;height:100%;border:none;
                border-radius:14px;background:#1a1a26;
                box-shadow:0 12px 32px rgba(0,0,0,0.3);
              }
              .side-panel{
                width:300px;flex-shrink:0;
                display:flex;flex-direction:column;gap:12px;
              }
              .card{
                border:1px solid rgba(255,255,255,0.06);
                border-radius:20px;
                background:rgba(255,255,255,0.025);
                backdrop-filter:blur(16px);
                padding:18px;
              }
              .card h2{margin:0;font-size:18px;line-height:1.1;color:#fff}
              .card p{margin:10px 0 0;color:#6b6d80;line-height:1.6;font-size:13px}
              .list{display:flex;flex-direction:column;gap:8px;margin-top:14px}
              .list-item{
                border:1px solid rgba(255,255,255,0.06);
                border-radius:14px;background:rgba(255,255,255,0.02);padding:12px;
              }
              .list-item strong{display:block;font-size:12px;color:#fff;margin-bottom:4px}
              .list-item span{color:#6b6d80;font-size:12px;line-height:1.6}
              .mobile-fallback{
                display:none;min-height:0;flex:1;
                border:1px solid rgba(255,255,255,0.06);
                border-radius:20px;background:rgba(255,255,255,0.025);
                backdrop-filter:blur(16px);
                padding:24px 18px;text-align:center;
                align-items:center;justify-content:center;flex-direction:column;
              }
              .mobile-fallback .icon{
                width:72px;height:72px;border-radius:20px;
                display:flex;align-items:center;justify-content:center;
                background:rgba(255,255,255,0.04);
                border:1px solid rgba(255,255,255,0.06);
              }
              .mobile-fallback h2{margin:14px 0 0;font-size:22px;color:#fff}
              .mobile-fallback p{margin:10px 0 0;max-width:320px;color:#6b6d80;line-height:1.6;font-size:13px}
              .powered{
                position:fixed;right:16px;bottom:12px;
                color:rgba(107,109,128,0.6);font-size:11px;
              }
              .powered a{color:inherit;text-decoration:none}
              @media (max-width: 1080px){
                body{overflow:auto}
                .shell{padding:12px}
                .viewer-shell{flex-direction:column}
                .side-panel{width:auto}
              }
              @media (max-width: 768px){
                body{overflow:auto}
                .shell{padding:10px}
                .toolbar{flex-direction:column;align-items:flex-start;gap:12px}
                .actions{margin-left:0;width:100%}
                .actions .btn{flex:1}
                .viewer-shell{display:none}
                .mobile-fallback{display:flex}
                .title{white-space:normal}
                .powered{position:static;padding:0 4px 10px}
              }
            `,
          }}
        />
      </head>
      <body>
        <div className="shell">
          <div className="toolbar">
            <div className="brand">
              <div className="brand-mark">
                <BrandSymbol size={32} />
              </div>
              <div className="brand-copy">
                <div className="eyebrow">OneDoc Shared Viewer</div>
                <div className="title">{meta.originalName}</div>
                <div className="meta">
                  <span className="chip">PDF</span>
                  <span className="chip">{sizeMB} MB</span>
                  <span className="chip">{uploadDate}</span>
                </div>
              </div>
            </div>
            <div className="actions">
              <a className="btn btn-secondary" href="/">
                Back to OneDoc
              </a>
              <a className="btn btn-primary" href={pdfUrl} download={meta.originalName}>
                Download PDF
              </a>
            </div>
          </div>

          <div className="viewer-shell">
            <div className="viewer-panel">
              <div className="viewer-head">
                <div>
                  <strong>Live document view</strong>
                </div>
                <span>OneDoc</span>
              </div>
              <div className="viewer-frame">
                <iframe src={pdfUrl} title={meta.originalName} />
              </div>
            </div>

            <div className="side-panel">
              <div className="card">
                <div className="eyebrow">Share Experience</div>
                <h2>Professional PDF viewer</h2>
                <p>
                  Clean, trustworthy presentation for shared documents.
                </p>
              </div>

              <div className="card">
                <div className="eyebrow">Actions</div>
                <div className="list">
                  <div className="list-item">
                    <strong>Review in place</strong>
                    <span>PDF opens directly in the page.</span>
                  </div>
                  <div className="list-item">
                    <strong>Download original</strong>
                    <span>Get the exact uploaded file.</span>
                  </div>
                  <div className="list-item">
                    <strong>Share link</strong>
                    <span>Anyone with the URL can view.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mobile-fallback">
            <div className="icon">
              <BrandSymbol size={42} />
            </div>
            <h2>{meta.originalName}</h2>
            <p>
              {sizeMB} MB · {uploadDate}
            </p>
            <div
              style={{
                display: "flex",
                width: "100%",
                maxWidth: "320px",
                gap: "8px",
                flexWrap: "wrap",
                justifyContent: "center",
                marginTop: "18px",
              }}
            >
              <a className="btn btn-primary" href={pdfUrl} target="_blank" rel="noopener">
                Open PDF
              </a>
              <a className="btn btn-secondary" href={pdfUrl} download={meta.originalName}>
                Download
              </a>
            </div>
          </div>

          <div className="powered">
            Powered by <a href="/">OneDoc</a>
          </div>
        </div>
      </body>
    </html>
  );
}
