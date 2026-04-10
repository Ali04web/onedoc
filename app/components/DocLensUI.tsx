/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { fmtSize } from "../lib/utils";
import { UIcon } from "./Icons";

export function Tip({ children, tip, side = "top" }: any) {
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
      className="relative inline-flex max-w-full"
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
          className={`pointer-events-none absolute z-[9000] max-w-[260px] rounded-xl bg-[#1a1a26] border border-white/[0.08] px-3 py-2 text-[11px] font-medium leading-relaxed text-[#e4e4ef] shadow-xl animate-fade-in ${pos[side]}`}
        >
          {tip}
        </div>
      )}
    </div>
  );
}

export function Toast({ msg, onDone }: any) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-2xl bg-[#1a1a26]/95 backdrop-blur-xl border border-white/[0.08] px-5 py-3.5 text-[13px] font-semibold text-white shadow-2xl animate-fade-up">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00d4aa]/15 text-[#00d4aa]">
        <UIcon name="CheckCircle2" size={16} />
      </div>
      {msg}
    </div>
  );
}

export function Spinner() {
  return (
    <span className="mr-2 inline-block h-4 w-4 rounded-full border-2 border-white/10 border-t-[#7c6aff] animate-spin align-middle" />
  );
}

export function SHead({ ico, label, sub }: any) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7c6aff]/10 border border-[#7c6aff]/15 text-[#7c6aff]">
        {typeof ico === "string" ? <UIcon emoji={ico} size={18} /> : ico}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-display text-[16px] font-bold text-white">{label}</div>
        {sub && (
          <div className="text-[13px] text-[#6b6d80] font-medium">{sub}</div>
        )}
      </div>
      <div className="hidden lg:block flex-1 h-px bg-white/[0.04]" />
    </div>
  );
}

export function SCard({ children, style = {} }: any) {
  return (
    <div
      className="vintage-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.1]"
      style={style}
    >
      {children}
    </div>
  );
}

export function CCard({ ico, title, desc, accentCol = "#7c6aff", children }: any) {
  return (
    <div className="vintage-card group flex h-full flex-col gap-4 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.1]">
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border shadow-sm"
          style={{
            borderColor: `${accentCol}25`,
            background: `${accentCol}10`,
            color: accentCol,
          }}
        >
          {typeof ico === "string" ? <UIcon emoji={ico} size={18} /> : ico}
        </div>
        <div className="min-w-0">
          <div className="font-display text-[15px] font-bold text-white">{title}</div>
          <div className="mt-0.5 text-[12px] font-medium text-[#6b6d80] leading-relaxed">{desc}</div>
        </div>
      </div>
      <div className="h-px bg-white/[0.04]" />
      <div className="flex flex-1 flex-col gap-3 text-[#9294a5]">{children}</div>
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
  const has = multi ? (files?.length > 0) : !!file;

  const el = (
    <label
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={tip}
      className={`flex min-h-[80px] cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-3.5 text-center transition-all duration-200 ${
        has
          ? "border-[#00d4aa]/30 bg-[#00d4aa]/[0.04] text-[#00d4aa]"
          : hov
            ? "border-[#7c6aff]/30 bg-[#7c6aff]/[0.04] text-white"
            : "border-white/[0.08] bg-white/[0.02] text-[#9294a5]"
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
        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
          has
            ? "border-[#00d4aa]/20 bg-[#00d4aa]/10"
            : hov ? "border-[#7c6aff]/20 bg-[#7c6aff]/10" : "border-white/[0.06] bg-white/[0.03]"
        }`}
      >
        <UIcon name={has ? "CheckCircle2" : "Paperclip"} size={16} />
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold leading-tight">
          {has
            ? multi
              ? `${files.length} selected`
              : file.name
            : label}
        </div>
        {!has && <div className="mt-0.5 text-[11px] font-medium text-[#6b6d80]">Click or drag to upload</div>}
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
      className={`w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[13px] font-medium text-white outline-none transition-all placeholder:text-[#6b6d80] focus:ring-2 focus:ring-[#7c6aff]/20 focus:border-[#7c6aff]/30 ${className}`}
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
      className={`w-full cursor-pointer rounded-xl border border-white/[0.08] bg-[#12121a] px-4 py-2.5 text-[13px] font-medium text-white outline-none transition-all focus:ring-2 focus:ring-[#7c6aff]/20 focus:border-[#7c6aff]/30 ${className}`}
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
      ? "border-[#00d4aa]/20 bg-[#00d4aa]/[0.06] text-[#00d4aa]"
      : type === "err"
        ? "border-[#ff6b6b]/20 bg-[#ff6b6b]/[0.06] text-[#ff6b6b]"
        : "border-white/[0.06] bg-white/[0.03] text-[#9294a5]";

  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-[12px] font-semibold leading-relaxed animate-fade-in ${styles}`}>
      <UIcon name={type === "ok" ? "CheckCircle2" : type === "err" ? "X" : "Hourglass"} size={14} />
      <span>{msg}</span>
    </div>
  );
}

export function HBtn({ onClick, disabled, loading, label, tip }: any) {
  const isDisabled = disabled || loading;

  const btn = (
    <button
      onClick={onClick}
      disabled={isDisabled}
      title={tip}
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold transition-all ${
        isDisabled
          ? "cursor-not-allowed bg-white/[0.04] text-[#6b6d80]"
          : "cursor-pointer bg-gradient-to-r from-[#7c6aff] to-[#5b4bcf] text-white shadow-lg shadow-[#7c6aff]/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#7c6aff]/30 active:translate-y-0"
      }`}
    >
      {loading && <Spinner />}
      {label}
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
        className={`mb-1.5 flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${
          active
            ? "border-[#7c6aff]/20 bg-[#7c6aff]/[0.06] shadow-lg shadow-[#7c6aff]/5"
            : hov
              ? "border-white/[0.06] bg-white/[0.03]"
              : "border-transparent bg-transparent"
        }`}
      >
        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border ${
            active
              ? "border-[#7c6aff]/20 bg-[#7c6aff]/10 text-[#7c6aff]"
              : "border-white/[0.06] bg-white/[0.03] text-[#9294a5]"
          }`}
        >
          <UIcon name={doc.type === "pdf" ? "FileText" : "FileSignature"} size={15} />
        </div>
        <div className="min-w-0 flex-1">
          <div className={`truncate text-[13px] font-semibold ${active ? "text-white" : "text-[#9294a5]"}`}>
            {doc.name}
          </div>
          <div className="mt-0.5 text-[11px] font-medium text-[#6b6d80]">
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
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] text-[#6b6d80] hover:text-[#ff6b6b] hover:bg-[#ff6b6b]/10 transition-colors"
          >
            <UIcon name="X" size={12} />
          </button>
        )}
      </div>
    </Tip>
  );
}
