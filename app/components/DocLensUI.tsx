"use client";

import React, { useState, useEffect } from "react";
import { fmtSize } from "../lib/utils";
import { Emoji } from "./Icons";

export function Tip({ children, tip, side="top" }: any) {
  const [show, setShow] = useState(false);
  const pos: any = {
    top: "bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2",
    bottom: "top-[calc(100%+8px)] left-1/2 -translate-x-1/2",
    right: "left-[calc(100%+8px)] top-1/2 -translate-y-1/2",
    left: "right-[calc(100%+8px)] top-1/2 -translate-y-1/2"
  };
  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && tip && (
        <div className={`absolute z-[9000] bg-ink border border-paper3 shadow-lg rounded-md py-1.5 px-3 whitespace-nowrap text-xs font-medium text-paper pointer-events-none animate-slide-down ${pos[side]}`}>
          {tip}
        </div>
      )}
    </div>
  );
}

export function Toast({ msg, onDone }: any) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed bottom-6 right-6 z-[9999] bg-paper2 border border-paper3 rounded-lg py-3 px-5 text-[15px] font-medium text-ink shadow-xl animate-stamp-in flex items-center gap-3">
      <Emoji symbol="✅" size={20} className="text-teal" />{msg}
    </div>
  );
}

export function Spinner() {
  return <span className="inline-block w-4 h-4 border-2 border-paper3 border-t-amber rounded-full animate-spin-slow align-middle mr-2" />;
}

export function SHead({ ico, label, sub }: any) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-paper2 border border-paper3 shadow-sm">
        {typeof ico === 'string' ? <Emoji symbol={ico} size={22} className="text-ink" /> : ico}
      </div>
      <div>
        <div className="text-2xl font-bold text-ink leading-none">
          {label}
        </div>
        {sub && <div className="text-sm text-ink4 mt-1.5">{sub}</div>}
      </div>
      <div className="flex-1 border-t border-paper3 mt-1 ml-4" />
    </div>
  );
}

export function SCard({ children, rotate=0, tape=false, style={} }: any) {
  const [hov, setHov] = useState(false);
  return (
    <div className="relative" style={style} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div className={`relative bg-paper2 border border-paper3 transition-all duration-300 p-5 rounded-xl ${hov ? "shadow-md -translate-y-1" : "shadow-sm"}`}>
        {children}
      </div>
    </div>
  );
}

export function CCard({ ico, title, desc, accentCol="#3b82f6", rot=0, children }: any) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className={`relative bg-paper2 border transition-all duration-300 rounded-xl p-5 flex flex-col gap-4 ${hov ? "border-amber -translate-y-1 shadow-md shadow-amber/10" : "border-paper3 shadow-sm"}`}>
      <div className="absolute top-3 right-3 w-2 h-2 rounded-full opacity-60" style={{ background: accentCol }} />
      <div className="flex items-start gap-4">
        <div className={`flex items-center justify-center w-12 h-12 rounded-lg transition-colors border ${hov ? 'bg-amber/10 border-amber/20 text-amber' : 'bg-paper3 border-transparent text-ink3'}`}>
          {typeof ico === 'string' ? <Emoji symbol={ico} size={24} /> : ico}
        </div>
        <div>
          <div className="text-lg font-bold text-ink mb-1 leading-tight transition-colors" style={{ color: hov ? accentCol : undefined }}>{title}</div>
          <div className="text-[13px] text-ink4 leading-relaxed">{desc}</div>
        </div>
      </div>
      <div className="flex text-ink3 flex-col gap-3 mt-1">{children}</div>
    </div>
  );
}

