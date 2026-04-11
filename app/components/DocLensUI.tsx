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
          className={`pointer-events-none absolute z-[9000] max-w-[260px] rounded-xl bg-[#16162a]/95 backdrop-blur-xl border border-white/[0.1] px-3.5 py-2.5 text-[11px] font-medium leading-relaxed text-[#e4e4ef] shadow-2xl animate-fade-in-scale ${pos[side]}`}
        >
          {tip}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#7c6aff]/5 to-transparent pointer-events-none" />
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
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-2xl bg-[#0e0e18]/95 backdrop-blur-2xl border border-white/[0.1] px-6 py-4 text-[13px] font-semibold text-white shadow-2xl transition-all duration-500 ${
        entering ? "translate-y-4 opacity-0 scale-95" : "translate-y-0 opacity-100 scale-100"
      }`}
    >
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#00d4aa]/15 text-[#00d4aa]">
        <UIcon name="CheckCircle2" size={18} />
        <div className="absolute inset-0 rounded-xl bg-[#00d4aa]/10 animate-glow-pulse" />
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
    <div className="mb-7 flex items-center gap-4 animate-fade-in">
      <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7c6aff]/10 border border-[#7c6aff]/15 text-[#7c6aff] transition-all duration-300 hover:bg-[#7c6aff]/15 hover:border-[#7c6aff]/25 hover:scale-105">
        {typeof ico === "string" ? <UIcon emoji={ico} size={18} /> : ico}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-display text-[17px] font-bold text-white tracking-tight">{label}</div>
        {sub && (
          <div className="text-[13px] text-[#6b6d80] font-medium mt-0.5">{sub}</div>
        )}
      </div>
      <div className="hidden lg:block flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
    </div>
  );
}

export function SCard({ children, style = {} }: any) {
  return (
    <div
      className="vintage-card p-5 transition-all duration-400 hover:-translate-y-1 hover:border-white/[0.12]"
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
  accentCol = "#7c6aff",
  children,
  className = "",
  bodyClassName = "",
}: any) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`vintage-card group relative flex h-full flex-col gap-4 overflow-hidden p-6 transition-all duration-400 hover:-translate-y-1.5 hover:border-white/[0.12] ${className}`}
    >
      {/* Cursor spotlight */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[22px]"
        style={{
          background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, ${accentCol}12, transparent 60%)`,
        }}
      />

      <div className="relative z-10 flex items-start gap-3.5">
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
          style={{
            borderColor: `${accentCol}25`,
            background: `${accentCol}10`,
            color: accentCol,
            boxShadow: `0 4px 16px ${accentCol}15`,
          }}
        >
          {typeof ico === "string" ? <UIcon emoji={ico} size={18} /> : ico}
        </div>
        <div className="min-w-0">
          <div className="font-display text-[16px] font-bold text-white tracking-tight">{title}</div>
          {desc ? (
            <div className="mt-0.5 text-[12px] font-medium leading-relaxed text-[#6b6d80]">
              {desc}
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 h-px bg-gradient-to-r from-white/[0.06] via-white/[0.03] to-transparent" />

      <div className={`relative z-10 flex flex-1 flex-col gap-3 text-[#9294a5] ${bodyClassName}`}>
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
      className={`relative flex min-h-[88px] cursor-pointer items-center justify-center gap-3.5 rounded-2xl border-2 border-dashed px-5 py-4 text-center transition-all duration-300 overflow-hidden ${
        has
          ? "border-[#00d4aa]/30 bg-[#00d4aa]/[0.04] text-[#00d4aa]"
          : dragOver
            ? "border-[#7c6aff]/40 bg-[#7c6aff]/[0.06] text-white scale-[1.01]"
            : hov
              ? "border-[#7c6aff]/25 bg-[#7c6aff]/[0.03] text-white"
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

      {/* Animated border shimmer */}
      {!has && hov && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
          <div className="absolute -inset-[100%] animate-spin-slow bg-gradient-conic from-[#7c6aff]/0 via-[#7c6aff]/15 to-[#7c6aff]/0" style={{ animationDuration: "8s" }} />
        </div>
      )}

      <div
        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 ${
          has
            ? "border-[#00d4aa]/20 bg-[#00d4aa]/10 shadow-lg shadow-[#00d4aa]/10"
            : hov ? "border-[#7c6aff]/20 bg-[#7c6aff]/10" : "border-white/[0.06] bg-white/[0.03]"
        }`}
      >
        <UIcon name={has ? "CheckCircle2" : "Paperclip"} size={17} />
      </div>
      <div className="relative z-10 min-w-0 text-left">
        <div className="text-[13px] font-semibold leading-tight">
          {has
            ? multi
              ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
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
      className={`w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] font-medium text-white outline-none transition-all duration-300 placeholder:text-[#6b6d80] focus:ring-2 focus:ring-[#7c6aff]/25 focus:border-[#7c6aff]/35 focus:bg-white/[0.04] hover:border-white/[0.12] ${className}`}
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
      className={`w-full cursor-pointer rounded-xl border border-white/[0.08] bg-[#0e0e18] px-4 py-3 text-[13px] font-medium text-white outline-none transition-all duration-300 focus:ring-2 focus:ring-[#7c6aff]/25 focus:border-[#7c6aff]/35 hover:border-white/[0.12] ${className}`}
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
      className={`group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl px-4 py-3.5 text-[13px] font-bold transition-all duration-300 ${
        isDisabled
          ? "cursor-not-allowed bg-white/[0.04] text-[#6b6d80] border border-white/[0.04]"
          : "cursor-pointer bg-gradient-to-r from-[#7c6aff] to-[#5b4bcf] text-white shadow-lg shadow-[#7c6aff]/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#7c6aff]/30 active:translate-y-0 active:scale-[0.98]"
      } ${className}`}
    >
      {/* Sweep animation */}
      {!isDisabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
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
            ? "border-[#7c6aff]/20 bg-[#7c6aff]/[0.06] shadow-lg shadow-[#7c6aff]/5"
            : hov
              ? "border-white/[0.06] bg-white/[0.03]"
              : "border-transparent bg-transparent"
        }`}
      >
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
            active
              ? "border-[#7c6aff]/20 bg-[#7c6aff]/10 text-[#7c6aff] shadow-md shadow-[#7c6aff]/10"
              : "border-white/[0.06] bg-white/[0.03] text-[#9294a5]"
          }`}
        >
          <UIcon name={doc.type === "pdf" ? "FileText" : "FileSignature"} size={16} />
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
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-[#6b6d80] hover:text-[#ff6b6b] hover:bg-[#ff6b6b]/10 transition-all duration-200"
          >
            <UIcon name="X" size={12} />
          </button>
        )}
      </div>
    </Tip>
  );
}
