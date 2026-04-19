"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { UIcon } from "./components/Icons";

/* ─── Tool suite data ─── */
const tools = [
  {
    href: "/analyze",
    icon: "NavAnalyze",
    label: "Analyze",
    tagline: "Deep document intelligence",
    desc: "Extract text, search content, and generate insights from PDFs & DOCX files with OCR fallback.",
    gradient: "from-[#7c6aff] to-[#a78bfa]",
    glow: "rgba(124, 106, 255, 0.15)",
    accent: "#7c6aff",
    features: ["Text extraction", "OCR fallback", "Document insights"],
  },
  {
    href: "/pdf-tools",
    icon: "NavPdfTools",
    label: "PDF Suite",
    tagline: "Complete PDF toolkit",
    desc: "Convert, merge, split, rotate, compress, redact, lock, and overlay — 20+ tools in one place.",
    gradient: "from-[#ff6b6b] to-[#ee5a24]",
    glow: "rgba(255, 107, 107, 0.15)",
    accent: "#ff6b6b",
    features: ["Merge & split", "Compress", "Lock & unlock"],
  },
  {
    href: "/docx-tools",
    icon: "NavDocxTools",
    label: "Word Tools",
    tagline: "Word document converter",
    desc: "Export DOCX to HTML, plain text, markdown, PDF preview, and CSV to HTML tables instantly.",
    gradient: "from-[#ffa940] to-[#ff7b3a]",
    glow: "rgba(255, 169, 64, 0.15)",
    accent: "#ffa940",
    features: ["DOCX to HTML", "Markdown export", "CSV tables"],
  },
  {
    href: "/pdf-link",
    icon: "NavPdfLink",
    label: "PDF Link",
    tagline: "Instant shareable links",
    desc: "Upload a PDF and instantly get a shareable viewer link — no accounts, no friction.",
    gradient: "from-[#00d4aa] to-[#00b894]",
    glow: "rgba(0, 212, 170, 0.15)",
    accent: "#00d4aa",
    features: ["Instant share", "Viewer link", "No sign-up"],
  },
] as const;

/* ─── Bento feature items ─── */
const bentoFeatures = [
  {
    icon: "ShieldCheck",
    title: "100% Private",
    desc: "Files never leave your browser. Zero server uploads, zero tracking.",
    accent: "#00d4aa",
    span: "col",
  },
  {
    icon: "Zap",
    title: "Lightning Fast",
    desc: "Native browser processing — no waiting for server round-trips.",
    accent: "#ffa940",
    span: "normal",
  },
  {
    icon: "Sparkles",
    title: "Always Free",
    desc: "Every tool, every feature. No paywalls, no sign-ups, no limits.",
    accent: "#7c6aff",
    span: "normal",
  },
  {
    icon: "Globe",
    title: "Works Anywhere",
    desc: "Desktop, tablet, or phone — OneDoc works beautifully on every device.",
    accent: "#ff6b6b",
    span: "col",
  },
] as const;

/* ─── How it works steps ─── */
const steps = [
  {
    num: "01",
    title: "Choose a tool",
    desc: "Pick from 20+ PDF and document tools built for every workflow.",
    icon: "LayoutGrid",
    accent: "#7c6aff",
  },
  {
    num: "02",
    title: "Drop your file",
    desc: "Drag and drop or browse. We support PDF, DOCX, images, and more.",
    icon: "Upload",
    accent: "#00d4aa",
  },
  {
    num: "03",
    title: "Get results instantly",
    desc: "Processing happens in your browser. Download your file in seconds.",
    icon: "Download",
    accent: "#ffa940",
  },
];

/* ─── Animated gradient orbs for background ─── */
function GradientMesh() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Primary orb */}
      <div
        className="absolute rounded-full blur-[120px] opacity-30"
        style={{
          width: "60vw",
          height: "60vw",
          maxWidth: "800px",
          maxHeight: "800px",
          top: "-20%",
          left: "-10%",
          background: "radial-gradient(circle, rgba(124, 106, 255, 0.4) 0%, transparent 70%)",
          animation: "ambient-drift-1 18s ease-in-out infinite alternate",
        }}
      />
      {/* Secondary orb */}
      <div
        className="absolute rounded-full blur-[100px] opacity-25"
        style={{
          width: "50vw",
          height: "50vw",
          maxWidth: "650px",
          maxHeight: "650px",
          top: "10%",
          right: "-15%",
          background: "radial-gradient(circle, rgba(0, 212, 170, 0.35) 0%, transparent 70%)",
          animation: "ambient-drift-2 22s ease-in-out infinite alternate",
        }}
      />
      {/* Warm accent */}
      <div
        className="absolute rounded-full blur-[90px] opacity-20"
        style={{
          width: "40vw",
          height: "40vw",
          maxWidth: "500px",
          maxHeight: "500px",
          bottom: "5%",
          left: "20%",
          background: "radial-gradient(circle, rgba(255, 169, 64, 0.3) 0%, transparent 70%)",
          animation: "ambient-drift-1 15s ease-in-out infinite alternate-reverse",
        }}
      />
    </div>
  );
}

