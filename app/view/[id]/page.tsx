/* eslint-disable @next/next/no-html-link-for-pages */
import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import { BrandSymbol } from "@/app/components/BrandSymbol";
import { DocumentHeroArt } from "@/app/components/DocumentHeroArt";

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
        <title>{meta.originalName} | OneDocs Viewer</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root{
                color-scheme: light;
                --paper:#f4f8ff;
                --paper-2:#eaf2ff;
                --paper-3:#ffffff;
                --ink:#162340;
                --muted:#68799a;
                --line:rgba(74,98,181,.14);
                --amber:#ffc95a;
                --amber-2:#ff9147;
                --teal:#10c7a2;
                --violet:#6e7cff;
                --shadow:0 28px 60px rgba(34,48,94,.16);
              }
              *{box-sizing:border-box}
              html,body{height:100%}
              body{
                margin:0;
                font-family:"Segoe UI",Arial,sans-serif;
                color:var(--ink);
                background:
                  radial-gradient(circle at top left, rgba(110,124,255,.24), transparent 30%),
                  radial-gradient(circle at top right, rgba(16,199,162,.16), transparent 26%),
                  radial-gradient(circle at bottom right, rgba(255,145,71,.14), transparent 32%),
                  linear-gradient(180deg, #f7f9ff 0%, #edf6ff 100%);
                overflow:hidden;
              }
              .shell{
                min-height:100%;
                display:flex;
                flex-direction:column;
                padding:22px;
                gap:18px;
              }
              .toolbar{
                display:flex;
                align-items:center;
                gap:18px;
                padding:18px 22px;
                border:1px solid var(--line);
                border-radius:28px;
                background:rgba(253,251,248,.82);
                backdrop-filter:blur(18px);
                box-shadow:var(--shadow);
                flex-shrink:0;
              }
              .brand{
                min-width:0;
                display:flex;
                align-items:center;
                gap:14px;
              }
              .brand-mark{
                width:56px;
                height:56px;
                border-radius:50%;
                display:flex;
                align-items:center;
                justify-content:center;
                background:rgba(255,255,255,.82);
                box-shadow:0 18px 32px rgba(34,48,94,.14);
              }
              .brand-copy{
                min-width:0;
              }
              .eyebrow{
                font-size:11px;
                letter-spacing:.22em;
                text-transform:uppercase;
                color:var(--muted);
                font-weight:700;
              }
              .title{
                margin-top:6px;
                font-size:clamp(20px,2vw,28px);
                line-height:1.05;
                font-weight:700;
                white-space:nowrap;
                overflow:hidden;
                text-overflow:ellipsis;
              }
              .meta{
                margin-top:8px;
                display:flex;
                flex-wrap:wrap;
                gap:8px;
              }
              .chip{
                display:inline-flex;
                align-items:center;
                gap:6px;
                padding:8px 12px;
                border-radius:999px;
                border:1px solid var(--line);
                background:rgba(255,255,255,.92);
                color:var(--muted);
                font-size:12px;
                font-weight:600;
              }
              .actions{
                margin-left:auto;
                display:flex;
                flex-wrap:wrap;
                gap:10px;
              }
              .btn{
                display:inline-flex;
                align-items:center;
                justify-content:center;
                gap:8px;
                border-radius:18px;
                padding:12px 18px;
                text-decoration:none;
                font-size:14px;
                font-weight:700;
                transition:transform .18s ease, box-shadow .18s ease, background .18s ease;
                white-space:nowrap;
              }
              .btn-primary{
                color:#fff;
                background:linear-gradient(135deg,var(--amber-2),var(--violet),var(--teal));
                box-shadow:0 18px 30px rgba(54,74,146,.24);
              }
              .btn-secondary{
                color:var(--ink);
                background:rgba(255,255,255,.9);
                border:1px solid var(--line);
              }
              .btn:hover{
                transform:translateY(-1px);
              }
              .viewer-shell{
                min-height:0;
                flex:1;
                display:flex;
                gap:18px;
              }
              .viewer-panel{
                min-width:0;
                flex:1;
                display:flex;
                flex-direction:column;
                border:1px solid var(--line);
                border-radius:30px;
                overflow:hidden;
                background:rgba(253,251,248,.86);
                box-shadow:var(--shadow);
              }
              .viewer-head{
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:12px;
                padding:16px 20px;
                border-bottom:1px solid var(--line);
                background:linear-gradient(180deg, rgba(255,255,255,.88), rgba(248,244,236,.92));
              }
              .viewer-head strong{
                font-size:14px;
              }
              .viewer-head span{
                color:var(--muted);
                font-size:12px;
              }
              .viewer-frame{
                min-height:0;
                flex:1;
                padding:16px;
                background:
                  radial-gradient(circle at top right, rgba(16,199,162,.08), transparent 26%),
                  radial-gradient(circle at bottom left, rgba(110,124,255,.08), transparent 26%),
                  linear-gradient(180deg, #edf4ff 0%, #f8fbff 100%);
              }
              .viewer-frame iframe{
                width:100%;
                height:100%;
                border:none;
                border-radius:22px;
                background:#fff;
                box-shadow:0 18px 40px rgba(28,21,13,.12);
              }
              .side-panel{
                width:320px;
                flex-shrink:0;
                display:flex;
                flex-direction:column;
                gap:14px;
              }
              .card{
                border:1px solid var(--line);
                border-radius:28px;
                background:rgba(255,255,255,.84);
                box-shadow:var(--shadow);
                padding:20px;
              }
              .card h2{
                margin:0;
                font-size:24px;
                line-height:1.05;
              }
              .card p{
                margin:12px 0 0;
                color:var(--muted);
                line-height:1.7;
                font-size:14px;
              }
              .art-card{
                overflow:hidden;
              }
              .art-frame{
                margin:-4px -4px 18px;
                border-radius:24px;
                background:
                  radial-gradient(circle at top left, rgba(110,124,255,.14), transparent 28%),
                  linear-gradient(135deg, rgba(255,255,255,.4), rgba(255,255,255,.08));
                border:1px solid rgba(110,124,255,.14);
                padding:10px;
              }
              .art-frame svg{
                display:block;
                width:100%;
                height:auto;
              }
              .list{
                display:flex;
                flex-direction:column;
                gap:10px;
                margin-top:16px;
              }
              .list-item{
                border:1px solid var(--line);
                border-radius:18px;
                background:#fff;
                padding:14px;
              }
              .list-item strong{
                display:block;
                font-size:13px;
                margin-bottom:4px;
              }
              .list-item span{
                color:var(--muted);
                font-size:13px;
                line-height:1.6;
              }
              .mobile-fallback{
                display:none;
                min-height:0;
                flex:1;
                border:1px solid var(--line);
                border-radius:28px;
                background:rgba(253,251,248,.88);
                box-shadow:var(--shadow);
                padding:28px 22px;
                text-align:center;
                align-items:center;
                justify-content:center;
                flex-direction:column;
              }
              .mobile-fallback .icon{
                width:86px;
                height:86px;
                border-radius:50%;
                display:flex;
                align-items:center;
                justify-content:center;
                background:rgba(255,255,255,.88);
                box-shadow:0 20px 38px rgba(34,48,94,.14);
              }
              .mobile-fallback .icon svg{
                width:52px;
                height:52px;
              }
              .mobile-fallback h2{
                margin:18px 0 0;
                font-size:28px;
                line-height:1.05;
              }
              .mobile-fallback p{
                margin:14px 0 0;
                max-width:360px;
                color:var(--muted);
                line-height:1.7;
                font-size:14px;
              }
              .powered{
                position:fixed;
                right:20px;
                bottom:14px;
                color:rgba(118,106,87,.78);
                font-size:12px;
              }
              .powered a{
                color:inherit;
                text-decoration:none;
              }
              @media (max-width: 1080px){
                body{overflow:auto}
                .shell{padding:16px}
                .viewer-shell{flex-direction:column}
                .side-panel{width:auto}
              }
              @media (max-width: 768px){
                body{overflow:auto}
                .shell{padding:14px}
                .toolbar{
                  flex-direction:column;
                  align-items:flex-start;
                  gap:16px;
                }
                .actions{
                  margin-left:0;
                  width:100%;
                }
                .actions .btn{
                  flex:1;
                }
                .viewer-shell{
                  display:none;
                }
                .mobile-fallback{
                  display:flex;
                }
                .title{
                  white-space:normal;
                }
                .powered{
                  position:static;
                  padding:0 4px 12px;
                }
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
                <BrandSymbol size={48} />
              </div>
              <div className="brand-copy">
                <div className="eyebrow">OneDocs Shared Viewer</div>
                <div className="title">{meta.originalName}</div>
                <div className="meta">
                  <span className="chip">PDF</span>
                  <span className="chip">{sizeMB} MB</span>
                  <span className="chip">Uploaded {uploadDate}</span>
                </div>
              </div>
            </div>
            <div className="actions">
              <a className="btn btn-secondary" href="/">
                Back to OneDocs
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
                  <div>
                    <span>Open, review, and download from one clean surface.</span>
                  </div>
                </div>
                <span>Hosted with OneDocs</span>
              </div>
              <div className="viewer-frame">
                <iframe src={pdfUrl} title={meta.originalName} />
              </div>
            </div>

            <div className="side-panel">
              <div className="card art-card">
                <div className="art-frame">
                  <DocumentHeroArt mode="viewer" />
                </div>
                <div className="eyebrow">Share Experience</div>
                <h2>Professional presentation for shared PDFs.</h2>
                <p>
                  This viewer keeps the file accessible while giving the shared
                  page a calmer, more trustworthy feel for clients and internal
                  stakeholders.
                </p>
              </div>

              <div className="card">
                <div className="eyebrow">What You Can Do</div>
                <div className="list">
                  <div className="list-item">
                    <strong>Review in place</strong>
                    <span>The PDF opens directly inside the page for immediate reading.</span>
                  </div>
                  <div className="list-item">
                    <strong>Download the original</strong>
                    <span>Use the top action to keep the exact uploaded file.</span>
                  </div>
                  <div className="list-item">
                    <strong>Share confidently</strong>
                    <span>The page now looks aligned with the rest of the OneDocs product.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mobile-fallback">
            <div className="icon">
              <BrandSymbol size={52} />
            </div>
            <h2>{meta.originalName}</h2>
            <p>
              {sizeMB} MB · Uploaded {uploadDate}. Open the document in a new
              tab or download the original file below.
            </p>
            <div
              style={{
                display: "flex",
                width: "100%",
                maxWidth: "360px",
                gap: "10px",
                flexWrap: "wrap",
                justifyContent: "center",
                marginTop: "22px",
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
            Powered by <a href="/">OneDocs</a>
          </div>
        </div>
      </body>
    </html>
  );
}
