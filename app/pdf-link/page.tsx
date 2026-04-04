"use client";

import React, { useCallback, useRef, useState } from "react";
import { Emoji } from "@/app/components/Icons";
import { SCard, Tip, Toast } from "@/app/components/DocLensUI";

interface UploadedFile {
  id: string;
  url: string;
  fileName: string;
  size: number;
  uploadedAt?: string;
}

const steps = [
  {
    title: "Upload",
    desc: "Choose the PDF you want to turn into a shareable link.",
    icon: "📂",
  },
  {
    title: "Generate",
    desc: "OneDocs creates a dedicated viewer link for that document.",
    icon: "🔗",
  },
  {
    title: "Share",
    desc: "Send a clean viewing experience instead of a raw file attachment.",
    icon: "🌐",
  },
];

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

  function fmtSize(bytes: number) {
    return bytes < 1024
      ? `${bytes} B`
      : bytes < 1048576
        ? `${(bytes / 1024).toFixed(1)} KB`
        : `${(bytes / 1048576).toFixed(1)} MB`;
  }

  function handleFile(f: File) {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are allowed.");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError("This file is too large. The limit is 20 MB.");
      return;
    }
    setFile(f);
    setError(null);
    setUploaded(null);
  }

  async function upload() {
    if (!file) return;
    setUploading(true);
    setProgress(12);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setProgress(34);
      const res = await fetch("/api/pdf-link", {
        method: "POST",
        body: formData,
      });

      setProgress(82);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      setProgress(100);
      const result: UploadedFile = {
        id: data.id,
        url: data.url,
        fileName: data.fileName,
        size: data.size,
      };

      setUploaded(result);
      setRecentLinks((prev) => [result, ...prev].slice(0, 8));
      showToast("Shareable PDF link created.");
    } catch (e: any) {
      setError(e.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function reset() {
    setFile(null);
    setUploaded(null);
    setError(null);
    setProgress(0);
    setCopied(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function copyLink() {
    if (!uploaded) return;
    navigator.clipboard.writeText(uploaded.url);
    setCopied(true);
    showToast("Viewer link copied.");
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="page-shell">
        <section className="page-hero p-8 md:p-10 xl:p-14">
          <div className="relative z-10 grid gap-10 xl:grid-cols-[minmax(0,1.1fr)_380px]">
            <div>
              <div className="page-kicker mb-5">Presentation and Sharing</div>
              <h1 className="page-title max-w-[760px]">
                Turn a PDF into a premium viewing link.
              </h1>
              <p className="page-copy mt-6">
                Instead of dropping a plain file into chat or email, create a
                dedicated viewer page that looks more intentional and feels more
                shareable.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                <span className="premium-chip">No sign-up</span>
                <span className="premium-chip">20 MB max</span>
                <span className="premium-chip">Viewer and download</span>
              </div>
            </div>
            <div className="surface-panel p-7">
              <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-ink4">
                Why it feels better
              </div>
              <div className="mt-5 grid gap-4">
                <div className="premium-metric">
                  <strong>Cleaner</strong>
                  <span>Send a dedicated viewer experience instead of a raw attachment.</span>
                </div>
                <div className="premium-metric">
                  <strong>Faster</strong>
                  <span>Generate a shareable link in a single upload flow.</span>
                </div>
                <div className="premium-metric">
                  <strong>More polished</strong>
                  <span>Presentation matters when you are sharing with customers.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="surface-panel p-8">
            {!uploaded ? (
              <>
                <div className="mb-6 flex items-center gap-4">
                  <div className="page-kicker">Create a link</div>
                  <div className="premium-divider flex-1" />
                </div>
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDrag(true);
                  }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDrag(false);
                    const dropped = e.dataTransfer.files[0];
                    if (dropped) handleFile(dropped);
                  }}
                  className={`flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-[30px] border border-dashed px-8 py-10 text-center transition-all duration-200 ${
                    drag
                      ? "border-amber/45 bg-[rgba(186,138,66,.06)]"
                      : file
                        ? "border-teal/35 bg-[rgba(31,90,86,.06)]"
                        : "border-[rgba(42,34,24,.14)] bg-white/58 hover:border-amber/35 hover:bg-[rgba(186,138,66,.04)]"
                  }`}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const selected = e.target.files?.[0];
                      if (selected) handleFile(selected);
                    }}
                  />
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(42,34,24,.08)] bg-white/85 text-amber shadow-[0_18px_32px_rgba(33,25,16,.08)]">
                    <Emoji symbol={file ? "📄" : "📂"} size={28} />
                  </div>
                  <div className="mt-5 font-caveat text-[34px] font-semibold leading-none text-ink2">
                    {file ? file.name : "Drop your PDF here"}
                  </div>
                  <div className="mt-3 text-[14px] leading-relaxed text-ink4">
                    {file
                      ? `${fmtSize(file.size)} · ready to upload`
                      : "Browse or drag a PDF into the upload zone to create a shareable viewer page."}
                  </div>
                  {file && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        reset();
                      }}
                      className="mt-5 inline-flex items-center gap-2 rounded-full border border-[rgba(42,34,24,.12)] bg-white/78 px-4 py-2 text-[13px] font-semibold text-ink3 transition-all duration-200 hover:bg-white"
                    >
                      <Emoji symbol="✕" size={14} />
                      Remove file
                    </button>
                  )}
                </label>

                {error && (
                  <div className="mt-4 rounded-[20px] border border-red/18 bg-[rgba(163,75,66,.08)] px-4 py-3 text-[13px] text-red">
                    {error}
                  </div>
                )}

                {uploading && (
                  <div className="mt-5 overflow-hidden rounded-full border border-[rgba(42,34,24,.08)] bg-white/60">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-amber via-amber2 to-teal transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={upload}
                    disabled={!file || uploading}
                    className={`inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold transition-all duration-200 ${
                      !file || uploading
                        ? "cursor-not-allowed border border-[rgba(42,34,24,.08)] bg-[rgba(255,255,255,.45)] text-ink4"
                        : "border border-amber2/30 bg-gradient-to-r from-amber to-amber2 text-white shadow-[0_18px_30px_rgba(186,138,66,.24)] hover:-translate-y-0.5"
                    }`}
                  >
                    <Emoji symbol={uploading ? "⏳" : "🔗"} size={16} />
                    {uploading ? "Creating link..." : "Generate viewer link"}
                  </button>
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-full border border-[rgba(42,34,24,.12)] bg-white/78 px-6 py-3.5 text-[15px] font-semibold text-ink2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
                  >
                    <Emoji symbol="📎" size={16} />
                    Choose file
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-6 flex items-center gap-4">
                  <div className="page-kicker">Link ready</div>
                  <div className="premium-divider flex-1" />
                </div>

                <div className="rounded-[28px] border border-teal/18 bg-[rgba(31,90,86,.06)] p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-teal/18 bg-white/78 text-teal">
                      <Emoji symbol="✅" size={24} />
                    </div>
                    <div>
                      <div className="font-caveat text-[32px] font-semibold leading-none text-teal">
                        Viewer generated
                      </div>
                      <p className="mt-3 text-[14px] leading-relaxed text-ink3">
                        Send this link to anyone who should view or download the PDF.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[24px] border border-[rgba(42,34,24,.08)] bg-white/68 p-4">
                  <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-ink4">
                    Viewer URL
                  </div>
                  <div className="mt-3 overflow-hidden rounded-[18px] border border-[rgba(42,34,24,.08)] bg-white px-4 py-3 font-mono text-[13px] text-ink3">
                    {uploaded.url}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={copyLink}
                      className="inline-flex items-center gap-2 rounded-full border border-amber2/30 bg-gradient-to-r from-amber to-amber2 px-5 py-3 text-[14px] font-semibold text-white shadow-[0_18px_30px_rgba(186,138,66,.24)] transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <Emoji symbol={copied ? "✓" : "📋"} size={15} />
                      {copied ? "Copied" : "Copy link"}
                    </button>
                    <a
                      href={uploaded.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-[rgba(42,34,24,.12)] bg-white/78 px-5 py-3 text-[14px] font-semibold text-ink2 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
                    >
                      <Emoji symbol="↗" size={14} />
                      Open viewer
                    </a>
                    <button
                      onClick={reset}
                      className="inline-flex items-center gap-2 rounded-full border border-[rgba(42,34,24,.12)] bg-white/78 px-5 py-3 text-[14px] font-semibold text-ink3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
                    >
                      <Emoji symbol="📂" size={15} />
                      Upload another
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="grid gap-6">
            <div className="surface-panel p-7">
              <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-ink4">
                Sharing flow
              </div>
              <div className="mt-5 grid gap-4">
                {steps.map((step, index) => (
                  <div key={step.title} className="rounded-[24px] border border-[rgba(42,34,24,.08)] bg-white/68 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(42,34,24,.08)] bg-white/80 text-amber">
                        <Emoji symbol={step.icon} size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-ink4">
                          Step {index + 1}
                        </div>
                        <div className="mt-1 font-caveat text-[24px] font-semibold leading-none text-ink2">
                          {step.title}
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-[14px] leading-relaxed text-ink3">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {recentLinks.length > 0 && (
              <div className="surface-panel p-7">
                <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-ink4">
                  Recent links
                </div>
                <div className="mt-5 grid gap-3">
                  {recentLinks.map((link) => (
                    <div
                      key={link.id}
                      className="rounded-[22px] border border-[rgba(42,34,24,.08)] bg-white/70 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(42,34,24,.08)] bg-white/80 text-teal">
                          <Emoji symbol="📄" size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[14px] font-semibold text-ink2">
                            {link.fileName}
                          </div>
                          <div className="mt-1 text-[12px] text-ink4">{fmtSize(link.size)}</div>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(link.url);
                            showToast("Recent link copied.");
                          }}
                          className="inline-flex items-center gap-2 rounded-full border border-[rgba(42,34,24,.12)] bg-white/78 px-3.5 py-2 text-[12px] font-semibold text-ink2"
                        >
                          <Emoji symbol="📋" size={13} />
                          Copy
                        </button>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-[rgba(42,34,24,.12)] bg-white/78 px-3.5 py-2 text-[12px] font-semibold text-ink2 no-underline"
                        >
                          <Emoji symbol="↗" size={13} />
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