/* ─── Animated number counter ─── */
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1400;
          const startTime = performance.now();
          function tick(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * end));
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

/* ─── Staggered reveal hook ─── */
function useReveal(delay = 0) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return { ref, visible };
}

/* ─── Tool card component ─── */
function ToolCard({ tool, index }: { tool: (typeof tools)[number]; index: number }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLAnchorElement>(null);
  const reveal = useReveal(index * 100);

  function handleMouseMove(e: React.MouseEvent) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <div ref={reveal.ref}>
      <Link
        ref={cardRef}
        href={tool.href}
        onMouseMove={handleMouseMove}
        className={`group relative flex flex-col h-full rounded-[22px] bg-white/[0.025] backdrop-blur-sm border border-white/[0.06] no-underline transition-all duration-500 hover:border-white/[0.14] hover:-translate-y-2 active:scale-[0.98] overflow-hidden p-6 md:p-8 ${
          reveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{ transitionDelay: `${index * 0.06}s` }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = `0 25px 80px ${tool.glow}`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 0 transparent`;
        }}
      >
        {/* Spotlight glow */}
        <div
          className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[22px]"
          style={{
            background: `radial-gradient(450px circle at ${mousePos.x}px ${mousePos.y}px, ${tool.glow}, transparent 60%)`,
          }}
        />

        {/* Top accent line */}
        <div
          className="absolute top-0 left-[10%] right-[10%] h-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${tool.accent}, transparent)` }}
        />

        {/* Icon + badge row */}
        <div className="relative z-10 flex items-start justify-between mb-5">
          <div
            className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl`}
            style={{ boxShadow: `0 8px 30px ${tool.glow}` }}
          >
            <UIcon name={tool.icon as any} size={24} className="text-white" />
          </div>
          <div
            className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border transition-all duration-300 group-hover:scale-105"
            style={{
              color: tool.accent,
              borderColor: `${tool.accent}25`,
              background: `${tool.accent}10`,
            }}
          >
            Free
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col">
          <h3 className="font-display text-xl font-bold text-white mb-1 tracking-tight">
            {tool.label}
          </h3>
          <p className="text-[12px] font-semibold uppercase tracking-wider mb-3" style={{ color: tool.accent }}>
            {tool.tagline}
          </p>
          <p className="text-[14px] text-[#9294a5] leading-relaxed flex-1 mb-5">
            {tool.desc}
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mb-5">
            {tool.features.map((f) => (
              <span
                key={f}
                className="rounded-lg bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 text-[10px] font-semibold text-[#6b6d80] uppercase tracking-wider"
              >
                {f}
              </span>
            ))}
          </div>

          {/* Arrow CTA */}
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#6b6d80] group-hover:text-white transition-all duration-300">
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              Explore tool
            </span>
            <UIcon
              name="ArrowRight"
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-2"
            />
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ─── Bento feature card ─── */
function BentoCard({ feature, index }: { feature: (typeof bentoFeatures)[number]; index: number }) {
  const reveal = useReveal(index * 80);

  return (
    <div
      ref={reveal.ref}
      className={`group relative rounded-[22px] bg-white/[0.025] border border-white/[0.06] p-6 md:p-8 transition-all duration-500 hover:border-white/[0.12] hover:-translate-y-1 overflow-hidden ${
        feature.span === "col" ? "sm:col-span-2" : ""
      } ${reveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      {/* Corner glow */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-40 transition-opacity duration-500"
        style={{ background: feature.accent }}
      />

      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl mb-4 transition-all duration-300 group-hover:scale-110"
        style={{
          background: `${feature.accent}12`,
          border: `1px solid ${feature.accent}20`,
        }}
      >
        <UIcon name={feature.icon as any} size={20} className="transition-colors duration-300" style={{ color: feature.accent }} />
      </div>

      <h3 className="font-display text-lg font-bold text-white mb-2 tracking-tight">
        {feature.title}
      </h3>
      <p className="text-[14px] text-[#9294a5] leading-relaxed">
        {feature.desc}
      </p>
    </div>
  );
}

