"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { UIcon } from "./components/Icons";

/* ─── Tool data ─── */
const tools = [
  {
    href: "/analyze",
    icon: "NavAnalyze",
    label: "Analyze",
    tagline: "Deep document intelligence",
    desc: "Extract text, search content, and generate insights from PDFs & DOCX files with OCR fallback.",
    gradient: "from-[#10b981] to-[#34d399]",
    glow: "rgba(16, 185, 129, 0.15)",
    accent: "#10b981",
    features: ["Text extraction", "OCR fallback", "Document insights"],
  },
  {
    href: "/pdf-tools",
    icon: "NavPdfTools",
    label: "PDF Suite",
    tagline: "Complete PDF toolkit",
    desc: "Convert, merge, split, rotate, compress, redact, lock, and overlay — 20+ tools in one place.",
    gradient: "from-[#f97316] to-[#fb923c]",
    glow: "rgba(249, 115, 22, 0.15)",
    accent: "#f97316",
    features: ["Merge & split", "Compress", "Lock & unlock"],
  },
  {
    href: "/docx-tools",
    icon: "NavDocxTools",
    label: "Word Tools",
    tagline: "Word document converter",
    desc: "Export DOCX to HTML, plain text, markdown, PDF preview, and CSV to HTML tables instantly.",
    gradient: "from-[#f59e0b] to-[#fbbf24]",
    glow: "rgba(245, 158, 11, 0.15)",
    accent: "#f59e0b",
    features: ["DOCX to HTML", "Markdown export", "CSV tables"],
  },
  {
    href: "/pdf-link",
    icon: "NavPdfLink",
    label: "PDF Link",
    tagline: "Instant shareable links",
    desc: "Upload a PDF and instantly get a shareable viewer link — no accounts, no friction.",
    gradient: "from-[#14b8a6] to-[#2dd4bf]",
    glow: "rgba(20, 184, 166, 0.15)",
    accent: "#14b8a6",
    features: ["Instant share", "Viewer link", "No sign-up"],
  },
] as const;

/* ─── Marquee features ─── */
const marqueeItems = [
  "Merge PDF", "Split PDF", "Compress PDF", "OCR", "DOCX to HTML",
  "Redact PDF", "Rotate Pages", "Lock PDF", "Text Extraction",
  "Image Export", "Compare PDFs", "PDF Overlay", "Page Numbers", "Web Optimize",
];

/* ─── Steps ─── */
const steps = [
  { num: "01", title: "Pick a tool", desc: "Choose from 20+ document tools.", icon: "LayoutGrid", accent: "#10b981" },
  { num: "02", title: "Drop your file", desc: "Drag & drop or browse. PDF, DOCX, images.", icon: "Upload", accent: "#f59e0b" },
  { num: "03", title: "Download results", desc: "Instant processing, all in-browser.", icon: "Download", accent: "#f97316" },
];

/* ─── Reveal hook ─── */
function useReveal(delay = 0) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setVisible(true), delay); observer.disconnect(); }
    }, { threshold: 0.15 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);
  return { ref, visible };
}

