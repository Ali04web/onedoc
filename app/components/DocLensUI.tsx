/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { fmtSize } from "../lib/utils";
import { UIcon } from "./Icons";

export function Tip({ children, tip, side = "top", className = "" }: any) {
  const [show, setShow] = useState(false);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pos: any = {
    top: "bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2",
    bottom: "top-[calc(100%+10px)] left-1/2 -translate-x-1/2",
    right: "left-[calc(100%+10px)] top-1/2 -translate-y-1/2",
    left: "right-[calc(100%+10px)] top-1/2 -translate-y-1/2",
  };

  function clearHideTimer() {
    if (hideRef.current) {
      clearTimeout(hideRef.current);
      hideRef.current = null;
    }
  }

  function showBrieflyOnTouch() {
    clearHideTimer();
    setShow(true);
    hideRef.current = setTimeout(() => setShow(false), 1600);
  }

  useEffect(() => {
    return () => {
      if (hideRef.current) {
        clearTimeout(hideRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`relative max-w-full ${className || "inline-flex"}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocusCapture={() => setShow(true)}
      onBlurCapture={() => setShow(false)}
      onTouchStart={showBrieflyOnTouch}
    >
      {children}
      {show && tip && (
        <div
          role="tooltip"
          className={`pointer-events-none absolute z-[9000] max-w-[260px] rounded-xl bg-[#1a1a2e] px-3.5 py-2.5 text-[11px] font-medium leading-relaxed text-white shadow-xl animate-fade-in-scale ${pos[side]}`}
        >
          {tip}
        </div>
      )}
    </div>
  );
}

export function Toast({ msg, onDone }: any) {
  const [entering, setEntering] = useState(true);

  useEffect(() => {
    const enterTimeout = setTimeout(() => setEntering(false), 50);
    const exitTimeout = setTimeout(onDone, 3200);
    return () => {
      clearTimeout(enterTimeout);
      clearTimeout(exitTimeout);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-2xl bg-white border border-black/[0.08] px-6 py-4 text-[13px] font-semibold text-[#1a1a2e] shadow-2xl transition-all duration-500 ${
        entering ? "translate-y-4 opacity-0 scale-95" : "translate-y-0 opacity-100 scale-100"
      }`}
    >
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981]">
        <UIcon name="CheckCircle2" size={18} />
      </div>
      {msg}
    </div>
  );
}

export function Spinner() {
  return (
    <span className="mr-2 inline-block h-4 w-4 rounded-full border-2 border-black/10 border-t-[#e5322d] animate-spin align-middle" />
  );
}

export function SHead({ ico, label, sub }: any) {
  return (
    <div className="mb-6 flex items-center gap-3.5 animate-fade-in">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#e5322d]/[0.06] text-[#e5322d] transition-all duration-300 hover:bg-[#e5322d]/10 hover:scale-105">
        {typeof ico === "string" ? <UIcon emoji={ico} size={18} /> : ico}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-display text-[17px] font-bold text-[#1a1a2e] tracking-tight">{label}</div>
        {sub && (
          <div className="text-[13px] text-[#9aa0a6] font-medium mt-0.5">{sub}</div>
        )}
      </div>
      <div className="hidden lg:block flex-1 h-px bg-gradient-to-r from-black/[0.06] to-transparent" />
    </div>
  );
}

export function SCard({ children, style = {} }: any) {
  return (
    <div
      className="vintage-card p-5 transition-all duration-400 hover:-translate-y-1 hover:border-black/[0.12]"
      style={style}
    >
      {children}
    </div>
  );
}

export function CCard({
  ico,
  title,
  desc,
  accentCol = "#e5322d",
  children,
  className = "",
  bodyClassName = "",
}: any) {
  return (
    <div
      className={`vintage-card group relative flex h-full flex-col gap-4 overflow-hidden p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-black/[0.1] hover:shadow-lg hover:shadow-black/[0.04] ${className}`}
    >
      <div className="relative z-10 flex items-start gap-3.5">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
          style={{
            background: `${accentCol}10`,
            color: accentCol,
          }}
        >
          {typeof ico === "string" ? <UIcon emoji={ico} size={18} /> : ico}
        </div>
        <div className="min-w-0">
          <div className="font-display text-[15px] font-bold text-[#1a1a2e] tracking-tight">{title}</div>
          {desc ? (
            <div className="mt-0.5 text-[12px] font-medium leading-relaxed text-[#9aa0a6]">
              {desc}
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 h-px bg-gradient-to-r from-black/[0.05] via-black/[0.02] to-transparent" />

      <div className={`relative z-10 flex flex-1 flex-col gap-3 text-[#5f6368] ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
}

export function FZone({
  accept,
  label,
  multi,
  file,
  files,
  onFile,
  onFiles,
  tip,
}: any) {
  const [hov, setHov] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const has = multi ? (files?.length > 0) : !!file;

  const el = (
    <label
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const dropped = Array.from(e.dataTransfer.files);
        if (multi) onFiles?.(dropped);
        else if (dropped[0]) onFile?.(dropped[0]);
      }}
      title={tip}
      className={`relative flex min-h-[80px] cursor-pointer items-center justify-center gap-3.5 rounded-xl border-2 border-dashed px-5 py-4 text-center transition-all duration-300 overflow-hidden ${
        has
          ? "border-[#10b981]/30 bg-[#10b981]/[0.04] text-[#10b981]"
          : dragOver
            ? "border-[#e5322d]/40 bg-[#e5322d]/[0.04] text-[#e5322d] scale-[1.01]"
            : hov
              ? "border-[#e5322d]/25 bg-[#e5322d]/[0.02] text-[#1a1a2e]"
              : "border-black/[0.1] bg-[#f7f8fc] text-[#5f6368]"
      }`}
    >
      <input
        type="file"
        accept={accept}
        multiple={multi}
        className="hidden"
        onChange={(e) =>
          multi ? onFiles(Array.from(e.target.files || [])) : onFile?.(e.target.files?.[0])
        }
      />

      <div
        className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-300 ${
          has
            ? "border-[#10b981]/20 bg-[#10b981]/10"
            : hov ? "border-[#e5322d]/15 bg-[#e5322d]/[0.06]" : "border-black/[0.06] bg-white"
        }`}
      >
        <UIcon name={has ? "CheckCircle2" : "Paperclip"} size={16} />
      </div>
      <div className="relative z-10 min-w-0 text-left">
        <div className="text-[13px] font-semibold leading-tight">
          {has
            ? multi
              ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
              : file.name
            : label}
        </div>
        {!has && <div className="mt-0.5 text-[11px] font-medium text-[#9aa0a6]">Click or drag to upload</div>}
      </div>
    </label>
  );

  return tip ? (
    <div className="w-full">
      <Tip tip={tip} side="right">
        {el}
      </Tip>
    </div>
  ) : (
    el
  );
}

export function HInput({ className = "", tip, ...props }: any) {
  const input = (
    <input
      {...props}
      title={tip}
      className={`w-full rounded-xl border border-black/[0.08] bg-[#f7f8fc] px-4 py-3 text-[13px] font-medium text-[#1a1a2e] outline-none transition-all duration-300 placeholder:text-[#9aa0a6] focus:ring-2 focus:ring-[#e5322d]/15 focus:border-[#e5322d]/30 focus:bg-white hover:border-black/[0.12] ${className}`}
    />
  );

  return tip ? (
    <div className="w-full">
      <Tip tip={tip}>{input}</Tip>
    </div>
  ) : (
    input
  );
}

export function HSel({ className = "", children, tip, ...props }: any) {
  const select = (
    <select
      {...props}
      title={tip}
      className={`w-full cursor-pointer rounded-xl border border-black/[0.08] bg-[#f7f8fc] px-4 py-3 text-[13px] font-medium text-[#1a1a2e] outline-none transition-all duration-300 focus:ring-2 focus:ring-[#e5322d]/15 focus:border-[#e5322d]/30 hover:border-black/[0.12] ${className}`}
    >
      {children}
    </select>
  );

  return tip ? (
    <div className="w-full">
      <Tip tip={tip}>{select}</Tip>
    </div>
  ) : (
    select
  );
}

export function CStat({ msg, type }: any) {
  if (!msg) return null;

  const styles =
    type === "ok"
      ? "border-[#10b981]/20 bg-[#10b981]/[0.04] text-[#10b981]"
      : type === "err"
        ? "border-[#ef4444]/20 bg-[#ef4444]/[0.04] text-[#ef4444]"
        : "border-black/[0.06] bg-[#f7f8fc] text-[#5f6368]";

  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-[12px] font-semibold leading-relaxed animate-fade-in-scale ${styles}`}>
      <div className="flex-shrink-0 mt-0.5">
        <UIcon name={type === "ok" ? "CheckCircle2" : type === "err" ? "X" : "Hourglass"} size={14} />
      </div>
      <span>{msg}</span>
    </div>
  );
}

export function HBtn({ onClick, disabled, loading, label, tip, className = "" }: any) {
  const isDisabled = disabled || loading;

  const btn = (
    <button
      onClick={onClick}
      disabled={isDisabled}
      title={tip}
      className={`group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl px-4 py-3 text-[13px] font-bold transition-all duration-300 ${
        isDisabled
          ? "cursor-not-allowed bg-[#f0f2f7] text-[#9aa0a6] border border-black/[0.04]"
          : "cursor-pointer bg-[#e5322d] text-white shadow-md shadow-[#e5322d]/15 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#e5322d]/20 hover:bg-[#d42b26] active:translate-y-0 active:scale-[0.98]"
      } ${className}`}
    >
      {/* Sweep animation */}
      {!isDisabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      )}
      <span className="relative flex items-center gap-2">
        {loading && <Spinner />}
        {label}
      </span>
    </button>
  );

  return tip ? (
    <div className="w-full">
      <Tip tip={tip}>{btn}</Tip>
    </div>
  ) : (
    btn
  );
}

export function DItem({ doc, active, onSelect, onRemove }: any) {
  const [hov, setHov] = useState(false);

  return (
    <Tip tip={`${doc.name} · ${fmtSize(doc.size)}`} side="right">
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onClick={onSelect}
        className={`mb-1.5 flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition-all duration-300 ${
          active
            ? "border-[#e5322d]/15 bg-[#e5322d]/[0.04] shadow-sm"
            : hov
              ? "border-black/[0.06] bg-[#f7f8fc]"
              : "border-transparent bg-transparent"
        }`}
      >
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
            active
              ? "border-[#e5322d]/15 bg-[#e5322d]/[0.06] text-[#e5322d]"
              : "border-black/[0.06] bg-[#f7f8fc] text-[#9aa0a6]"
          }`}
        >
          <UIcon name={doc.type === "pdf" ? "FileText" : "FileSignature"} size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className={`truncate text-[13px] font-semibold ${active ? "text-[#1a1a2e]" : "text-[#5f6368]"}`}>
            {doc.name}
          </div>
          <div className="mt-0.5 text-[11px] font-medium text-[#9aa0a6]">
            {fmtSize(doc.size)}
            {doc.pages ? ` · ${doc.pages} pages` : ""}
          </div>
        </div>
        {hov && (
          <button
            onClick={(e: any) => {
              e.stopPropagation();
              onRemove();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f7f8fc] text-[#9aa0a6] hover:text-[#ef4444] hover:bg-[#ef4444]/[0.06] transition-all duration-200"
          >
            <UIcon name="X" size={12} />
          </button>
        )}
      </div>
    </Tip>
  );
}