/* ─── Step card component ─── */
function StepCard({ step, index, isLast }: { step: (typeof steps)[number]; index: number; isLast: boolean }) {
  const reveal = useReveal(index * 120);

  return (
    <div
      ref={reveal.ref}
      className={`group relative rounded-[22px] bg-white/[0.025] border border-white/[0.06] p-6 md:p-8 text-center transition-all duration-500 hover:border-white/[0.12] hover:-translate-y-1 ${
        reveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {/* Step number */}
      <div
        className="font-display text-[48px] md:text-[56px] font-bold leading-none mb-4 opacity-[0.06]"
        style={{ color: step.accent }}
      >
        {step.num}
      </div>

      {/* Icon */}
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl mb-5 transition-all duration-300 group-hover:scale-110"
        style={{
          background: `${step.accent}12`,
          border: `1px solid ${step.accent}20`,
        }}
      >
        <UIcon name={step.icon as any} size={22} style={{ color: step.accent }} />
      </div>

      <h3 className="font-display text-lg font-bold text-white mb-2 tracking-tight">
        {step.title}
      </h3>
      <p className="text-[13px] text-[#9294a5] leading-relaxed">
        {step.desc}
      </p>

      {/* Connector line (not on last) */}
      {!isLast && (
        <div className="hidden md:block absolute top-1/2 -right-4 md:-right-5 w-6 md:w-8 h-[1px] bg-gradient-to-r from-white/[0.08] to-transparent" />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN HOMEPAGE
   ═══════════════════════════════════════════════ */
export default function HomePage() {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative z-10 w-full overflow-x-hidden">
      {/* ════════ HERO ════════ */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-5 md:px-8 pt-8 pb-16 md:pt-12 md:pb-24">
        <GradientMesh />

        {/* Grid pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          aria-hidden="true"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center max-w-[900px] mx-auto">
          {/* Floating badge */}
          <div
            className={`inline-flex items-center gap-2.5 mb-7 md:mb-9 px-5 py-2.5 rounded-full bg-[#7c6aff]/8 border border-[#7c6aff]/15 text-[11px] md:text-[12px] font-semibold text-[#a78bfa] tracking-wide uppercase transition-all duration-700 ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d4aa] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00d4aa]" />
            </span>
            20+ tools · 100% free · No sign-up
          </div>

          {/* Headline */}
          <h1
            className={`font-display text-[clamp(2.2rem,7vw,4.5rem)] font-bold text-white leading-[1.08] tracking-tight transition-all duration-1000 ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "0.1s" }}
          >
            The document suite{" "}
            <span className="animate-text-shimmer inline-block">
              you deserve
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={`mt-5 md:mt-6 text-[clamp(1rem,2.2vw,1.25rem)] text-[#9294a5] max-w-[600px] mx-auto leading-relaxed font-medium transition-all duration-1000 ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "0.2s" }}
          >
            Convert, analyze, merge, split, and share — entirely in your browser. 
            No uploads, no sign-ups, no limits.
          </p>

          {/* CTA Row */}
          <div
            className={`mt-8 md:mt-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto transition-all duration-1000 ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "0.3s" }}
          >
            <Link
              href="/pdf-tools"
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#7c6aff] to-[#5b4bcf] px-8 py-4 text-[15px] font-bold text-white no-underline shadow-xl shadow-[#7c6aff]/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#7c6aff]/35 active:scale-[0.97] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <UIcon name="Sparkles" size={16} />
              Get started — it&apos;s free
              <UIcon name="ArrowRight" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/analyze"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl border border-white/[0.1] bg-white/[0.04] px-8 py-4 text-[15px] font-bold text-white no-underline transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.16] hover:-translate-y-1 active:scale-[0.97]"
            >
              <UIcon name="NavAnalyze" size={16} />
              Analyze a document
            </Link>
          </div>

          {/* Stats row */}
          <div
            className={`mt-14 md:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-10 w-full max-w-[700px] transition-all duration-1000 ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "0.45s" }}
          >
            {[
              { value: 20, suffix: "+", label: "Tools", icon: "Wrench", accent: "#7c6aff" },
              { value: 0, suffix: "", label: "Data stored", icon: "ShieldCheck", accent: "#00d4aa", display: "0" },
              { value: 100, suffix: "%", label: "In-browser", icon: "Monitor", accent: "#ffa940" },
              { value: 0, suffix: "", label: "Cost", icon: "Sparkles", accent: "#ff6b6b", display: "Free" },
            ].map((stat, i) => (
              <div key={stat.label} className="group text-center">
                <div
                  className="relative mx-auto mb-3 flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: `${stat.accent}10`,
                    border: `1px solid ${stat.accent}18`,
                  }}
                >
                  <UIcon name={stat.icon as any} size={18} style={{ color: stat.accent }} />
                </div>
                <div className="font-display text-2xl md:text-3xl font-bold text-white mb-0.5">
                  {stat.display !== undefined ? stat.display : <Counter end={stat.value} suffix={stat.suffix} />}
                </div>
                <div className="text-[10px] md:text-[11px] text-[#6b6d80] font-semibold uppercase tracking-[0.12em]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-1000 ${
            heroVisible ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDelay: "0.7s" }}
        >
          <div className="text-[10px] uppercase tracking-widest text-[#6b6d80] font-semibold">Scroll</div>
          <div className="w-[1px] h-8 bg-gradient-to-b from-[#6b6d80] to-transparent animate-pulse" />
        </div>
      </section>

      {/* ════════ TOOL SUITES ════════ */}
      <section className="relative px-5 md:px-8 pb-20 md:pb-28">
        <div className="mx-auto max-w-[1100px]">
          {/* Section header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-[#6b6d80]">
              <UIcon name="LayoutGrid" size={12} className="text-[#7c6aff]" />
              Tool Suites
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Everything you need,{" "}
              <span className="text-[#9294a5]">in one place</span>
            </h2>
            <p className="text-[15px] text-[#6b6d80] max-w-[500px] mx-auto leading-relaxed">
              Four powerful suites covering every document workflow — from conversion to collaboration.
            </p>
          </div>

          {/* Tool grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
            {tools.map((tool, i) => (
              <ToolCard key={tool.href} tool={tool} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════ BENTO FEATURES ════════ */}
      <section className="relative px-5 md:px-8 pb-20 md:pb-28">
        <div className="mx-auto max-w-[1100px]">
          {/* Section header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-[#6b6d80]">
              <UIcon name="ShieldCheck" size={12} className="text-[#00d4aa]" />
              Why OneDoc
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Built different,{" "}
              <span className="text-[#9294a5]">by design</span>
            </h2>
            <p className="text-[15px] text-[#6b6d80] max-w-[480px] mx-auto leading-relaxed">
              No servers, no subscriptions, no compromise. Your documents stay yours.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
            {bentoFeatures.map((f, i) => (
              <BentoCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section className="relative px-5 md:px-8 pb-20 md:pb-28">
        <div className="mx-auto max-w-[900px]">
          {/* Section header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-[#6b6d80]">
              <UIcon name="Zap" size={12} className="text-[#ffa940]" />
              How It Works
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Three steps,{" "}
              <span className="text-[#9294a5]">zero friction</span>
            </h2>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
            {steps.map((step, i) => (
              <StepCard key={step.num} step={step} index={i} isLast={i === steps.length - 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FINAL CTA ════════ */}
      <section className="relative px-5 md:px-8 pb-16 md:pb-24">
        <div className="mx-auto max-w-[800px]">
          <div className="relative rounded-[28px] bg-gradient-to-br from-[#7c6aff]/8 via-transparent to-[#00d4aa]/5 border border-white/[0.06] p-8 md:p-14 text-center overflow-hidden">
            {/* Background orbs */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#7c6aff]/8 blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-[#00d4aa]/8 blur-[70px] pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#7c6aff] to-[#5b4bcf] flex items-center justify-center shadow-lg shadow-[#7c6aff]/25">
                  <UIcon name="Sparkles" size={22} className="text-white" />
                </div>
              </div>

              <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight mb-3">
                Ready to get started?
              </h2>
              <p className="text-[15px] text-[#9294a5] max-w-[400px] mx-auto leading-relaxed mb-8">
                No accounts, no uploads, no nonsense. Just powerful document tools that work instantly.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link
                  href="/pdf-tools"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#7c6aff] to-[#5b4bcf] px-7 py-3.5 text-[14px] font-bold text-white no-underline shadow-xl shadow-[#7c6aff]/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#7c6aff]/35 active:scale-[0.97] overflow-hidden"
                >
                  Open PDF Suite
                  <UIcon name="ArrowRight" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/docx-tools"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl border border-white/[0.1] bg-white/[0.04] px-7 py-3.5 text-[14px] font-bold text-white no-underline transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.16] hover:-translate-y-1 active:scale-[0.97]"
                >
                  Open Word Tools
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ BOTTOM TRUST BAR ════════ */}
      <div className="px-5 md:px-8 pb-10">
        <div className="mx-auto max-w-[600px] flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-[12px] text-[#6b6d80] font-medium">
          <span className="flex items-center gap-2">
            <UIcon name="Lock" size={12} />
            End-to-end private
          </span>
          <span className="hidden sm:block h-3 w-px bg-white/[0.06]" />
          <span className="flex items-center gap-2">
            <UIcon name="Zap" size={12} />
            No server uploads
          </span>
          <span className="hidden sm:block h-3 w-px bg-white/[0.06]" />
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d4aa] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00d4aa]" />
            </span>
            All systems operational
          </span>
        </div>
      </div>
    </div>
  );
}
