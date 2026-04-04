/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { fmtSize } from "../lib/utils";
import { Emoji } from "./Icons";

export function Tip({ children, tip, side = "top" }: any) {
  const [show, setShow] = useState(false);
  const pos: any = {
    top: "bottom-[calc(100%+14px)] left-1/2 -translate-x-1/2",
    bottom: "top-[calc(100%+14px)] left-1/2 -translate-x-1/2",
    right: "left-[calc(100%+14px)] top-1/2 -translate-y-1/2",
    left: "right-[calc(100%+14px)] top-1/2 -translate-y-1/2",
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && tip && (
        <div
          className={`pointer-events-none absolute z-[9000] max-w-[280px] rounded-2xl border border-white/12 bg-[rgba(20,18,14,.94)] px-3.5 py-2 text-[12px] font-medium leading-relaxed text-white shadow-[0_18px_44px_rgba(0,0,0,.26)] backdrop-blur-md animate-slide-down ${pos[side]}`}
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
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-[22px] border border-[rgba(42,34,24,.12)] bg-[rgba(252,250,247,.94)] px-5 py-3.5 text-[14px] font-semibold text-ink2 shadow-[0_24px_60px_rgba(26,20,14,.14)] backdrop-blur-xl animate-stamp-in">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(31,90,86,.12)] text-teal">
        <Emoji symbol="✅" size={18} />
      </div>
      {msg}
    </div>
  );
}

export function Spinner() {
  return (
    <span className="mr-2 inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin-slow align-middle" />
  );
}

export function SHead({ ico, label, sub }: any) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(42,34,24,.12)] bg-white/80 text-amber shadow-[0_16px_34px_rgba(33,25,16,.08)]">
          {typeof ico === "string" ? <Emoji symbol={ico} size={24} /> : ico}
        </div>
        <div>
          <div className="page-kicker mb-3">OneDocs Workspace</div>
          <div className="font-caveat text-[34px] font-semibold leading-none tracking-[-0.03em] text-ink2">
            {label}
          </div>
          {sub && (
            <div className="mt-2 max-w-[640px] text-[15px] leading-relaxed text-ink4">
              {sub}
            </div>
          )}
        </div>
      </div>
      <div className="premium-divider hidden flex-1 lg:block" />
    </div>
  );
}

export function SCard({ children, style = {} }: any) {
  return (
    <div className="surface-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_56px_rgba(33,25,16,.12)]" style={style}>
      {children}
    </div>
  );
}