export function FZone({ accept, label, multi, file, files, onFile, onFiles, tip }: any) {
  const [hov, setHov] = useState(false);
  const has = multi ? (files?.length > 0) : !!file;
  const el = (
    <label onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className={`block cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 text-center py-3 px-4 text-sm border-2 border-dashed rounded-lg overflow-hidden whitespace-nowrap text-ellipsis ${has ? "font-semibold text-teal border-teal/40 bg-teal/5" : hov ? "text-amber border-amber/40 bg-amber/5" : "text-ink3 border-paper3 bg-transparent"}`}>
      <input type="file" accept={accept} multiple={multi} className="hidden" onChange={e => multi ? onFiles(Array.from(e.target.files || [])) : onFile?.(e.target.files?.[0])} />
      {has ? <Emoji symbol="✅" size={16} /> : <Emoji symbol="📎" size={16} />}
      {has ? (multi ? `${files.length} file${files.length > 1 ? "s" : ""} selected` : file.name) : label}
    </label>
  );
  return tip ? <Tip tip={tip} side="right">{el}</Tip> : el;
}

export function HInput(props: any) {
  return <input {...props} className={`bg-paper border border-paper3 focus:border-amber focus:ring-1 focus:ring-amber/50 rounded-lg py-2.5 px-3 text-ink text-sm outline-none w-full transition-all duration-200 ${props.className || ""}`} />;
}

export function HSel({ value, onChange, children, className }: any) {
  return <select value={value} onChange={onChange} className={`bg-paper border border-paper3 focus:border-amber focus:ring-1 focus:ring-amber/50 rounded-lg py-2.5 px-3 text-ink text-sm outline-none w-full cursor-pointer transition-all duration-200 ${className || ""}`}>{children}</select>;
}

export function CStat({ msg, type }: any) {
  if (!msg) return null;
  const c = type === "ok" ? "text-teal" : type === "err" ? "text-red" : "text-amber";
  return <div className={`text-[13px] font-medium flex items-center gap-1.5 ${c}`}><Emoji symbol={type === "ok" ? "✅" : type === "err" ? "✕" : "🔄"} size={14} />{msg}</div>;
}

export function HBtn({ onClick, disabled, loading, label, tip }: any) {
  const [hov, setHov] = useState(false);
  const isDisabled = disabled || loading;
  const btn = (
    <button onClick={onClick} disabled={isDisabled} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className={`py-2.5 px-4 rounded-lg text-[14px] font-semibold w-full transition-all duration-200 flex items-center justify-center gap-2 ${isDisabled ? "cursor-not-allowed bg-paper3 text-ink4" : "cursor-pointer bg-amber hover:bg-amber2 text-white shadow-sm hover:shadow"}`}>
      {loading && <Spinner />}{label}
    </button>
  );
  return tip ? <Tip tip={tip}>{btn}</Tip> : btn;
}

export function DItem({ doc, active, onSelect, onRemove }: any) {
  const [hov, setHov] = useState(false);
  return (
    <Tip tip={`${doc.name} · ${fmtSize(doc.size)}`} side="right">
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onSelect}
        className={`flex items-center gap-3 py-2.5 px-3 cursor-pointer mb-2 rounded-lg transition-all border ${active ? "border-amber bg-amber/10 shadow-sm" : hov ? "border-paper3 bg-paper3" : "border-transparent bg-transparent"}`}>
        <div className={`flex items-center justify-center w-8 h-8 rounded-md bg-paper border border-paper3 flex-shrink-0 transition-transform ${active ? "text-amber" : "text-ink3"}`}><Emoji symbol={doc.type === "pdf" ? "📄" : "📝"} size={16} /></div>
        <div className="flex-1 min-w-0">
          <div className={`text-[13px] whitespace-nowrap overflow-hidden text-ellipsis ${active ? "font-semibold text-ink" : "text-ink2"}`}>{doc.name}</div>
          <div className="text-[11px] text-ink4 mt-0.5">{fmtSize(doc.size)}{doc.pages ? ` · ${doc.pages}p` : ""}</div>
        </div>
        {hov && (
          <Tip tip="Remove" side="left">
            <button onClick={(e: any) => { e.stopPropagation(); onRemove(); }} className="bg-transparent border-none text-ink4 cursor-pointer flex items-center justify-center p-1 rounded-md hover:bg-paper hover:text-red transition-all"><Emoji symbol="✕" size={14} /></button>
          </Tip>
        )}
      </div>
    </Tip>
  );
}
