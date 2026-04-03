import React, { useState, useEffect } from "react";
import { fmtSize } from "../lib/utils";

export function Tip({ children, tip, side="top" }: any) {
  const [show, setShow] = useState(false);
  const pos: any = {
    top: "bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2",
    bottom: "top-[calc(100%+10px)] left-1/2 -translate-x-1/2",
    right: "left-[calc(100%+10px)] top-1/2 -translate-y-1/2",
    left: "right-[calc(100%+10px)] top-1/2 -translate-y-1/2"
  };
  const arrowBg: any = {
    top: "-bottom-[5px] left-1/2 -ml-1 border-l-[1.5px] border-b-[1.5px] border-[rgba(30,15,5,.35)]",
    bottom: "-top-[5px] left-1/2 -ml-1 border-l-[1.5px] border-t-[1.5px] border-[rgba(30,15,5,.35)]",
    right: "-left-[5px] top-1/2 -mt-1 border-l-[1.5px] border-b-[1.5px] border-[rgba(30,15,5,.35)]",
    left: "-right-[5px] top-1/2 -mt-1 border-r-[1.5px] border-b-[1.5px] border-[rgba(30,15,5,.35)]"
  };
  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && tip && (
        <div className={`absolute z-[9000] bg-[#fdf8e8] border-[1.5px] border-[rgba(30,15,5,.32)] rounded-[2px_8px_5px_6px] py-1.5 px-3 whitespace-nowrap font-caveat text-sm font-semibold text-ink2 pointer-events-none animate-slide-down shadow-[2px_3px_0_rgba(30,15,5,.1)] -rotate-[0.4deg] ${pos[side]}`}>
          <div className={`absolute w-[7px] h-[7px] bg-[#fdf8e8] rotate-45 ${arrowBg[side]}`} />
          {tip}
        </div>
      )}
    </div>
  );
}

export function Toast({ msg, onDone }: any) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed bottom-7 right-7 z-[9999] bg-paper border-[2.5px] border-ink2 rounded-[3px_12px_5px_10px] py-3 px-[22px] font-caveat text-[17px] font-bold text-ink2 shadow-[3px_4px_0_rgba(30,15,5,.18),5px_6px_0_rgba(30,15,5,.08)] animate-stamp-in flex items-center gap-2.5 -rotate-[0.5deg]">
      <span className="text-[20px] text-teal">✓</span>{msg}
    </div>
  );
}

export function Spinner() {
  return <span className="inline-block w-[14px] h-[14px] border-[2.5px] border-paper3 border-t-amber rounded-full animate-spin-slow align-middle mr-[7px]" />;
}

export function SHead({ ico, label, sub }: any) {
  return (
    <div className="flex items-center gap-[14px] mb-[20px]">
      <span className="text-[22px] -rotate-[4deg] inline-block">{ico}</span>
      <div>
        <div className="font-caveat text-[24px] font-bold text-ink2 leading-none relative inline-block">
          {label}
          <svg className="absolute -bottom-1 left-0 w-full h-[6px] overflow-visible" viewBox="0 0 100 6" preserveAspectRatio="none">
            <path d="M2,4 Q25,1 50,3.5 Q75,6 98,2" stroke="var(--color-amber)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        {sub && <div className="font-patrick text-[12px] text-ink4 mt-[3px]">{sub}</div>}
      </div>
      <div className="flex-1 border-t-[1.5px] border-dashed border-[rgba(100,70,40,.22)] mt-[2px]" />
    </div>
  );
}

export function SCard({ children, rotate=0, tape=false, style={} }: any) {
  const [hov, setHov] = useState(false);
  return (
    <div className="relative" style={{ paddingTop: tape ? 14 : 0, ...style }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {tape && <div className="absolute top-0 left-1/2 -translate-x-1/2 -rotate-[1.2deg] w-[52px] h-[17px] bg-[rgba(255,240,155,.78)] border border-[rgba(210,175,55,.4)] rounded-[2px] z-[1] shadow-[0_1px_3px_rgba(0,0,0,.09)]" />}
      <div className={`relative bg-paper border-2 border-[rgba(60,35,10,.38)] transition-all duration-200 p-[18px] ${hov ? "rounded-[5px_18px_6px_16px] shadow-[4px_5px_0_rgba(30,15,5,.14),6px_7px_0_rgba(30,15,5,.06)]" : "rounded-[4px_14px_5px_13px] shadow-[2px_3px_0_rgba(30,15,5,.1)]"}`} style={{ transform: `rotate(${rotate}deg)` }}>
        <div className={`absolute -inset-[3px] border border-[rgba(60,35,10,.15)] pointer-events-none transition-all duration-200 ${hov ? "rounded-[7px_22px_8px_20px]" : "rounded-[6px_18px_7px_17px]"}`} />
        {children}
      </div>
    </div>
  );
}

export function CCard({ ico, title, desc, accentCol="#c07818", rot=0, children }: any) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className={`relative bg-paper border-2 rounded-[4px_14px_5px_13px] p-[18px] flex flex-col gap-[11px] transition-all duration-200 ${hov ? "border-ink2 !rounded-[4px_20px_6px_18px] !rotate-0 !-translate-y-[2px] shadow-[4px_6px_0_rgba(30,15,5,.16),7px_9px_0_rgba(30,15,5,.07)]" : "border-[rgba(60,35,10,.38)] shadow-[2px_3px_0_rgba(30,15,5,.1)]"}`}
      style={{ transform: hov ? undefined : `rotate(${rot}deg)` }}>
      <div className="absolute top-[9px] right-[11px] w-[9px] h-[9px] rounded-full opacity-[0.55]" style={{ background: accentCol }} />
      <div className="absolute -inset-[3px] border border-[rgba(60,35,10,.14)] rounded-[6px_18px_7px_17px] pointer-events-none" />
      <div className="flex items-start gap-[12px]">
        <span className="text-[24px] flex-shrink-0 inline-block transition-transform duration-200" style={{ transform: `rotate(${hov ? -5 : 0}deg)` }}>{ico}</span>
        <div>
          <div className="font-caveat text-[19px] font-bold text-ink2 mb-[3px] leading-[1.1]">{title}</div>
          <div className="font-patrick text-[13px] text-ink4 leading-[1.4]">{desc}</div>
        </div>
      </div>
      <div className="flex flex-col gap-[9px]">{children}</div>
    </div>
  );
}

