"use client";

import React, { useState, useCallback, useRef } from "react";
import { Tip, Toast } from "@/app/components/DocLensUI";
import { Emoji } from "@/app/components/Icons";

interface UploadedFile {
  id: string;
  url: string;
  fileName: string;
  size: number;
  uploadedAt?: string;
}

export default function PdfLinkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [recentLinks, setRecentLinks] = useState<UploadedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string) => setToast(msg), []);

  function handleFile(f: File) {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are allowed");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError("File too large — max 20 MB");
      return;
    }
    setFile(f);
    setError(null);
    setUploaded(null);
  }

  async function upload() {
    if (!file) return;
    setUploading(true);
    setProgress(10);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setProgress(30);

      const res = await fetch("/api/pdf-link", {
        method: "POST",
        body: formData,
      });

      setProgress(80);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setProgress(100);
      const result: UploadedFile = {
        id: data.id,
        url: data.url,
        fileName: data.fileName,
        size: data.size,
      };
      setUploaded(result);
      setRecentLinks((prev) => [result, ...prev].slice(0, 10));
      showToast("PDF link created successfully!");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  function copyLink() {
    if (!uploaded) return;
    navigator.clipboard.writeText(uploaded.url);
    setCopied(true);
    showToast("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() {
    setFile(null);
    setUploaded(null);
    setError(null);
    setProgress(0);
    setCopied(false);
  }

  const fmtSize = (b: number) =>
    b < 1024
      ? b + " B"
      : b < 1048576
        ? (b / 1024).toFixed(1) + " KB"
        : (b / 1048576).toFixed(1) + " MB";

  return (
    <div className="flex-1 overflow-y-auto w-full">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center py-16 md:py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-block animate-slide-down mb-6 bg-paper2 p-4 rounded-2xl shadow-sm border border-paper3 relative">
            <Emoji symbol="🔗" size={48} className="text-amber" />
            <div className="absolute -top-3 -right-6 bg-teal text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-md">Beta</div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-ink mb-4 max-w-2xl tracking-tight">
            PDF to <span className="text-amber bg-clip-text text-transparent bg-gradient-to-r from-amber to-amber2 cursor-default">Link</span>
          </h1>
          <p className="text-base md:text-lg text-ink3 max-w-[500px] leading-relaxed mb-6">
            Upload your PDF and get an instant shareable link.
            Anyone with the link can view and download it.
          </p>
          <div className="flex items-center gap-3 text-[13px] font-medium text-ink4">
            <span className="py-1 px-3 bg-teal/10 text-teal rounded-full font-bold uppercase tracking-wide">
              Free
            </span>
            <span>&bull;</span>
            <span>Max 20 MB</span>
            <span>&bull;</span>
            <span>No sign-up</span>
          </div>
        </div>
      </section>

      {/* Upload Card */}
      <section className="px-6 md:px-10 lg:px-20 pb-16 max-w-3xl mx-auto w-full">
        {!uploaded ? (
          <div className="bg-paper2 border border-paper3 shadow-sm rounded-2xl p-6 md:p-10 transition-all">
            {/* Drop zone */}
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                const f = e.dataTransfer.files[0];
                if (f) handleFile(f);
              }}
              className={`flex flex-col items-center justify-center py-12 md:py-16 px-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 text-center ${
                drag
                  ? "border-amber bg-amber/5 scale-[1.02]"
                  : file
                    ? "border-amber bg-amber/5"
                    : "border-paper3 bg-paper hover:border-amber/50 hover:bg-paper3/50"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />

              {file ? (
                <div className="animate-fade-up flex flex-col items-center">
                  <div className="mb-4 bg-paper p-4 rounded-full border border-paper3 shadow-sm"><Emoji symbol="📄" size={36} className="text-amber" /></div>
                  <div className="text-lg font-bold text-ink mb-1 truncate max-w-[250px] sm:max-w-[400px]">
                    {file.name}
                  </div>
                  <div className="text-sm font-medium text-ink4">
                    {fmtSize(file.size)}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      reset();
                    }}
                    className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-red py-1.5 px-3 rounded-md hover:bg-red/10 transition-colors"
                  >
                    <Emoji symbol="✕" size={14} /> Remove
                  </button>
                </div>
              ) : (
                <div className="animate-fade-up flex flex-col items-center">
                  <div className="mb-4 bg-paper p-4 rounded-full border border-paper3 shadow-sm"><Emoji symbol="📂" size={36} className="text-ink3" /></div>
                  <div className="text-xl font-bold text-ink mb-2">
                    Drop your PDF here
                  </div>
                  <div className="text-sm font-medium text-ink4">
                    or click to browse &bull; up to 20 MB
                  </div>
                </div>
              )}
            </label>

            {/* Error */}
            {error && (
              <div className="mt-5 py-3 px-4 bg-red/10 border border-red/20 rounded-lg text-sm font-medium text-red flex items-center gap-2 animate-slide-down">
                <Emoji symbol="✕" size={16} /> {error}
              </div>
            )}

            {/* Progress bar */}
            {uploading && (
              <div className="mt-6 h-2 bg-paper3 rounded-full overflow-hidden border border-paper3">
                <div
                  className="h-full bg-gradient-to-r from-amber to-amber2 transition-all duration-300 rounded-full w-full"
                  style={{ transform: `translateX(-${100 - progress}%)` }}
                />
              </div>
            )}

            {/* Upload button */}
            <Tip tip="Upload your PDF to generate a shareable link" side="bottom">
              <button
                onClick={upload}
                disabled={!file || uploading}
                className={`mt-6 w-full flex items-center justify-center gap-3 py-3.5 px-6 text-[15px] font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                  !file || uploading
                    ? "bg-paper3 text-ink4 cursor-not-allowed opacity-60"
                    : "bg-amber hover:bg-amber2 text-white shadow-sm hover:shadow hover:-translate-y-0.5 border border-amber2"
                }`}
              >
                <Emoji symbol={uploading ? "⏳" : "🔗"} size={20} />
                {uploading ? "Uploading..." : "Generate Shareable Link"}
              </button>
            </Tip>
          </div>
        ) : (
          /* Success card */
          <div className="bg-paper2 border border-teal/30 rounded-2xl p-6 md:p-10 shadow-sm transition-all text-center flex flex-col items-center">
            <div className="mb-5 bg-teal/10 p-4 rounded-full"><Emoji symbol="✅" size={40} className="text-teal" /></div>
            <div className="text-3xl font-bold text-teal mb-2">
              Your link is ready!
            </div>
            <div className="text-[15px] text-ink3 mb-8">
              Anyone with this link can view and download your PDF
            </div>

            {/* Link display */}
            <div className="flex w-full items-stretch gap-2 mb-8 bg-paper p-1 rounded-xl border border-paper3 shadow-inner">
              <div className="flex-1 rounded-lg py-3 px-4 font-mono text-sm font-medium text-ink2 overflow-hidden text-ellipsis whitespace-nowrap select-all text-left flex items-center">
                {uploaded.url}
              </div>
              <Tip tip={copied ? "Copied!" : "Copy link to clipboard"}>
                <button
                  onClick={copyLink}
                  className={`py-2 px-6 rounded-lg text-sm font-bold transition-all duration-150 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
                    copied
                      ? "bg-teal text-white shadow-sm"
                      : "bg-amber hover:bg-amber2 text-white shadow-sm hover:shadow"
                  }`}
                >
                  <Emoji symbol={copied ? "✓" : "📋"} size={16} /> {copied ? "Copied" : "Copy"}
                </button>
              </Tip>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap justify-center gap-3 mb-8 w-full">
              <Tip tip="Open the viewer page in a new tab" side="bottom">
                <a
                  href={uploaded.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[200px] flex justify-center items-center gap-2 py-3 px-5 rounded-lg text-[15px] font-semibold text-ink2 bg-paper border border-paper3 hover:bg-paper3 transition-all duration-200 no-underline cursor-pointer"
                >
                  <Emoji symbol="↗" size={16} className="text-amber" /> Open Viewer
                </a>
              </Tip>
              <Tip tip="Upload a different PDF" side="bottom">
                <button
                  onClick={reset}
                  className="flex-1 min-w-[200px] flex justify-center items-center gap-2 py-3 px-5 rounded-lg text-[15px] font-semibold text-ink2 bg-paper border border-paper3 hover:bg-paper3 transition-all duration-200 cursor-pointer"
                >
                  <Emoji symbol="📂" size={16} className="text-amber" /> Upload Another
                </button>
              </Tip>
            </div>

            {/* File info */}
            <div className="flex items-center w-full gap-4 p-4 bg-teal/5 border border-teal/20 rounded-xl text-left">
              <Emoji symbol="📄" size={24} className="text-teal hidden sm:block" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-ink2 overflow-hidden text-ellipsis whitespace-nowrap">
                  {uploaded.fileName}
                </div>
                <div className="text-[11px] font-medium text-ink4 uppercase tracking-wide mt-0.5">
                  {fmtSize(uploaded.size)} &bull; ID: {uploaded.id}
                </div>
              </div>
              <span className="text-[10px] font-bold py-1 px-2.5 rounded bg-teal text-white uppercase tracking-wider">
                LIVE
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Recent links */}
      {recentLinks.length > 0 && (
        <section className="px-6 md:px-10 lg:px-20 pb-12 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-4 mb-6">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-paper2 border border-paper3"><Emoji symbol="🕐" size={16} /></div>
            <div className="text-xl font-bold text-ink">
              Recent Links
            </div>
            <div className="flex-1 border-t border-paper3 mt-1" />
          </div>
          <div className="flex flex-col gap-3">
            {recentLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-4 p-3 bg-paper border border-paper3 rounded-xl hover:bg-paper2 transition-colors group"
              >
                <div className="p-2 bg-paper3 rounded-lg"><Emoji symbol="📄" size={16} /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-ink2 overflow-hidden text-ellipsis whitespace-nowrap">
                    {link.fileName}
                  </div>
                  <div className="text-xs font-medium text-ink4 mt-1">
                    {fmtSize(link.size)}
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(link.url);
                    showToast("Link copied!");
                  }}
                  className="text-xs font-semibold text-amber bg-amber/10 hover:bg-amber/20 py-1.5 px-3 rounded-md cursor-pointer transition-colors duration-150 flex items-center gap-1.5"
                >
                  <Emoji symbol="📋" size={14} /> Copy
                </button>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener"
                  className="text-xs flex items-center justify-center w-8 h-8 font-semibold text-ink3 hover:text-amber bg-paper3 hover:bg-amber/10 rounded-md no-underline cursor-pointer transition-colors duration-150"
                  aria-label="Open in new tab"
                >
                  <Emoji symbol="↗" size={14} />
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="px-6 md:px-10 lg:px-20 pb-16 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-paper2 border border-paper3"><Emoji symbol="💡" size={20} className="text-amber" /></div>
          <div className="text-2xl font-bold text-ink">
            How it works
          </div>
          <div className="flex-1 border-t border-paper3 mt-1" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              step: "1",
              icon: "📂",
              title: "Upload",
              desc: "Drop or select your PDF file (up to 20 MB)",
            },
            {
              step: "2",
              icon: "🔗",
              title: "Get Link",
              desc: "Instant shareable URL is generated for you",
            },
            {
              step: "3",
              icon: "🌐",
              title: "Share",
              desc: "Anyone with the link can view and download",
            },
          ].map(({ step, icon, title, desc }) => (
            <div
              key={step}
              className="bg-paper2 border border-paper3 rounded-xl p-6 text-center flex flex-col items-center shadow-sm"
            >
              <div className="text-4xl text-amber font-extrabold mb-2 opacity-50 relative">
                {step}
              </div>
              <div className="mb-4 mt-2"><Emoji symbol={icon} size={32} /></div>
              <div className="text-lg font-bold text-ink mb-2">
                {title}
              </div>
              <div className="text-sm font-medium text-ink4 leading-relaxed">
                {desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
