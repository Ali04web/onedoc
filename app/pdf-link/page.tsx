"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useCallback, useRef, useState } from "react";
import { Tip, Toast } from "@/app/components/DocLensUI";
import { UIcon } from "@/app/components/Icons";

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
    desc: "Choose your PDF.",
    icon: "FolderOpen" as const,
    tip: "Pick one PDF file to generate a shareable hosted page.",
  },
  {
    title: "Generate",
    desc: "Create the viewer link.",
    icon: "Link" as const,
    tip: "The file is uploaded and a unique viewer URL is created.",
  },
  {
    title: "Share",
    desc: "Send the link anywhere.",
    icon: "Globe" as const,
    tip: "Open the viewer or copy the link for clients and teammates.",
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
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="surface-panel p-5 md:p-8">
            {!uploaded ? (
              <>
                <div className="mb-5 flex items-center gap-4">
                  <div className="page-kicker">Create a link</div>
                  <div className="premium-divider flex-1" />
                </div>

                <label
                  title="Upload one PDF and generate a hosted viewer link."
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
                  className={`flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed px-6 py-8 text-center transition-all duration-200 md:min-h-[280px] md:px-8 md:py-10 ${
                    drag
                      ? "border-[rgba(110,124,255,.28)] bg-[linear-gradient(135deg,rgba(110,124,255,.08),rgba(16,199,162,.08))]"
                      : file
                        ? "border-teal/35 bg-[linear-gradient(135deg,rgba(16,199,162,.08),rgba(110,124,255,.06))]"
                        : "border-[rgba(110,124,255,.16)] bg-white/60 hover:border-[rgba(110,124,255,.22)] hover:bg-[linear-gradient(135deg,rgba(110,124,255,.04),rgba(255,145,71,.05))]"
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
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(110,124,255,.12)] bg-white/88 text-[var(--color-violet)] shadow-[0_18px_32px_rgba(34,48,94,.1)]">
                    <UIcon name={file ? "FileText" : "FolderOpen"} size={28} />
                  </div>
                  <div className="mt-5 font-caveat text-[28px] font-semibold leading-none text-ink2 md:text-[34px]">
                    {file ? file.name : "Drop your PDF here"}
                  </div>
                  <div className="mt-3 text-[14px] leading-relaxed text-ink4">
                    {file
                      ? `${fmtSize(file.size)} · ready to upload`
                      : "Browse or drag a PDF into the upload zone to create a shareable viewer page."}
                  </div>

                  {file ? (
                    <Tip tip="Remove the selected PDF and choose another one." side="top">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          reset();
                        }}
                        title="Remove the selected PDF and choose another one."
                        className="mt-5 inline-flex items-center gap-2 rounded-full border border-[rgba(110,124,255,.14)] bg-white/80 px-4 py-2 text-[13px] font-semibold text-ink3 transition-all duration-200 hover:bg-white"
                      >
                        <UIcon name="X" size={14} />
                        Remove file
                      </button>
                    </Tip>
                  ) : null}
                </label>

                {error ? (
                  <div className="mt-4 rounded-[20px] border border-red/18 bg-[rgba(163,75,66,.08)] px-4 py-3 text-[13px] text-red">
                    {error}
                  </div>
                ) : null}

                {uploading ? (
                  <div className="mt-5 overflow-hidden rounded-full border border-[rgba(110,124,255,.1)] bg-white/60">
                    <div
                      className="h-2 rounded-full bg-[linear-gradient(90deg,var(--color-red),var(--color-violet),var(--color-teal))] transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-3">
                  <Tip tip="Upload the PDF and create its hosted viewer page." side="top">
                    <button
                      onClick={upload}
                      title="Upload the PDF and create its hosted viewer page."
                      disabled={!file || uploading}
                      className={`inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold transition-all duration-200 ${
                        !file || uploading
                          ? "cursor-not-allowed border border-[rgba(42,34,24,.08)] bg-[rgba(255,255,255,.45)] text-ink4"
                          : "border border-[rgba(110,124,255,.18)] bg-[linear-gradient(135deg,var(--color-red),var(--color-violet),var(--color-teal))] text-white shadow-[0_18px_30px_rgba(54,74,146,.22)] hover:-translate-y-0.5"
                      }`}
                    >
                      <UIcon name={uploading ? "Hourglass" : "Link"} size={16} />
                      {uploading ? "Creating link..." : "Generate viewer link"}
                    </button>
                  </Tip>

                  <Tip tip="Choose a PDF from your device." side="top">
                    <button
                      onClick={() => inputRef.current?.click()}
                      title="Choose a PDF from your device."
                      className="inline-flex items-center gap-2 rounded-full border border-[rgba(110,124,255,.14)] bg-white/80 px-6 py-3.5 text-[15px] font-semibold text-ink2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
                    >
                      <UIcon name="Paperclip" size={16} />
                      Choose file
                    </button>
                  </Tip>
                </div>
              </>
            ) : (
              <>
                <div className="mb-5 flex items-center gap-4">
                  <div className="page-kicker">Link ready</div>
                  <div className="premium-divider flex-1" />
                </div>

                <div className="rounded-[28px] border border-teal/18 bg-[linear-gradient(135deg,rgba(16,199,162,.08),rgba(110,124,255,.06))] p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-teal/18 bg-white/82 text-teal">
                      <UIcon name="CheckCircle2" size={24} />
                    </div>
                    <div>
                      <div className="font-caveat text-[30px] font-semibold leading-none text-teal md:text-[32px]">
                        Viewer generated
                      </div>
                      <p className="mt-3 text-[14px] leading-relaxed text-ink3">
                        Send this link to anyone who should view or download the PDF.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[24px] border border-[rgba(110,124,255,.1)] bg-white/72 p-4">
                  <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-ink4">
                    Viewer URL
                  </div>
                  <div className="mt-3 overflow-hidden rounded-[18px] border border-[rgba(110,124,255,.1)] bg-white px-4 py-3 font-mono text-[13px] text-ink3">
                    {uploaded.url}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Tip tip="Copy the generated viewer URL." side="top">
                      <button
                        onClick={copyLink}
                        title="Copy the generated viewer URL."
                        className="inline-flex items-center gap-2 rounded-full border border-[rgba(110,124,255,.18)] bg-[linear-gradient(135deg,var(--color-red),var(--color-violet),var(--color-teal))] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_18px_30px_rgba(54,74,146,.22)] transition-all duration-200 hover:-translate-y-0.5"
                      >
                        <UIcon name={copied ? "Check" : "ClipboardList"} size={15} />
                        {copied ? "Copied" : "Copy link"}
                      </button>
                    </Tip>
                    <Tip tip="Open the hosted viewer in a new tab." side="top">
                      <a
                        href={uploaded.url}
                        title="Open the hosted viewer in a new tab."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-[rgba(110,124,255,.14)] bg-white/80 px-5 py-3 text-[14px] font-semibold text-ink2 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
                      >
                        <UIcon name="ExternalLink" size={14} />
                        Open viewer
                      </a>
                    </Tip>
                    <Tip tip="Reset the form and upload another PDF." side="top">
                      <button
                        onClick={reset}
                        title="Reset the form and upload another PDF."
                        className="inline-flex items-center gap-2 rounded-full border border-[rgba(110,124,255,.14)] bg-white/80 px-5 py-3 text-[14px] font-semibold text-ink3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
                      >
                        <UIcon name="FolderOpen" size={15} />
                        Upload another
                      </button>
                    </Tip>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="grid gap-5">
            <div className="surface-panel p-5 md:p-6">
              <div className="page-kicker mb-4">How it works</div>
              <div className="grid gap-4">
                {steps.map((step, index) => (
                  <Tip key={step.title} tip={step.tip} side="left">
                    <div className="rounded-[24px] border border-[rgba(110,124,255,.1)] bg-white/72 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(110,124,255,.1)] bg-white/80 text-[var(--color-violet)]">
                          <UIcon name={step.icon} size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-ink4">
                            Step {index + 1}
                          </div>
                          <div className="mt-1 font-caveat text-[22px] font-semibold leading-none text-ink2 md:text-[24px]">
                            {step.title}
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-[14px] leading-relaxed text-ink3">{step.desc}</p>
                    </div>
                  </Tip>
                ))}
              </div>
            </div>

            {recentLinks.length > 0 ? (
              <div className="surface-panel p-5 md:p-7">
                <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-ink4">
                  Recent links
                </div>
                <div className="mt-5 grid gap-3">
                  {recentLinks.map((link) => (
                    <div
                      key={link.id}
                      className="rounded-[22px] border border-[rgba(110,124,255,.1)] bg-white/72 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(110,124,255,.1)] bg-white/80 text-teal">
                          <UIcon name="FileText" size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[14px] font-semibold text-ink2">
                            {link.fileName}
                          </div>
                          <div className="mt-1 text-[12px] text-ink4">{fmtSize(link.size)}</div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Tip tip="Copy this recent viewer link." side="top">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(link.url);
                              showToast("Recent link copied.");
                            }}
                            title="Copy this recent viewer link."
                            className="inline-flex items-center gap-2 rounded-full border border-[rgba(110,124,255,.14)] bg-white/80 px-3.5 py-2 text-[12px] font-semibold text-ink2"
                          >
                            <UIcon name="ClipboardList" size={13} />
                            Copy
                          </button>
                        </Tip>
                        <Tip tip="Open this recent viewer link." side="top">
                          <a
                            href={link.url}
                            title="Open this recent viewer link."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-[rgba(110,124,255,.14)] bg-white/80 px-3.5 py-2 text-[12px] font-semibold text-ink2 no-underline"
                          >
                            <UIcon name="ExternalLink" size={13} />
                            View
                          </a>
                        </Tip>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {toast ? <Toast msg={toast} onDone={() => setToast(null)} /> : null}
    </div>
  );
}
