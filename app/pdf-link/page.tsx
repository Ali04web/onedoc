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
      showToast("✓ PDF link created successfully!");
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
    showToast("✓ Link copied to clipboard!");
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
    <div className="flex-1 overflow-y-auto">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center py-10 md:py-16 px-6">
        <div className="inline-block animate-wobble-in -rotate-[5deg] mb-4">
          <Emoji symbol="🔗" size={56} className="text-amber" />
        </div>
        <h1 className="font-caveat text-[34px] md:text-[46px] font-bold text-ink2 -rotate-[0.5deg] mb-2 leading-tight">
          PDF to <span className="text-amber">Link</span>
        </h1>
        <p className="font-patrick text-[15px] md:text-[17px] text-ink4 max-w-[460px] leading-[1.7] mb-2">
          Upload your PDF and get an instant shareable link.
          <br />
          Anyone with the link can view and download it.
        </p>
        <div className="flex items-center gap-2 text-[12px] font-patrick text-ink4">
          <span className="py-[3px] px-[10px] bg-[rgba(26,92,92,.08)] border border-teal rounded-[3px_8px_4px_7px] text-teal font-semibold">
            Free
          </span>
          <span>·</span>
          <span>Max 20 MB</span>
          <span>·</span>
          <span>No sign-up</span>
        </div>
      </section>

      {/* Upload Card */}
      <section className="px-4 md:px-8 lg:px-16 pb-8 max-w-[640px] mx-auto">
        {!uploaded ? (
          <div className="bg-paper border-2 border-[rgba(60,35,10,.22)] rounded-[6px_20px_8px_18px] p-6 md:p-8 shadow-[3px_4px_0_rgba(30,15,5,.08)]">
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
              className={`flex flex-col items-center justify-center py-10 md:py-14 px-6 border-[3px] border-dashed rounded-[4px_16px_6px_14px] cursor-pointer transition-all duration-200 text-center ${
                drag
                  ? "border-amber bg-[rgba(192,120,24,.07)] scale-[1.01]"
                  : file
                    ? "border-teal bg-[rgba(26,92,92,.04)]"
                    : "border-[rgba(100,70,40,.3)] bg-[rgba(255,255,255,.3)] hover:border-amber hover:bg-[rgba(192,120,24,.03)]"
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
                <>
                  <div className="mb-3"><Emoji symbol="📄" size={48} className="text-teal" /></div>
                  <div className="font-caveat text-[20px] font-bold text-ink2 mb-1">
                    {file.name}
                  </div>
                  <div className="font-patrick text-[13px] text-ink4">
                    {fmtSize(file.size)}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      reset();
                    }}
                    className="mt-3 font-caveat flex items-center gap-[4px] text-[13px] text-red font-semibold underline cursor-pointer bg-transparent border-none"
                  >
                    <Emoji symbol="✕" size={14} /> Remove
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-3 -rotate-[4deg] inline-block">
                    <Emoji symbol="📂" size={56} className="text-ink3" />
                  </div>
                  <div className="font-caveat text-[20px] font-bold text-ink2 mb-1">
                    Drop your PDF here
                  </div>
                  <div className="font-patrick text-[14px] text-ink4">
                    or click to browse · up to 20 MB
                  </div>
                </>
              )}
            </label>

            {/* Error */}
            {error && (
              <div className="mt-4 py-[10px] px-[14px] bg-[rgba(180,30,30,.06)] border-[1.5px] border-red rounded-[3px_10px_4px_9px] font-patrick text-[13px] text-red">
                ⚠️ {error}
              </div>
            )}

            {/* Progress bar */}
            {uploading && (
              <div className="mt-4 h-[6px] bg-paper3 rounded-[3px_8px] overflow-hidden border border-[rgba(100,70,40,.15)]">
                <div
                  className="h-full bg-gradient-to-r from-amber to-teal transition-[width] duration-500 rounded-[3px_8px]"
                  style={{ width: progress + "%" }}
                />
              </div>
            )}

            {/* Upload button */}
            <Tip tip="Upload your PDF to generate a shareable link" side="bottom">
              <button
                onClick={upload}
                disabled={!file || uploading}
                className={`mt-5 w-full flex items-center justify-center gap-[8px] py-[14px] px-[24px] font-caveat text-[20px] font-bold rounded-[4px_14px_6px_12px] border-2 shadow-[2px_3px_0_rgba(30,15,5,.12)] transition-all duration-150 cursor-pointer ${
                  !file || uploading
                    ? "bg-paper3 text-ink4 border-[rgba(100,70,40,.2)] cursor-not-allowed opacity-60"
                    : "bg-amber hover:bg-amber2 text-white border-amber2 hover:shadow-[3px_4px_0_rgba(30,15,5,.18)] hover:-translate-y-[1px]"
                }`}
              >
                <Emoji symbol={uploading ? "⏳" : "🔗"} size={22} />
                {uploading ? "Uploading..." : "Generate Shareable Link"}
              </button>
            </Tip>
          </div>
        ) : (
          /* Success card */
          <div className="bg-paper border-2 border-teal rounded-[6px_20px_8px_18px] p-6 md:p-8 shadow-[3px_4px_0_rgba(26,92,92,.12)]">
            <div className="text-center mb-5 flex flex-col items-center">
              <div className="mb-3"><Emoji symbol="✅" size={56} className="text-teal" /></div>
              <div className="font-caveat text-[26px] font-bold text-teal mb-1">
                Your link is ready!
              </div>
              <div className="font-patrick text-[14px] text-ink4">
                Anyone with this link can view and download your PDF
              </div>
            </div>

            {/* Link display */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-paper2 border-[1.5px] border-[rgba(100,70,40,.25)] rounded-[3px_10px_4px_9px] py-[10px] px-[14px] font-mono text-[13px] text-ink2 overflow-hidden text-ellipsis whitespace-nowrap select-all">
                {uploaded.url}
              </div>
              <Tip tip={copied ? "Copied!" : "Copy link to clipboard"}>
                <button
                  onClick={copyLink}
                  className={`py-[10px] px-[16px] rounded-[3px_10px_4px_9px] font-caveat text-[15px] font-bold border-2 transition-all duration-150 cursor-pointer whitespace-nowrap flexItems-center gap-[6px] ${
                    copied
                      ? "bg-teal text-white border-teal"
                      : "bg-amber hover:bg-amber2 text-white border-amber2"
                  }`}
                >
                  <Emoji symbol={copied ? "✓" : "📋"} size={16} /> {copied ? "Copied" : "Copy"}
                </button>
              </Tip>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mb-5">
              <Tip tip="Open the viewer page in a new tab" side="bottom">
                <a
                  href={uploaded.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-[6px] py-[8px] px-[14px] rounded-[3px_10px_4px_9px] font-caveat text-[15px] font-semibold text-ink2 bg-paper2 border-[1.5px] border-[rgba(100,70,40,.28)] no-underline cursor-pointer hover:bg-[rgba(192,120,24,.1)] hover:border-amber transition-all duration-150"
                >
                  <Emoji symbol="↗" size={16} /> Open Viewer
                </a>
              </Tip>
              <Tip tip="Upload a different PDF" side="bottom">
                <button
                  onClick={reset}
                  className="flex items-center gap-[6px] py-[8px] px-[14px] rounded-[3px_10px_4px_9px] font-caveat text-[15px] font-semibold text-ink3 bg-paper2 border-[1.5px] border-[rgba(100,70,40,.28)] cursor-pointer hover:bg-[rgba(192,120,24,.1)] hover:border-amber transition-all duration-150"
                >
                  <Emoji symbol="📂" size={16} /> Upload Another
                </button>
              </Tip>
            </div>

            {/* File info */}
            <div className="flex items-center gap-3 py-[10px] px-[14px] bg-[rgba(26,92,92,.04)] border border-teal rounded-[3px_10px_4px_9px]">
              <Emoji symbol="📄" size={26} className="text-teal" />
              <div className="flex-1 min-w-0">
                <div className="font-caveat text-[15px] font-bold text-ink2 overflow-hidden text-ellipsis whitespace-nowrap">
                  {uploaded.fileName}
                </div>
                <div className="font-patrick text-[12px] text-ink4">
                  {fmtSize(uploaded.size)} · ID: {uploaded.id}
                </div>
              </div>
              <span className="font-caveat text-[11px] font-bold py-[3px] px-[10px] rounded-[2px_7px_3px_6px] bg-teal text-white">
                LIVE
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Recent links */}
      {recentLinks.length > 0 && (
        <section className="px-4 md:px-8 lg:px-16 pb-8 max-w-[640px] mx-auto">
          <div className="flex items-center gap-[14px] mb-4">
            <div className="-rotate-[4deg]"><Emoji symbol="🕐" size={20} /></div>
            <div className="font-caveat text-[20px] font-bold text-ink2">
              Recent Links
            </div>
            <div className="flex-1 border-t-[1.5px] border-dashed border-[rgba(100,70,40,.18)]" />
          </div>
          <div className="flex flex-col gap-2">
            {recentLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-3 py-[10px] px-[14px] bg-paper border-[1.5px] border-[rgba(60,35,10,.18)] rounded-[3px_10px_4px_9px] group"
              >
                <Emoji symbol="📄" size={20} />
                <div className="flex-1 min-w-0">
                  <div className="font-caveat text-[14px] font-bold text-ink2 overflow-hidden text-ellipsis whitespace-nowrap">
                    {link.fileName}
                  </div>
                  <div className="font-patrick text-[11px] text-ink4">
                    {fmtSize(link.size)}
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(link.url);
                    showToast("✓ Link copied!");
                  }}
                  className="font-caveat text-[12px] font-semibold text-teal bg-transparent border-[1.5px] border-teal py-[4px] px-[10px] rounded-[2px_7px_3px_6px] cursor-pointer opacity-60 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-[4px]"
                >
                  <Emoji symbol="📋" size={12} /> Copy
                </button>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener"
                  className="font-caveat text-[12px] font-semibold text-ink3 bg-transparent border-[1.5px] border-[rgba(100,70,40,.25)] py-[4px] px-[10px] rounded-[2px_7px_3px_6px] no-underline cursor-pointer opacity-60 group-hover:opacity-100 transition-opacity duration-150 flex items-center"
                >
                  <Emoji symbol="↗" size={14} />
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="px-4 md:px-8 lg:px-16 pb-12 max-w-[640px] mx-auto">
        <div className="flex items-center gap-[14px] mb-5">
          <div className="-rotate-[4deg] text-amber"><Emoji symbol="💡" size={24} /></div>
          <div className="font-caveat text-[20px] font-bold text-ink2">
            How it works
          </div>
          <div className="flex-1 border-t-[1.5px] border-dashed border-[rgba(100,70,40,.18)]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              className="bg-paper border-2 border-[rgba(60,35,10,.18)] rounded-[4px_14px_5px_13px] p-5 text-center flex flex-col items-center"
            >
              <div className="font-caveat text-[40px] text-amber font-bold mb-1 -rotate-[2deg]">
                {step}
              </div>
              <div className="mb-3"><Emoji symbol={icon} size={32} /></div>
              <div className="font-caveat text-[18px] font-bold text-ink2 mb-1">
                {title}
              </div>
              <div className="font-patrick text-[13px] text-ink4 leading-[1.5]">
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
