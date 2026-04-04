/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { fmtSize } from "../lib/utils";
import { Emoji } from "./Icons";

export function Tip({ children, tip, side = "top" }: any) {
  const [show, setShow] = useState(false);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pos: any = {
    top: "bottom-[calc(100%+14px)] left-1/2 -translate-x-1/2",
    bottom: "top-[calc(100%+14px)] left-1/2 -translate-x-1/2",
    right: "left-[calc(100%+14px)] top-1/2 -translate-y-1/2",
    left: "right-[calc(100%+14px)] top-1/2 -translate-y-1/2",
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
          className={`pointer-events-none absolute z-[9000] max-w-[280px] rounded-xl border border-black/10 bg-white px-3.5 py-2 text-[12px] font-bold leading-relaxed text-ink2 shadow-xl animate-fade-in ${pos[side]}`}
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
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-5 py-3.5 text-[14px] font-bold text-ink2 shadow-2xl animate-fade-up">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4ba391]/10 text-[#4ba391]">
        <Emoji symbol="✅" size={18} />
      </div>
      {msg}
    </div>
  );
}

export function Spinner() {
  return (
    <span className="mr-2 inline-block h-4 w-4 rounded-full border-2 border-black/10 border-t-ink2 animate-spin align-middle" />
  );
}

export function SHead({ ico, label, sub }: any) {
  return (
    <div className="mb-10 flex flex-col gap-3 lg:flex-row lg:items-end">
      <div className="flex items-start gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-black/5 shadow-md">
          {typeof ico === "string" ? <Emoji symbol={ico} size={26} /> : ico}
        </div>
        <div>
          <div className="font-caveat text-[32px] font-bold leading-none text-ink2">
            {label}
          </div>
          {sub && (
            <div className="mt-2 max-w-[620px] text-[15px] font-medium leading-relaxed text-ink4">
              {sub}
            </div>
          )}
        </div>
      </div>
      <div className="premium-divider hidden flex-1 lg:block opacity-50" />
    </div>
  );
}

export function SCard({ children, style = {} }: any) {
  return (
    <div
      className="vintage-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.99]"
      style={style}
    >
      {children}
    </div>
  );
}

export function CCard({ ico, title, desc, accentCol = "#ba8a42", children }: any) {
  return (
    <div className="vintage-card group flex h-full flex-col gap-5 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border bg-white shadow-sm"
          style={{ borderColor: `${accentCol}20`, color: accentCol }}
        >
          {typeof ico === "string" ? <Emoji symbol={ico} size={22} /> : ico}
        </div>
        <div className="min-w-0">
          <div className="font-caveat text-[24px] font-bold leading-tight text-ink2">
            {title}
          </div>
          <div className="mt-1 text-[13px] font-medium leading-relaxed text-ink4">{desc}</div>
        </div>
      </div>
      <div className="premium-divider opacity-50" />
      <div className="flex flex-1 flex-col gap-4 text-ink3">{children}</div>
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
      className={`flex min-h-[100px] cursor-pointer items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-5 py-4 text-center transition-all duration-200 ${
        has
          ? "border-[#4ba391]/30 bg-[#4ba391]/5 text-[#4ba391]"
          : hov
            ? "border-vintage-gold/30 bg-vintage-gold/5 text-ink2"
            : "border-black/10 bg-black/5 text-ink3"
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
        className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
          has
            ? "border-[#4ba391]/20 bg-white"
            : hov ? "border-vintage-gold/20 bg-white" : "border-black/5 bg-white"
        }`}
      >
        <Emoji symbol={has ? "✅" : "📎"} size={20} />
      </div>
      <div className="min-w-0">
        <div className="text-[15px] font-bold leading-tight">
          {has
            ? multi
              ? `${files.length} selected`
              : file.name
            : label}
        </div>
        {!has && <div className="mt-1 text-[12px] font-medium text-ink4">Click or drag to upload</div>}
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
      className={`w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-[14px] font-medium text-ink2 outline-none transition-all placeholder:text-ink4 focus:ring-4 focus:ring-black/5 ${className}`}
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
      className={`w-full cursor-pointer rounded-xl border border-black/10 bg-white px-4 py-3 text-[14px] font-medium text-ink2 outline-none transition-all focus:ring-4 focus:ring-black/5 ${className}`}
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
      ? "border-[#4ba391]/20 bg-[#4ba391]/5 text-[#4ba391]"
      : type === "err"
        ? "border-red-500/20 bg-red-500/5 text-red-600"
        : "border-black/10 bg-black/5 text-ink3";

  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px] font-bold leading-relaxed animate-fade-in ${styles}`}>
      <Emoji symbol={type === "ok" ? "✅" : type === "err" ? "✕" : "⏳"} size={16} />
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
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[15px] font-bold transition-all ${
        isDisabled
          ? "cursor-not-allowed bg-black/5 text-ink4"
          : "cursor-pointer bg-ink2 text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
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
        className={`mb-2 flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-3 transition-all ${
          active
            ? "border-ink2/20 bg-white shadow-lg scale-[1.02]"
            : hov
              ? "border-black/5 bg-white/50"
              : "border-transparent bg-transparent"
        }`}
      >
        <div
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border bg-white ${
            active
              ? "border-ink2/20 text-ink2"
              : "border-black/10 text-ink3"
          }`}
        >
          <Emoji symbol={doc.type === "pdf" ? "📄" : "📝"} size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className={`truncate text-[14px] font-bold ${active ? "text-ink2" : "text-ink3"}`}>
            {doc.name}
          </div>
          <div className="mt-0.5 text-[12px] font-medium text-ink4">
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
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink4 hover:text-red-500 transition-colors shadow-sm"
          >
            <Emoji symbol="✕" size={14} />
          </button>
        )}
      </div>
    </Tip>
  );
}