export function CCard({ ico, title, desc, accentCol = "#ba8a42", children }: any) {
  return (
    <div className="surface-card group flex h-full flex-col gap-5 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(33,25,16,.12)]">
      <div
        className="absolute inset-x-6 top-0 h-[2px] rounded-full opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${accentCol}, transparent)` }}
      />
      <div className="flex items-start gap-4">
        <div
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border bg-white/85 shadow-[0_16px_32px_rgba(33,25,16,.08)]"
          style={{ borderColor: `${accentCol}30`, color: accentCol }}
        >
          {typeof ico === "string" ? <Emoji symbol={ico} size={24} /> : ico}
        </div>
        <div className="min-w-0">
          <div className="font-caveat text-[24px] font-semibold leading-[1.05] tracking-[-0.02em] text-ink2">
            {title}
          </div>
          <div className="mt-2 text-[14px] leading-relaxed text-ink4">{desc}</div>
        </div>
      </div>
      <div className="premium-divider" />
      <div className="flex flex-1 flex-col gap-3 text-ink3">{children}</div>
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
      className={`flex min-h-[84px] cursor-pointer items-center justify-center gap-3 rounded-[22px] border border-dashed px-5 py-4 text-center transition-all duration-200 ${
        has
          ? "border-teal/35 bg-[rgba(31,90,86,.07)] text-teal"
          : hov
            ? "border-amber/45 bg-[rgba(186,138,66,.06)] text-amber2"
            : "border-[rgba(42,34,24,.16)] bg-white/55 text-ink3"
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
        className={`flex h-10 w-10 items-center justify-center rounded-full border ${
          has
            ? "border-teal/25 bg-white/80"
            : "border-[rgba(42,34,24,.1)] bg-white/75"
        }`}
      >
        <Emoji symbol={has ? "✅" : "📎"} size={18} />
      </div>
      <div className="min-w-0">
        <div className="text-[15px] font-semibold leading-tight">
          {has
            ? multi
              ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
              : file.name
            : label}
        </div>
        <div className="mt-1 text-[12px] text-ink4">
          {has ? "Ready for conversion" : "Drop, browse, and continue"}
        </div>
      </div>
    </label>
  );

  return tip ? (
    <Tip tip={tip} side="right">
      {el}
    </Tip>
  ) : (
    el
  );
}

export function HInput({ className = "", ...props }: any) {
  return (
    <input
      {...props}
      className={`w-full rounded-[18px] border border-[rgba(42,34,24,.12)] bg-white/78 px-4 py-3 text-[14px] text-ink outline-none transition-all duration-200 placeholder:text-ink4 focus:border-amber/40 focus:bg-white focus:shadow-[0_0_0_4px_rgba(186,138,66,.12)] ${className}`}
    />
  );
}

export function HSel({ className = "", children, ...props }: any) {
  return (
    <select
      {...props}
      className={`w-full cursor-pointer rounded-[18px] border border-[rgba(42,34,24,.12)] bg-white/78 px-4 py-3 text-[14px] text-ink outline-none transition-all duration-200 focus:border-amber/40 focus:bg-white focus:shadow-[0_0_0_4px_rgba(186,138,66,.12)] ${className}`}
    >
      {children}
    </select>
  );
}

export function CStat({ msg, type }: any) {
  if (!msg) return null;

  const styles =
    type === "ok"
      ? "border-teal/20 bg-[rgba(31,90,86,.07)] text-teal"
      : type === "err"
        ? "border-red/20 bg-[rgba(163,75,66,.08)] text-red"
        : "border-amber/20 bg-[rgba(186,138,66,.07)] text-amber2";

  return (
    <div className={`flex items-start gap-2 rounded-[18px] border px-4 py-3 text-[13px] leading-relaxed ${styles}`}>
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
      className={`flex w-full items-center justify-center gap-2 rounded-[20px] px-5 py-3 text-[15px] font-semibold transition-all duration-200 ${
        isDisabled
          ? "cursor-not-allowed border border-[rgba(42,34,24,.08)] bg-[rgba(255,255,255,.45)] text-ink4"
          : "cursor-pointer border border-amber2/30 bg-gradient-to-r from-amber to-amber2 text-white shadow-[0_18px_30px_rgba(186,138,66,.24)] hover:-translate-y-0.5 hover:shadow-[0_22px_36px_rgba(186,138,66,.28)]"
      }`}
    >
      {loading && <Spinner />}
      {label}
    </button>
  );

  return tip ? <Tip tip={tip}>{btn}</Tip> : btn;
}

export function DItem({ doc, active, onSelect, onRemove }: any) {
  const [hov, setHov] = useState(false);

  return (
    <Tip tip={`${doc.name} · ${fmtSize(doc.size)}`} side="right">
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onClick={onSelect}
        className={`mb-2 flex cursor-pointer items-center gap-3 rounded-[22px] border px-3 py-3 transition-all duration-200 ${
          active
            ? "border-amber/30 bg-[rgba(186,138,66,.08)] shadow-[0_12px_28px_rgba(186,138,66,.08)]"
            : hov
              ? "border-[rgba(42,34,24,.12)] bg-white/70"
              : "border-transparent bg-transparent"
        }`}
      >
        <div
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border ${
            active
              ? "border-amber/20 bg-white text-amber"
              : "border-[rgba(42,34,24,.08)] bg-white/70 text-ink3"
          }`}
        >
          <Emoji symbol={doc.type === "pdf" ? "📄" : "📝"} size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className={`truncate text-[14px] ${active ? "font-semibold text-ink2" : "text-ink3"}`}>
            {doc.name}
          </div>
          <div className="mt-1 text-[12px] text-ink4">
            {fmtSize(doc.size)}
            {doc.pages ? ` · ${doc.pages} pages` : ""}
          </div>
        </div>
        {hov && (
          <Tip tip="Remove" side="left">
            <button
              onClick={(e: any) => {
                e.stopPropagation();
                onRemove();
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(42,34,24,.08)] bg-white/75 text-ink4 transition-colors hover:text-red"
            >
              <Emoji symbol="✕" size={14} />
            </button>
          </Tip>
        )}
      </div>
    </Tip>
  );
}