/* ─── Animated counter ─── */
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const dur = 1400, t0 = performance.now();
        function tick(now: number) {
          const p = Math.min((now - t0) / dur, 1);
          setCount(Math.round((1 - Math.pow(1 - p, 3)) * end));
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Tool card ─── */
function ToolCard({ tool, index }: { tool: (typeof tools)[number]; index: number }) {
  const [mp, setMp] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLAnchorElement>(null);
  const reveal = useReveal(index * 100);
  return (
    <div ref={reveal.ref}>
      <Link
        ref={cardRef}
        href={tool.href}
        onMouseMove={(e) => { if (!cardRef.current) return; const r = cardRef.current.getBoundingClientRect(); setMp({ x: e.clientX - r.left, y: e.clientY - r.top }); }}
        className={`group relative flex flex-col h-full rounded-[22px] bg-white/[0.025] backdrop-blur-sm border border-white/[0.06] no-underline transition-all duration-500 hover:border-white/[0.14] hover:-translate-y-2 active:scale-[0.98] overflow-hidden p-6 md:p-8 ${reveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 25px 80px ${tool.glow}`; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 0 transparent"; }}
      >
        <div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[22px]" style={{ background: `radial-gradient(450px circle at ${mp.x}px ${mp.y}px, ${tool.glow}, transparent 60%)` }} />
        <div className="absolute top-0 left-[10%] right-[10%] h-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${tool.accent}, transparent)` }} />
        <div className="relative z-10 flex items-start justify-between mb-5">
          <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl`} style={{ boxShadow: `0 8px 30px ${tool.glow}` }}>
            <UIcon name={tool.icon as any} size={24} className="text-white" />
          </div>
          <div className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border transition-all duration-300 group-hover:scale-105" style={{ color: tool.accent, borderColor: `${tool.accent}25`, background: `${tool.accent}10` }}>Free</div>
        </div>
        <div className="relative z-10 flex-1 flex flex-col">
          <h3 className="font-display text-xl font-bold text-white mb-1 tracking-tight">{tool.label}</h3>
          <p className="text-[12px] font-semibold uppercase tracking-wider mb-3" style={{ color: tool.accent }}>{tool.tagline}</p>
          <p className="text-[14px] text-[#9294a5] leading-relaxed flex-1 mb-5">{tool.desc}</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {tool.features.map((f) => (<span key={f} className="rounded-lg bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 text-[10px] font-semibold text-[#6b6d80] uppercase tracking-wider">{f}</span>))}
          </div>
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#6b6d80] group-hover:text-white transition-all duration-300">
            <span className="transition-transform duration-300 group-hover:translate-x-1">Explore tool</span>
            <UIcon name="ArrowRight" size={14} className="transition-transform duration-300 group-hover:translate-x-2" />
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ─── Step card ─── */
function StepCard({ step, index, isLast }: { step: (typeof steps)[number]; index: number; isLast: boolean }) {
  const reveal = useReveal(index * 120);
  return (
    <div ref={reveal.ref} className={`group relative rounded-[22px] bg-white/[0.025] border border-white/[0.06] p-6 md:p-8 text-center transition-all duration-500 hover:border-white/[0.12] hover:-translate-y-1 ${reveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <div className="font-display text-[48px] md:text-[56px] font-bold leading-none mb-4 opacity-[0.06]" style={{ color: step.accent }}>{step.num}</div>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl mb-5 transition-all duration-300 group-hover:scale-110" style={{ background: `${step.accent}12`, border: `1px solid ${step.accent}20` }}>
        <UIcon name={step.icon as any} size={22} style={{ color: step.accent }} />
      </div>
      <h3 className="font-display text-lg font-bold text-white mb-2 tracking-tight">{step.title}</h3>
      <p className="text-[13px] text-[#9294a5] leading-relaxed">{step.desc}</p>
      {!isLast && <div className="hidden md:block absolute top-1/2 -right-4 md:-right-5 w-6 md:w-8 h-[1px] bg-gradient-to-r from-white/[0.08] to-transparent" />}
    </div>
  );
}

/* ─── Marquee ─── */
function Marquee() {
  return (
    <div className="relative overflow-hidden py-6 md:py-8">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#06060b] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#06060b] to-transparent z-10" />
      <div className="flex gap-4 animate-marquee whitespace-nowrap">
        {[...marqueeItems, ...marqueeItems].map((item, i) => (
          <span key={`${item}-${i}`} className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-[#6b6d80] transition-colors hover:text-white hover:border-white/[0.12]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]/50" />
            {item}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 35s linear infinite; }
      `}</style>
    </div>
  );
}

/* ─── Bento card ─── */
function BentoCard({ feature, index }: { feature: { icon: string; title: string; desc: string; accent: string; span: boolean }; index: number }) {
  const reveal = useReveal(index * 80);
  return (
    <div ref={reveal.ref} className={`group relative rounded-[22px] bg-white/[0.025] border border-white/[0.06] p-6 md:p-8 transition-all duration-500 hover:border-white/[0.12] hover:-translate-y-1 overflow-hidden ${feature.span ? "sm:col-span-2" : ""} ${reveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-40 transition-opacity duration-500" style={{ background: feature.accent }} />
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl mb-4 transition-all duration-300 group-hover:scale-110" style={{ background: `${feature.accent}12`, border: `1px solid ${feature.accent}20` }}>
        <UIcon name={feature.icon as any} size={20} style={{ color: feature.accent }} />
      </div>
      <h3 className="font-display text-lg font-bold text-white mb-2 tracking-tight">{feature.title}</h3>
      <p className="text-[14px] text-[#9294a5] leading-relaxed">{feature.desc}</p>
    </div>
  );
}

/* ═══════════════════════════════════════
   HOMEPAGE
   ═══════════════════════════════════════ */
export default function HomePage() {
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div className="relative z-10 w-full overflow-x-hidden">

      {/* ══════ HERO ══════ */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-5 md:px-8 pt-8 pb-16 md:pt-12 md:pb-24">
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute rounded-full blur-[120px] opacity-30" style={{ width: "60vw", height: "60vw", maxWidth: 800, maxHeight: 800, top: "-20%", left: "-10%", background: "radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)", animation: "ambient-drift-1 18s ease-in-out infinite alternate" }} />
          <div className="absolute rounded-full blur-[100px] opacity-25" style={{ width: "50vw", height: "50vw", maxWidth: 650, maxHeight: 650, top: "10%", right: "-15%", background: "radial-gradient(circle, rgba(245,158,11,0.35) 0%, transparent 70%)", animation: "ambient-drift-2 22s ease-in-out infinite alternate" }} />
          <div className="absolute rounded-full blur-[90px] opacity-20" style={{ width: "40vw", height: "40vw", maxWidth: 500, maxHeight: 500, bottom: "5%", left: "20%", background: "radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)", animation: "ambient-drift-1 15s ease-in-out infinite alternate-reverse" }} />
        </div>
        {/* Grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" aria-hidden="true" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative z-10 flex flex-col items-center text-center max-w-[900px] mx-auto">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2.5 mb-7 md:mb-9 px-5 py-2.5 rounded-full bg-[#10b981]/8 border border-[#10b981]/15 text-[11px] md:text-[12px] font-semibold text-[#34d399] tracking-wide uppercase transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f59e0b] opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-[#f59e0b]" /></span>
            20+ tools · 100% free · No sign-up
          </div>

          {/* Headline */}
          <h1 className={`font-display text-[clamp(2.2rem,7vw,4.5rem)] font-bold text-white leading-[1.08] tracking-tight transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "0.1s" }}>
            Documents made{" "}
            <span className="animate-text-shimmer inline-block">effortless</span>
          </h1>

          {/* Subtitle */}
          <p className={`mt-5 md:mt-6 text-[clamp(1rem,2.2vw,1.25rem)] text-[#9294a5] max-w-[600px] mx-auto leading-relaxed font-medium transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "0.2s" }}>
            Convert, analyze, merge, split, and share — entirely in your browser. No uploads, no sign-ups, no limits.
          </p>

          {/* CTAs */}
          <div className={`mt-8 md:mt-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "0.3s" }}>
            <Link href="/pdf-tools" className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#10b981] to-[#059669] px-8 py-4 text-[15px] font-bold text-white no-underline shadow-xl shadow-[#10b981]/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#10b981]/35 active:scale-[0.97] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <UIcon name="Sparkles" size={16} />
              Get started — it&apos;s free
              <UIcon name="ArrowRight" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link href="/analyze" className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl border border-white/[0.1] bg-white/[0.04] px-8 py-4 text-[15px] font-bold text-white no-underline transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.16] hover:-translate-y-1 active:scale-[0.97]">
              <UIcon name="NavAnalyze" size={16} />
              Analyze a document
            </Link>
          </div>

          {/* Stats */}
          <div className={`mt-14 md:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-10 w-full max-w-[700px] transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "0.45s" }}>
            {[
              { value: 20, suffix: "+", label: "Tools", icon: "Wrench", accent: "#10b981" },
              { value: 0, suffix: "", label: "Data stored", icon: "ShieldCheck", accent: "#f59e0b", display: "0" },
              { value: 100, suffix: "%", label: "In-browser", icon: "Monitor", accent: "#f97316" },
              { value: 0, suffix: "", label: "Cost", icon: "Sparkles", accent: "#ff6b6b", display: "Free" },
            ].map((s) => (
              <div key={s.label} className="group text-center">
                <div className="relative mx-auto mb-3 flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110" style={{ background: `${s.accent}10`, border: `1px solid ${s.accent}18` }}>
                  <UIcon name={s.icon as any} size={18} style={{ color: s.accent }} />
                </div>
                <div className="font-display text-2xl md:text-3xl font-bold text-white mb-0.5">
                  {s.display !== undefined ? s.display : <Counter end={s.value} suffix={s.suffix} />}
                </div>
                <div className="text-[10px] md:text-[11px] text-[#6b6d80] font-semibold uppercase tracking-[0.12em]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 transition-all duration-1000 ${heroVisible ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "0.7s" }}>
          <div className="text-[10px] uppercase tracking-widest text-[#6b6d80] font-semibold">Scroll</div>
          <div className="w-[1px] h-8 bg-gradient-to-b from-[#6b6d80] to-transparent animate-pulse" />
        </div>
      </section>

      {/* ══════ MARQUEE ══════ */}
      <Marquee />

      {/* ══════ TOOL SUITES ══════ */}
      <section className="relative px-5 md:px-8 pb-20 md:pb-28">
        <div className="mx-auto max-w-[1100px]">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-[#6b6d80]">
              <UIcon name="LayoutGrid" size={12} className="text-[#10b981]" />
              Tool Suites
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Everything you need,{" "}<span className="text-[#9294a5]">in one place</span>
            </h2>
            <p className="text-[15px] text-[#6b6d80] max-w-[500px] mx-auto leading-relaxed">Four powerful suites covering every document workflow — from conversion to collaboration.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
            {tools.map((tool, i) => <ToolCard key={tool.href} tool={tool} index={i} />)}
          </div>
        </div>
      </section>

      {/* ══════ WHY ONEDOC / BENTO ══════ */}
      <section className="relative px-5 md:px-8 pb-20 md:pb-28">
        <div className="mx-auto max-w-[1100px]">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-[#6b6d80]">
              <UIcon name="ShieldCheck" size={12} className="text-[#f59e0b]" />
              Why OneDoc
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Built different,{" "}<span className="text-[#9294a5]">by design</span>
            </h2>
            <p className="text-[15px] text-[#6b6d80] max-w-[480px] mx-auto leading-relaxed">No servers, no subscriptions, no compromise. Your documents stay yours.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
            {([
              { icon: "ShieldCheck", title: "100% Private", desc: "Files never leave your browser. Zero server uploads, zero tracking.", accent: "#10b981", span: true },
              { icon: "Zap", title: "Lightning Fast", desc: "Native browser processing — no waiting for server round-trips.", accent: "#f59e0b", span: false },
              { icon: "Sparkles", title: "Always Free", desc: "Every tool, every feature. No paywalls, no sign-ups, no limits.", accent: "#f97316", span: false },
              { icon: "Globe", title: "Works Anywhere", desc: "Desktop, tablet, or phone — OneDoc works beautifully on every device.", accent: "#14b8a6", span: true },
            ] as const).map((f, i) => (
              <BentoCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <section className="relative px-5 md:px-8 pb-20 md:pb-28">
        <div className="mx-auto max-w-[900px]">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-[#6b6d80]">
              <UIcon name="Zap" size={12} className="text-[#f97316]" />
              How It Works
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Three steps,{" "}<span className="text-[#9294a5]">zero friction</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
            {steps.map((s, i) => <StepCard key={s.num} step={s} index={i} isLast={i === steps.length - 1} />)}
          </div>
        </div>
      </section>

      {/* ══════ FINAL CTA ══════ */}
      <section className="relative px-5 md:px-8 pb-16 md:pb-24">
        <div className="mx-auto max-w-[800px]">
          <div className="relative rounded-[28px] bg-gradient-to-br from-[#10b981]/8 via-transparent to-[#f59e0b]/5 border border-white/[0.06] p-8 md:p-14 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#10b981]/8 blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-[#f59e0b]/8 blur-[70px] pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center shadow-lg shadow-[#10b981]/25">
                  <UIcon name="Sparkles" size={22} className="text-white" />
                </div>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight mb-3">Ready to get started?</h2>
              <p className="text-[15px] text-[#9294a5] max-w-[400px] mx-auto leading-relaxed mb-8">No accounts, no uploads, no nonsense. Just powerful document tools that work instantly.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link href="/pdf-tools" className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#10b981] to-[#059669] px-7 py-3.5 text-[14px] font-bold text-white no-underline shadow-xl shadow-[#10b981]/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#10b981]/35 active:scale-[0.97] overflow-hidden">
                  Open PDF Suite
                  <UIcon name="ArrowRight" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link href="/docx-tools" className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl border border-white/[0.1] bg-white/[0.04] px-7 py-3.5 text-[14px] font-bold text-white no-underline transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.16] hover:-translate-y-1 active:scale-[0.97]">Open Word Tools</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ TRUST BAR ══════ */}
      <div className="px-5 md:px-8 pb-10">
        <div className="mx-auto max-w-[600px] flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-[12px] text-[#6b6d80] font-medium">
          <span className="flex items-center gap-2"><UIcon name="Lock" size={12} />End-to-end private</span>
          <span className="hidden sm:block h-3 w-px bg-white/[0.06]" />
          <span className="flex items-center gap-2"><UIcon name="Zap" size={12} />No server uploads</span>
          <span className="hidden sm:block h-3 w-px bg-white/[0.06]" />
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]" /></span>
            All systems operational
          </span>
        </div>
      </div>
    </div>
  );
}