export function FZone({ accept, label, multi, file, files, onFile, onFiles, tip }: any) {
  const [hov, setHov] = useState(false);
  const has = multi ? (files?.length > 0) : !!file;
  const el = (
    <label onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className={`block cursor-pointer transition-all duration-200 text-center py-[11px] px-[14px] font-caveat text-[15px] border-2 border-dashed rounded-[3px_12px_5px_10px] overflow-hidden whitespace-nowrap text-ellipsis ${has ? "font-bold text-teal border-teal bg-[rgba(26,92,92,.05)]" : hov ? "font-normal text-amber2 border-amber bg-[rgba(192,120,24,.04)]" : "font-normal text-ink3 border-[rgba(100,70,40,.28)] bg-transparent"}`}>
      <input type="file" accept={accept} multiple={multi} className="hidden" onChange={e => multi ? onFiles(Array.from(e.target.files || [])) : onFile?.(e.target.files?.[0])} />
      {has ? (multi ? `✓ ${files.length} file${files.length > 1 ? "s" : ""} selected` : `✓ ${file.name}`) : `📎 ${label}`}
    </label>
  );
  return tip ? <Tip tip={tip} side="right">{el}</Tip> : el;
}

export function HInput(props: any) {
  return <input {...props} className={`bg-paper2 border-[1.5px] border-[rgba(100,70,40,.38)] rounded-[2px_8px_3px_7px] py-[8px] px-[11px] text-ink font-patrick text-[14px] outline-none w-full ${props.className || ""}`} />;
}

export function HSel({ value, onChange, children, className }: any) {
  return <select value={value} onChange={onChange} className={`bg-paper2 border-[1.5px] border-[rgba(100,70,40,.38)] rounded-[2px_8px_3px_7px] py-[8px] px-[11px] text-ink font-patrick text-[14px] outline-none w-full cursor-pointer ${className || ""}`}>{children}</select>;
}

export function CStat({ msg, type }: any) {
  if (!msg) return null;
  const c = type === "ok" ? "text-teal" : type === "err" ? "text-red" : "text-ink4";
  return <div className={`font-caveat text-[14px] flex items-center gap-[5px] ${c}`}><span>{type === "ok" ? "✓" : type === "err" ? "✗" : "→"}</span>{msg}</div>;
}

export function HBtn({ onClick, disabled, loading, label, tip }: any) {
  const [hov, setHov] = useState(false);
  const isDisabled = disabled || loading;
  const btn = (
    <button onClick={onClick} disabled={isDisabled} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className={`py-[10px] px-[18px] border-2 border-amber2 rounded-[3px_10px_4px_9px] font-caveat text-[16px] font-bold w-full transition-all duration-150 flex items-center justify-center gap-[6px] tracking-[0.3px] ${isDisabled ? "cursor-not-allowed bg-paper2 text-ink4 opacity-[0.55]" : hov ? "cursor-pointer bg-amber2 text-white opacity-100 -translate-x-[1px] -translate-y-[1px] shadow-[3px_3px_0_rgba(30,15,5,.2)]" : "cursor-pointer bg-amber text-white opacity-100 shadow-[2px_2px_0_rgba(30,15,5,.12)]"}`}>
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
        className={`flex items-center gap-[10px] py-[9px] px-[11px] cursor-pointer mb-1 rounded-[3px_10px_4px_9px] transition-all duration-150 border-[1.5px] ${active ? "border-amber bg-[rgba(192,120,24,.09)]" : hov ? "border-[rgba(100,70,40,.28)] bg-[rgba(100,70,40,.04)] rotate-[0.3deg]" : "border-transparent bg-transparent"}`}>
        <span className={`text-[20px] flex-shrink-0 transition-transform duration-150 ${active ? "scale-[1.15]" : ""}`}>{doc.type === "pdf" ? "📄" : "📝"}</span>
        <div className="flex-1 min-w-0">
          <div className={`font-patrick text-[13px] whitespace-nowrap overflow-hidden text-ellipsis ${active ? "font-bold text-amber2" : "font-normal text-ink"}`}>{doc.name}</div>
          <div className="font-patrick text-[11px] text-ink4 mt-[1px]">{fmtSize(doc.size)}{doc.pages ? ` · ${doc.pages}p` : ""}</div>
        </div>
        {hov && (
          <Tip tip="Remove" side="left">
            <button onClick={(e: any) => { e.stopPropagation(); onRemove(); }} className="bg-transparent border-none text-ink4 cursor-pointer text-[16px] leading-none py-[2px] px-[5px] rounded-[4px] hover:text-red">✕</button>
          </Tip>
        )}
      </div>
    </Tip>
  );
}
