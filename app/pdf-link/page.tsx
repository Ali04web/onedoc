"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useCallback, useRef, useState } from "react";
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
      showToast("PDF Link Generated Successfully!");
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
    showToast("Link Copied to Clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="page-shell">
        <div className="flex flex-col items-center justify-center pt-8 pb-12">
          {/* Header Icon */}
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl rotate-[-4deg] border border-black/5">
            <UIcon name="Link" size={38} className="text-ink2" />
          </div>

          {/* Title */}
          <h1 className="vintage-title text-center leading-tight mb-4">
            PDF to <span className="text-[#d48a3b] italic">Link</span>
          </h1>

          {/* Subtext */}
          <div className="max-w-[480px] text-center text-[18px] text-ink3/80 font-medium font-patrick leading-relaxed">
            <p>Upload your PDF and get an instant shareable link.</p>
            <p>Anyone with the Link can view and download it.</p>
          </div>

          {/* Badges */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
            <span className="rounded-lg border border-[#4ba391]/20 bg-[#4ba391]/10 px-3 py-1.5 text-[12px] font-bold text-[#4ba391]">
              Free
            </span>
            <span className="text-[13px] font-semibold text-ink4">
              · Max 20 MB
            </span>
            <span className="text-[13px] font-semibold text-ink4">
              · No sign-up
            </span>
          </div>

          {/* Main Upload Area */}
          {!uploaded ? (
            <div className="mt-12 w-full max-w-[640px]">
              <label
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDrag(false);
                  const dropped = e.dataTransfer.files[0];
                  if (dropped) handleFile(dropped);
                }}
                className={`relative flex min-h-[340px] cursor-pointer flex-col items-center justify-center rounded-[40px] bg-white p-12 text-center shadow-2xl transition-all duration-300 active:scale-[0.98] ${
                  drag ? "scale-[1.02] ring-4 ring-[#4ba391]/20" : ""
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
                
                {/* Internal Dotted Border Container */}
                <div className="absolute inset-6 rounded-[32px] border-2 border-dashed border-black/10 transition-colors group-hover:border-black/20" />

                <div className="relative z-10">
                  {/* Folder Icon */}
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#fdf6e3] mx-auto transition-transform duration-300">
                    <UIcon name={file ? "CheckCircle2" : "FolderOpen"} size={42} className={file ? "text-[#4ba391]" : "text-ink2"} />
                  </div>

                  <div className="font-caveat text-[32px] font-bold text-ink2">
                    {file ? file.name : "Drop your PDF here"}
                  </div>
                  <div className="mt-4 text-[16px] font-medium text-ink4">
                    {file
                      ? `${fmtSize(file.size)} · Click Generate to continue`
                      : "or click to browse - up to 20 MB"}
                  </div>

                  {file && (
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); reset(); }}
                      className="mt-6 px-4 py-2 text-[14px] font-bold text-red-500 hover:text-red-600 transition-colors"
                    >
                      Remove file
                    </button>
                  )}
                </div>
              </label>

              {error && (
                <div className="mt-6 rounded-2xl bg-red-50 p-4 text-[14px] font-semibold text-red-600 text-center border border-red-100 animate-shake">
                  {error}
                </div>
              )}

              {uploading && (
                <div className="mt-8 space-y-3">
                  <div className="h-4 overflow-hidden rounded-full bg-black/5 p-1">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#d48a3b] to-[#4ba391] transition-all duration-500 shadow-sm"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-center text-[14px] font-bold text-ink3 animate-pulse">
                    Crafting your link... {progress}%
                  </div>
                </div>
              )}

              <div className="mt-10 flex justify-center">
                <button
                  onClick={upload}
                  disabled={!file || uploading}
                  className={`group relative flex items-center gap-3 rounded-2xl px-12 py-5 text-[18px] font-bold transition-all duration-300 ${
                    !file || uploading
                      ? "cursor-not-allowed bg-black/5 text-ink4"
                      : "bg-ink2 text-white shadow-xl hover:-translate-y-1 hover:shadow-2xl active:translate-y-0"
                  }`}
                >
                  <UIcon name={uploading ? "Hourglass" : "Link"} size={20} className={uploading ? "animate-spin" : ""} />
                  {uploading ? "Generating..." : "Generate Link"}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity bg-white" />
                </button>
              </div>
            </div>
          ) : (
            /* Result Area */
            <div className="mt-12 w-full max-w-[640px] animate-fade-up">
              <div className="rounded-[40px] bg-white p-10 text-center shadow-2xl border border-black/5">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#4ba391]/10 text-[#4ba391] mx-auto">
                  <UIcon name="CheckCircle2" size={42} />
                </div>
                <h2 className="font-caveat text-[34px] font-bold text-ink2 mb-6">Link is Ready!</h2>
                
                <div className="overflow-hidden rounded-2xl bg-[#fdf6e3] border border-black/5 mb-8">
                  <div className="px-6 py-5 font-mono text-[14px] text-ink2 truncate bg-white/50 mb-1">
                    {uploaded.url}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={copyLink}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink2 py-4 text-[16px] font-bold text-white shadow-lg transition-transform hover:-translate-y-1 active:scale-95"
                  >
                    <UIcon name={copied ? "Check" : "ClipboardList"} size={18} />
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                  <a
                    href={uploaded.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-ink2/10 bg-white py-4 text-[16px] font-bold text-ink2 no-underline transition-transform hover:-translate-y-1 active:scale-95"
                  >
                    <UIcon name="ExternalLink" size={18} />
                    Visit Page
                  </a>
                </div>

                <button
                  onClick={reset}
                  className="mt-8 text-[14px] font-bold text-ink4 hover:text-ink2 transition-colors"
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
