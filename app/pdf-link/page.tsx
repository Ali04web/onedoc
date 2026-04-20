"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { Toast } from "@/app/components/DocLensUI";
import { UIcon } from "@/app/components/Icons";

interface UploadedFile {
  id: string;
  url: string;
  fileName: string;
  size: number;
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
      setError("File too large. Max 20 MB.");
      return;
    }
    setFile(f);
    setError(null);
    setUploaded(null);
  }

  async function upload() {
    if (!file) return;
    setUploading(true);
    setProgress(15);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setProgress(45);
      const res = await fetch("/api/pdf-link", {
        method: "POST",
        body: formData,
      });

      setProgress(85);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      const result: UploadedFile = {
        id: data.id,
        url: data.url,
        fileName: data.fileName,
        size: data.size,
      };

      setUploaded(result);
      setProgress(100);
      showToast("PDF Link Generated!");
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
    showToast("Link Copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="page-shell">
        <div className="relative flex flex-col items-center justify-center pt-6 pb-12">
          {/* Coming Soon Overlay */}
          <div className="absolute inset-0 z-[50] flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-[6px]">
            <div className="surface-panel flex flex-col items-center gap-5 px-8 sm:px-10 py-8 text-center shadow-xl animate-fade-in-scale border border-black/[0.08]">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f97316] shadow-lg shadow-[#f97316]/20">
                <UIcon name="Hourglass" size={28} className="text-white animate-spin-slow" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a2e] tracking-tight">Coming Soon</h2>
                <p className="text-[14px] text-[#5f6368] font-medium leading-relaxed max-w-[320px]">Cloud storage and sharing is currently being optimized for the best experience.</p>
              </div>
              <Link href="/" className="group mt-1 inline-flex items-center gap-2.5 rounded-xl bg-[#f7f8fc] border border-black/[0.06] px-6 py-3 text-[13px] font-bold text-[#1a1a2e] no-underline transition-all hover:bg-[#f0f2f7] hover:border-black/[0.1] active:scale-95">
                <UIcon name="ArrowLeft" size={14} className="transition-transform group-hover:-translate-x-1" />
                Back home
              </Link>
            </div>
          </div>

          {/* Upload / Result Area */}
          {!uploaded ? (
            <div className="w-full max-w-[600px]">
              <label
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDrag(false);
                  const dropped = e.dataTransfer.files[0];
                  if (dropped) handleFile(dropped);
                }}
                className={`relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl bg-[#f7f8fc] border-2 border-dashed p-8 sm:p-10 text-center transition-all duration-300 active:scale-[0.99] overflow-hidden ${
                  drag ? "scale-[1.01] border-[#e5322d]/40 bg-[#e5322d]/[0.03]" : "border-black/[0.1] hover:border-black/[0.16]"
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

                <div className="relative z-10">
                  <div className={`mb-5 flex h-18 w-18 items-center justify-center rounded-2xl mx-auto transition-all duration-300 ${
                    file
                      ? "bg-[#10b981]/10 border border-[#10b981]/20"
                      : "bg-white border border-black/[0.06]"
                  }`} style={{ width: 72, height: 72 }}>
                    <UIcon name={file ? "CheckCircle2" : "FolderOpen"} size={32} className={`transition-all duration-300 ${file ? "text-[#10b981]" : "text-[#9aa0a6]"}`} />
                  </div>

                  <div className="font-display text-xl font-bold text-[#1a1a2e]">
                    {file ? file.name : "Drop your PDF here"}
                  </div>
                  <div className="mt-2 text-[14px] font-medium text-[#9aa0a6]">
                    {file
                      ? `${fmtSize(file.size)} · Ready to generate`
                      : "or click to browse · up to 20 MB"}
                  </div>

                  {file && (
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); reset(); }}
                      className="mt-5 px-3 py-1.5 text-[13px] font-semibold text-[#ef4444] hover:text-[#dc2626] transition-colors"
                    >
                      Remove file
                    </button>
                  )}
                </div>
              </label>

              {error && (
                <div className="mt-5 rounded-xl bg-[#ef4444]/[0.06] border border-[#ef4444]/15 p-3.5 text-[13px] font-semibold text-[#ef4444] text-center animate-fade-in">
                  {error}
                </div>
              )}

              {uploading && (
                <div className="mt-6 space-y-2.5">
                  <div className="relative h-2.5 overflow-hidden rounded-full bg-black/[0.04]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#e5322d] via-[#f97316] to-[#e5322d] transition-all duration-500"
                      style={{ width: `${progress}%`, backgroundSize: "200% 100%", animation: "shimmer 2s linear infinite" }}
                    />
                  </div>
                  <div className="text-center text-[13px] font-semibold text-[#5f6368] animate-pulse">
                    Generating link... {progress}%
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-center">
                <button
                  onClick={upload}
                  disabled={!file || uploading}
                  className={`group relative flex items-center gap-3 rounded-xl px-8 sm:px-10 py-3.5 text-[15px] font-bold transition-all duration-300 overflow-hidden ${
                    !file || uploading
                      ? "cursor-not-allowed bg-[#f0f2f7] text-[#9aa0a6]"
                      : "bg-[#e5322d] text-white shadow-lg shadow-[#e5322d]/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#e5322d]/25 hover:bg-[#d42b26] active:translate-y-0 active:scale-[0.98]"
                  }`}
                >
                  {!(!file || uploading) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  )}
                  <UIcon name={uploading ? "Hourglass" : "NavPdfLink"} size={18} className={uploading ? "animate-spin" : ""} />
                  <span className="relative">{uploading ? "Generating..." : "Generate Link"}</span>
                </button>
              </div>

              {/* Badges */}
              <div className="mt-6 flex flex-wrap justify-center items-center gap-3">
                <span className="rounded-lg border border-[#e5322d]/15 bg-[#e5322d]/[0.06] px-2.5 py-1 text-[11px] font-bold text-[#e5322d]">
                  Free
                </span>
                <span className="text-[12px] font-medium text-[#9aa0a6]">· Max 20 MB</span>
                <span className="text-[12px] font-medium text-[#9aa0a6]">· No sign-up</span>
              </div>
            </div>
          ) : (
            /* Result Area */
            <div className="w-full max-w-[600px] animate-fade-in-scale">
              <div className="rounded-2xl bg-white border border-black/[0.08] p-8 sm:p-10 text-center shadow-lg">
                <div className="mb-5 flex h-18 w-18 items-center justify-center rounded-2xl bg-[#10b981]/10 border border-[#10b981]/15 text-[#10b981] mx-auto" style={{ width: 72, height: 72 }}>
                  <UIcon name="CheckCircle2" size={36} />
                </div>
                <h2 className="font-display text-2xl font-bold text-[#1a1a2e] mb-5">Link is Ready</h2>

                <div className="overflow-hidden rounded-xl bg-[#f7f8fc] border border-black/[0.06] mb-6">
                  <div className="px-5 py-4 font-mono text-[13px] text-[#5f6368] truncate">
                    {uploaded.url}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={copyLink}
                    className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-[#e5322d] py-3.5 text-[14px] font-bold text-white shadow-md shadow-[#e5322d]/15 transition-all hover:-translate-y-0.5 hover:bg-[#d42b26] active:scale-[0.98] overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <UIcon name={copied ? "Check" : "ClipboardList"} size={16} />
                    <span className="relative">{copied ? "Copied!" : "Copy Link"}</span>
                  </button>
                  <a
                    href={uploaded.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/[0.08] bg-white py-3.5 text-[14px] font-bold text-[#1a1a2e] no-underline transition-all hover:-translate-y-0.5 hover:bg-[#f7f8fc] hover:border-black/[0.12] active:scale-[0.98]"
                  >
                    <UIcon name="ExternalLink" size={16} />
                    Visit Page
                  </a>
                </div>

                <button
                  onClick={reset}
                  className="mt-6 text-[13px] font-semibold text-[#9aa0a6] hover:text-[#e5322d] transition-colors"
                >
                  Upload another PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
