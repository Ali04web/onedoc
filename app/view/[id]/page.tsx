import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export default async function ViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let meta: any;
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
        <title>{meta.originalName} — OneDocs Viewer</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          *{margin:0;padding:0;box-sizing:border-box}
          html,body{height:100%;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}
          body{background:#0f0f1a;color:#fff;display:flex;flex-direction:column}
          .toolbar{display:flex;align-items:center;gap:14px;padding:12px 24px;background:linear-gradient(135deg,#16213e 0%,#1a1a2e 100%);border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0;z-index:10}
          .logo{font-weight:800;font-size:20px;letter-spacing:-0.5px;white-space:nowrap}
          .logo span{background:linear-gradient(135deg,#c07818,#e8a040);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
          .file-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
          .file-name{font-size:14px;font-weight:600;color:rgba(255,255,255,.9);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
          .file-meta{font-size:11px;color:rgba(255,255,255,.4);display:flex;gap:8px;align-items:center}
          .badge{font-size:10px;padding:3px 10px;border-radius:4px;background:linear-gradient(135deg,#c07818,#a06010);color:#fff;font-weight:700;letter-spacing:0.5px;text-transform:uppercase}
          .dl-btn{font-size:13px;padding:8px 18px;border-radius:8px;background:rgba(255,255,255,.06);color:#fff;border:1px solid rgba(255,255,255,.12);cursor:pointer;text-decoration:none;transition:all .2s;display:flex;align-items:center;gap:6px;font-weight:500;white-space:nowrap}
          .dl-btn:hover{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.2);transform:translateY(-1px)}
          .dl-btn svg{width:16px;height:16px}
          .viewer{flex:1;display:flex;position:relative;background:#2a2a3a}
          .viewer iframe,.viewer embed{width:100%;height:100%;border:none}
          .mobile-fallback{display:none;flex:1;flex-direction:column;align-items:center;justify-content:center;gap:20px;padding:40px;text-align:center;background:linear-gradient(180deg,#0f0f1a,#1a1a2e)}
          .mobile-fallback .icon{font-size:64px;margin-bottom:8px}
          .mobile-fallback h2{font-size:22px;font-weight:700;color:#fff}
          .mobile-fallback p{color:rgba(255,255,255,.5);font-size:14px;max-width:380px;line-height:1.7}
          .mobile-fallback .open-btn{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;background:linear-gradient(135deg,#c07818,#e8a040);color:#fff;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;transition:all .2s;box-shadow:0 4px 16px rgba(192,120,24,.3)}
          .mobile-fallback .open-btn:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(192,120,24,.4)}
          .powered{position:fixed;bottom:12px;right:16px;font-size:11px;color:rgba(255,255,255,.25);z-index:20}
          .powered a{color:rgba(255,255,255,.4);text-decoration:none}
          .powered a:hover{color:rgba(255,255,255,.6)}
          @media(max-width:768px){
            .toolbar{padding:10px 14px;gap:10px}
            .logo{font-size:16px}
            .badge{display:none}
            .file-name{font-size:13px}
            .dl-btn span{display:none}
            .dl-btn{padding:8px 12px}
            .viewer iframe,.viewer embed{display:none}
            .mobile-fallback{display:flex}
          }
        `,
          }}
        />
      </head>
      <body>
        <div className="toolbar">
          <div className="logo">
            One<span>Docs</span>
          </div>
          <div className="file-info">
            <div className="file-name">{meta.originalName}</div>
            <div className="file-meta">
              <span>{sizeMB} MB</span>
              <span>·</span>
              <span>{uploadDate}</span>
            </div>
          </div>
          <div className="badge">PDF</div>
          <a className="dl-btn" href={pdfUrl} download={meta.originalName}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download</span>
          </a>
        </div>
        <div className="viewer">
          <iframe src={pdfUrl} title={meta.originalName} />
        </div>
        <div className="mobile-fallback">
          <div className="icon">📄</div>
          <h2>{meta.originalName}</h2>
          <p>
            {sizeMB} MB · Uploaded {uploadDate}
          </p>
          <a className="open-btn" href={pdfUrl} target="_blank" rel="noopener">
            📄 Open PDF
          </a>
          <a
            className="dl-btn"
            href={pdfUrl}
            download={meta.originalName}
            style={{ marginTop: "8px" }}
          >
            ⬇ Download
          </a>
        </div>
        <div className="powered">
          Powered by <a href="/">OneDocs</a>
        </div>
      </body>
    </html>
  );
}
