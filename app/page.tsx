"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { UIcon } from "./components/Icons";

/* ─── Tool type ─── */
type Tool = { href: string; icon: string; label: string; desc: string; color: string; bg: string };

/* ─── iLovePDF / Smallpdf style: category sections with named groups ─── */
const toolSections: { title: string; description: string; accent: string; accentBg: string; tools: Tool[] }[] = [
  {
    title: "Most Popular",
    description: "The tools people love the most.",
    accent: "#e5322d",
    accentBg: "#fef2f2",
    tools: [
      { href: "/tools/merge-pdf", icon: "Combine", label: "Merge PDF", desc: "Combine multiple PDFs into one", color: "#e5322d", bg: "#fef2f2" },
      { href: "/tools/split-pdf", icon: "ScissorsLineDashed", label: "Split PDF", desc: "Extract pages from your PDF", color: "#f97316", bg: "#fff7ed" },
      { href: "/tools/compress-pdf", icon: "Minimize2", label: "Compress PDF", desc: "Reduce PDF file size", color: "#3b82f6", bg: "#eff6ff" },
      { href: "/tools/pdf-to-word", icon: "FileSignature", label: "PDF to Word", desc: "Convert PDF to editable DOCX", color: "#2563eb", bg: "#eff6ff" },
      { href: "/tools/edit-pdf", icon: "PencilLine", label: "Edit PDF", desc: "Add text to any page", color: "#f97316", bg: "#fff7ed" },
      { href: "/tools/sign-pdf", icon: "Signature", label: "Sign PDF", desc: "Apply a signature to your PDF", color: "#0891b2", bg: "#ecfeff" },
    ],
  },
  {
    title: "Organize PDF",
    description: "Merge, split, rotate, and rearrange pages.",
    accent: "#f97316",
    accentBg: "#fff7ed",
    tools: [
      { href: "/tools/merge-pdf", icon: "Combine", label: "Merge PDF", desc: "Combine multiple PDFs into one", color: "#e5322d", bg: "#fef2f2" },
      { href: "/tools/split-pdf", icon: "ScissorsLineDashed", label: "Split PDF", desc: "Extract pages from your PDF", color: "#f97316", bg: "#fff7ed" },
      { href: "/tools/rotate-pdf", icon: "RotateCw", label: "Rotate PDF", desc: "Fix page orientation", color: "#8b5cf6", bg: "#f5f3ff" },
      { href: "/tools/remove-pages", icon: "Trash2", label: "Remove Pages", desc: "Delete unwanted pages", color: "#ef4444", bg: "#fef2f2" },
      { href: "/tools/rearrange-pages", icon: "ArrowUpDown", label: "Rearrange Pages", desc: "Reorder pages in custom order", color: "#6366f1", bg: "#eef2ff" },
    ],
  },
  {
    title: "Optimize PDF",
    description: "Compress, optimize, and extract from your PDFs.",
    accent: "#3b82f6",
    accentBg: "#eff6ff",
    tools: [
      { href: "/tools/compress-pdf", icon: "Minimize2", label: "Compress PDF", desc: "Reduce PDF file size", color: "#3b82f6", bg: "#eff6ff" },
      { href: "/tools/web-optimize-pdf", icon: "Rocket", label: "Web Optimize", desc: "Aggressive optimization for web", color: "#f59e0b", bg: "#fffbeb" },
      { href: "/tools/pdf-ocr", icon: "ScanSearch", label: "PDF OCR", desc: "Recognize text from scans", color: "#0891b2", bg: "#ecfeff" },
      { href: "/tools/extract-images", icon: "GalleryHorizontal", label: "Extract Images", desc: "Pull images from your PDF", color: "#8b5cf6", bg: "#f5f3ff" },
    ],
  },
  {
    title: "Convert from PDF",
    description: "Turn your PDF into other formats.",
    accent: "#10b981",
    accentBg: "#ecfdf5",
    tools: [
      { href: "/tools/pdf-to-word", icon: "FileSignature", label: "PDF to Word", desc: "Convert PDF to editable DOCX", color: "#2563eb", bg: "#eff6ff" },
      { href: "/tools/pdf-to-images", icon: "Image", label: "PDF to Images", desc: "Every page as a high-quality image", color: "#f59e0b", bg: "#fffbeb" },
      { href: "/tools/pdf-to-text", icon: "FileText", label: "PDF to Text", desc: "Extract all text from your PDF", color: "#10b981", bg: "#ecfdf5" },
    ],
  },
  {
    title: "Convert to PDF",
    description: "Create PDFs from images, text, and web pages.",
    accent: "#8b5cf6",
    accentBg: "#f5f3ff",
    tools: [
      { href: "/tools/images-to-pdf", icon: "Images", label: "Images to PDF", desc: "Create PDF from JPG or PNG", color: "#ec4899", bg: "#fdf2f8" },
      { href: "/tools/create-pdf", icon: "SquarePen", label: "Create PDF", desc: "Generate a PDF from typed text", color: "#8b5cf6", bg: "#f5f3ff" },
      { href: "/tools/webpage-to-pdf", icon: "Globe", label: "Webpage to PDF", desc: "Save any webpage as PDF", color: "#ec4899", bg: "#fdf2f8" },
      { href: "/tools/txt-to-pdf", icon: "ScrollText", label: "TXT/MD to PDF", desc: "Turn text files into A4 PDF", color: "#ef4444", bg: "#fef2f2" },
    ],
  },
  {
    title: "View & Edit PDF",
    description: "Annotate, sign, watermark, redact, and compare.",
    accent: "#f97316",
    accentBg: "#fff7ed",
    tools: [
      { href: "/tools/edit-pdf", icon: "PencilLine", label: "Edit PDF", desc: "Add text to any page", color: "#f97316", bg: "#fff7ed" },
      { href: "/tools/sign-pdf", icon: "Signature", label: "Sign PDF", desc: "Type or upload a signature", color: "#0891b2", bg: "#ecfeff" },
      { href: "/tools/page-numbers", icon: "ListOrdered", label: "Page Numbers", desc: "Add running page numbers", color: "#6366f1", bg: "#eef2ff" },
      { href: "/tools/add-watermark", icon: "Droplets", label: "Add Watermark", desc: "Stamp text on every page", color: "#f59e0b", bg: "#fffbeb" },
      { href: "/tools/redact-pdf", icon: "EyeOff", label: "Redact PDF", desc: "Black out sensitive text", color: "#1f2937", bg: "#f3f4f6" },
      { href: "/tools/compare-pdfs", icon: "GitCompare", label: "Compare PDFs", desc: "Find differences between files", color: "#0891b2", bg: "#ecfeff" },
      { href: "/tools/pdf-overlay", icon: "Layers3", label: "PDF Overlay", desc: "Overlay PDFs on top of each other", color: "#2563eb", bg: "#eff6ff" },
    ],
  },
  {
    title: "PDF Security",
    description: "Protect, unlock, and redact your documents.",
    accent: "#ef4444",
    accentBg: "#fef2f2",
    tools: [
      { href: "/tools/protect-pdf", icon: "Lock", label: "Protect PDF", desc: "Encrypt with a password", color: "#ef4444", bg: "#fef2f2" },
      { href: "/tools/unlock-pdf", icon: "Unlock", label: "Unlock PDF", desc: "Remove password protection", color: "#10b981", bg: "#ecfdf5" },
      { href: "/tools/redact-pdf", icon: "EyeOff", label: "Redact PDF", desc: "Permanently black out text", color: "#1f2937", bg: "#f3f4f6" },
    ],
  },
  {
    title: "Word & Document Tools",
    description: "Convert DOCX, CSV, and text files.",
    accent: "#2563eb",
    accentBg: "#eff6ff",
    tools: [
      { href: "/tools/docx-to-html", icon: "Globe", label: "DOCX to HTML", desc: "Convert Word to web page", color: "#2563eb", bg: "#eff6ff" },
      { href: "/tools/docx-to-text", icon: "FileText", label: "DOCX to Text", desc: "Extract plain text from Word", color: "#f59e0b", bg: "#fffbeb" },
      { href: "/tools/docx-to-markdown", icon: "NotebookPen", label: "DOCX to MD", desc: "Convert Word to Markdown", color: "#10b981", bg: "#ecfdf5" },
      { href: "/tools/docx-to-pdf", icon: "Printer", label: "DOCX to PDF", desc: "Print preview as PDF", color: "#e5322d", bg: "#fef2f2" },
      { href: "/tools/txt-to-pdf", icon: "ScrollText", label: "TXT/MD to PDF", desc: "Turn text files into A4 PDF", color: "#ef4444", bg: "#fef2f2" },
      { href: "/tools/csv-to-html", icon: "TableProperties", label: "CSV to HTML", desc: "Export CSV as styled HTML table", color: "#f59e0b", bg: "#fffbeb" },
    ],
  },
  {
    title: "More Tools",
    description: "Analyze, share, and view your documents.",
    accent: "#8b5cf6",
    accentBg: "#f5f3ff",
    tools: [
      { href: "/analyze", icon: "Search", label: "Analyze Doc", desc: "Extract text & deep insights", color: "#8b5cf6", bg: "#f5f3ff" },
      { href: "/pdf-link", icon: "Link", label: "PDF Link", desc: "Get a shareable viewer link", color: "#0891b2", bg: "#ecfeff" },
    ],
  },
];

/* ─── Steps ── */
const steps = [
  { num: "1", title: "Choose a tool", desc: "Select from 30+ document tools.", icon: "LayoutGrid", color: "#e5322d" },
  { num: "2", title: "Upload your file", desc: "Drag & drop or browse. PDF, DOCX, images.", icon: "Upload", color: "#f97316" },
  { num: "3", title: "Download result", desc: "Instant processing, all in-browser.", icon: "Download", color: "#10b981" },
];

/* ─── Marquee ─── */
const marqueeItems = [
  "Merge PDF", "Split PDF", "Compress PDF", "OCR", "DOCX to HTML",
  "Redact PDF", "Rotate Pages", "Lock PDF", "Text Extraction",
  "Image Export", "Compare PDFs", "PDF Overlay", "Page Numbers", "Web Optimize",
  "Sign PDF", "Watermark", "CSV to HTML", "Create PDF",
];

/* ─── Reveal hook ─── */
function useReveal(delay = 0) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setVisible(true), delay); observer.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);
  return { ref, visible };
}

/* ─── Counter ─── */
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

/* ─── Tool Card (iLovePDF style) ─── */
function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const reveal = useReveal(index * 40);
  return (
    <div ref={reveal.ref}>
      <Link
        href={tool.href}
        className={`group flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl border border-transparent transition-all duration-300 hover:border-black/[0.06] hover:shadow-lg hover:shadow-black/[0.04] hover:-translate-y-1 active:scale-[0.97] no-underline bg-transparent ${reveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        style={{ transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}
      >
        {/* Icon */}
        <div
          className="flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-2xl mb-3 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
          style={{ backgroundColor: tool.bg, color: tool.color, boxShadow: `0 4px 12px ${tool.color}15` }}
        >
          <UIcon name={tool.icon as any} size={24} />
        </div>
        {/* Label */}
        <h3 className="font-display text-[14px] sm:text-[15px] font-bold text-[#1a1a2e] mb-1 tracking-tight">{tool.label}</h3>
        <p className="text-[11px] sm:text-[12px] text-[#9aa0a6] leading-relaxed">{tool.desc}</p>
      </Link>
    </div>
  );
}

/* ─── Section Header (iLovePDF style) ─── */
function SectionHeader({ title, desc, accent, accentBg }: { title: string; desc: string; accent: string; accentBg: string }) {
  const reveal = useReveal(0);
  return (
    <div ref={reveal.ref} className={`flex items-center gap-3 mb-2 ${reveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0" style={{ backgroundColor: accentBg }}>
        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
      </div>
      <div>
        <h3 className="font-display text-[17px] sm:text-[19px] font-bold text-[#1a1a2e] tracking-tight leading-tight">{title}</h3>
        <p className="text-[12px] sm:text-[13px] text-[#9aa0a6] leading-snug">{desc}</p>
      </div>
    </div>
  );
}
function FeatureCard({ feature, index }: { feature: { icon: string; title: string; desc: string; color: string; bg: string }; index: number }) {
  const reveal = useReveal(index * 80);
  return (
    <div ref={reveal.ref} className={`group relative rounded-2xl border border-black/[0.06] p-6 md:p-8 transition-all duration-300 hover:border-black/[0.1] hover:shadow-lg hover:shadow-black/[0.04] hover:-translate-y-1 overflow-hidden bg-white ${reveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl mb-4 transition-all duration-300 group-hover:scale-110"
        style={{ backgroundColor: feature.bg, color: feature.color }}
      >
        <UIcon name={feature.icon as any} size={20} />
      </div>
      <h3 className="font-display text-lg font-bold text-[#1a1a2e] mb-2 tracking-tight">{feature.title}</h3>
      <p className="text-[14px] text-[#5f6368] leading-relaxed">{feature.desc}</p>
    </div>
  );
}


function Marquee() {
  return (
    <div className="relative overflow-hidden py-6 md:py-8">
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent z-10" />
      <div className="flex gap-3 animate-marquee whitespace-nowrap">
        {[...marqueeItems, ...marqueeItems].map((item, i) => (
          <span key={`${item}-${i}`} className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-[#f7f8fc] px-4 py-2 text-[12px] font-semibold text-[#5f6368] transition-colors hover:text-[#e5322d] hover:border-[#e5322d]/20 hover:bg-[#e5322d]/[0.04]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e5322d]/40" />
            {item}
          </span>
        ))}
      </div>
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
      <section className="relative flex flex-col items-center px-4 sm:px-6 md:px-8 pt-10 md:pt-20 pb-10 md:pb-16 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute rounded-full blur-[100px] opacity-30" style={{ width: "50vw", height: "50vw", maxWidth: 600, maxHeight: 600, top: "-15%", left: "-5%", background: "radial-gradient(circle, rgba(229,50,45,0.08) 0%, transparent 70%)" }} />
          <div className="absolute rounded-full blur-[100px] opacity-20" style={{ width: "40vw", height: "40vw", maxWidth: 500, maxHeight: 500, top: "20%", right: "-10%", background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)" }} />
        </div>

        {/* Text content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-[820px] mx-auto">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2.5 mb-6 md:mb-8 px-4 py-2 rounded-full bg-[#e5322d]/[0.06] border border-[#e5322d]/10 text-[11px] md:text-[12px] font-semibold text-[#e5322d] tracking-wide uppercase transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e5322d] opacity-60" /><span className="relative inline-flex rounded-full h-2 w-2 bg-[#e5322d]" /></span>
            30+ tools · 100% free · No sign-up
          </div>

          {/* Headline */}
          <h1 className={`font-display text-[clamp(2rem,6.5vw,3.8rem)] font-bold text-[#1a1a2e] leading-[1.1] tracking-tight transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "0.1s" }}>
            Every tool you need to work with{" "}
            <span className="animate-text-shimmer inline-block">documents</span>
          </h1>

          {/* Subtitle */}
          <p className={`mt-4 md:mt-6 text-[clamp(0.95rem,2vw,1.15rem)] text-[#5f6368] max-w-[540px] mx-auto leading-relaxed font-medium transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "0.2s" }}>
            Convert, analyze, merge, split, and share — entirely in your browser.
            No uploads to servers, no sign-ups, no limits.
          </p>

          {/* CTA */}
          <div className={`mt-7 md:mt-9 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "0.3s" }}>
            <Link href="#tools" className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#e5322d] px-7 py-3.5 text-[15px] font-bold text-white no-underline shadow-lg shadow-[#e5322d]/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#e5322d]/25 hover:bg-[#d42b26] active:scale-[0.97] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <UIcon name="Sparkles" size={16} />
              Get started — it&apos;s free
              <UIcon name="ArrowRight" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link href="/analyze" className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl border border-black/[0.1] bg-white px-7 py-3.5 text-[15px] font-bold text-[#1a1a2e] no-underline transition-all duration-300 hover:bg-[#f7f8fc] hover:border-black/[0.14] hover:-translate-y-0.5 active:scale-[0.97]">
              <UIcon name="NavAnalyze" size={16} />
              Analyze a document
            </Link>
          </div>
        </div>
      </section>

      {/* ══════ STATS BAR ══════ */}
      <section className="relative px-4 sm:px-6 md:px-8 py-8 md:py-12">
        <div className="mx-auto max-w-[800px] grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-10">
          {[
            { value: 30, suffix: "+", label: "Tools", icon: "Wrench", color: "#e5322d", bg: "#fef2f2" },
            { value: 0, suffix: "", label: "Data stored", icon: "ShieldCheck", color: "#10b981", bg: "#ecfdf5", display: "0" },
            { value: 100, suffix: "%", label: "In-browser", icon: "Monitor", color: "#f97316", bg: "#fff7ed" },
            { value: 0, suffix: "", label: "Cost", icon: "Sparkles", color: "#3b82f6", bg: "#eff6ff", display: "Free" },
          ].map((s) => (
            <div key={s.label} className="group text-center">
              <div className="relative mx-auto mb-3 flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: s.bg, color: s.color }}>
                <UIcon name={s.icon as any} size={18} />
              </div>
              <div className="font-display text-2xl md:text-3xl font-bold text-[#1a1a2e] mb-0.5">
                {s.display !== undefined ? s.display : <Counter end={s.value} suffix={s.suffix} />}
              </div>
              <div className="text-[10px] md:text-[11px] text-[#9aa0a6] font-semibold uppercase tracking-[0.12em]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ MARQUEE ══════ */}
      <Marquee />

      {/* ══════ ALL TOOLS — SECTIONED LAYOUT (iLovePDF / Smallpdf style) ══════ */}
      <section id="tools" className="relative px-4 sm:px-6 md:px-8 pb-16 md:pb-24">
        <div className="mx-auto max-w-[1100px]">
          {/* Header */}
          <div className="text-center mb-10 md:mb-14">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1a2e] tracking-tight mb-3">
              All the tools you&apos;ll ever need
            </h2>
            <p className="text-[14px] sm:text-[15px] text-[#5f6368] max-w-[480px] mx-auto leading-relaxed">30+ document tools, completely free. No watermarks, no limits.</p>
          </div>

          {/* Sectioned Tool Grid */}
          <div className="flex flex-col gap-10 md:gap-14">
            {toolSections.map((section) => (
              <div key={section.title}>
                <SectionHeader title={section.title} desc={section.description} accent={section.accent} accentBg={section.accentBg} />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 sm:gap-2 mt-3">
                  {section.tools.map((tool, i) => (
                    <ToolCard key={`${section.title}-${tool.label}-${i}`} tool={tool} index={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ WHY ONEDOC ══════ */}
      <section className="relative px-4 sm:px-6 md:px-8 pb-16 md:pb-24 bg-[#f7f8fc]">
        <div className="mx-auto max-w-[1100px] pt-16 md:pt-24">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1a2e] tracking-tight mb-3">
              Why choose OneDoc?
            </h2>
            <p className="text-[14px] sm:text-[15px] text-[#5f6368] max-w-[480px] mx-auto leading-relaxed">No servers, no subscriptions, no compromise.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {([
              { icon: "ShieldCheck", title: "100% Private", desc: "Files never leave your browser. Zero server uploads, zero tracking.", color: "#10b981", bg: "#ecfdf5" },
              { icon: "Zap", title: "Lightning Fast", desc: "Native browser processing — no waiting for server round-trips.", color: "#f59e0b", bg: "#fffbeb" },
              { icon: "Sparkles", title: "Always Free", desc: "Every tool, every feature. No paywalls, no sign-ups, no limits.", color: "#e5322d", bg: "#fef2f2" },
              { icon: "Globe", title: "Works Anywhere", desc: "Desktop, tablet, or phone — OneDoc works beautifully on every device.", color: "#3b82f6", bg: "#eff6ff" },
            ] as const).map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <section className="relative px-4 sm:px-6 md:px-8 py-16 md:py-24">
        <div className="mx-auto max-w-[900px]">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1a2e] tracking-tight mb-3">
              How it works
            </h2>
            <p className="text-[14px] sm:text-[15px] text-[#5f6368] max-w-[400px] mx-auto leading-relaxed">Three simple steps. Zero friction.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {steps.map((step, i) => {
              const reveal = useReveal(i * 120);
              return (
                <div key={step.num} ref={reveal.ref} className={`group relative rounded-2xl border border-black/[0.06] bg-white p-6 md:p-8 text-center transition-all duration-300 hover:border-black/[0.1] hover:shadow-lg hover:shadow-black/[0.04] hover:-translate-y-1 ${reveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                  {/* Step number */}
                  <div className="font-display text-[48px] md:text-[56px] font-bold leading-none mb-3 opacity-[0.06]" style={{ color: step.color }}>{step.num}</div>
                  {/* Icon */}
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl mb-4 transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: `${step.color}12`, border: `1px solid ${step.color}20`, color: step.color }}>
                    <UIcon name={step.icon as any} size={22} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#1a1a2e] mb-2 tracking-tight">{step.title}</h3>
                  <p className="text-[13px] text-[#5f6368] leading-relaxed">{step.desc}</p>
                  {/* Connector line */}
                  {i < steps.length - 1 && <div className="hidden md:block absolute top-1/2 -right-4 md:-right-5 w-6 md:w-8 h-[1px] bg-gradient-to-r from-black/[0.06] to-transparent" />}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════ FINAL CTA ══════ */}
      <section className="relative px-4 sm:px-6 md:px-8 pb-16 md:pb-24">
        <div className="mx-auto max-w-[800px]">
          <div className="relative rounded-3xl bg-gradient-to-br from-[#e5322d]/[0.04] via-transparent to-[#f97316]/[0.03] border border-black/[0.06] p-8 md:p-14 text-center overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[#e5322d]/[0.04] blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-[#f97316]/[0.04] blur-[50px] pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="h-12 w-12 rounded-2xl bg-[#e5322d] flex items-center justify-center shadow-lg shadow-[#e5322d]/20">
                  <UIcon name="Sparkles" size={22} className="text-white" />
                </div>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[#1a1a2e] tracking-tight mb-3">Ready to get started?</h2>
              <p className="text-[14px] sm:text-[15px] text-[#5f6368] max-w-[400px] mx-auto leading-relaxed mb-7">No accounts, no uploads, no nonsense. Just powerful document tools that work instantly.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link href="#tools" className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#e5322d] px-7 py-3.5 text-[14px] font-bold text-white no-underline shadow-lg shadow-[#e5322d]/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#e5322d]/25 hover:bg-[#d42b26] active:scale-[0.97] overflow-hidden">
                  Browse All Tools
                  <UIcon name="ArrowRight" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link href="/analyze" className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl border border-black/[0.08] bg-white px-7 py-3.5 text-[14px] font-bold text-[#1a1a2e] no-underline transition-all duration-300 hover:bg-[#f7f8fc] hover:border-black/[0.12] hover:-translate-y-0.5 active:scale-[0.97]">Analyze a Document</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ TRUST BAR ══════ */}
      <div className="px-4 sm:px-6 md:px-8 pb-10">
        <div className="mx-auto max-w-[600px] flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-[12px] text-[#9aa0a6] font-medium">
          <span className="flex items-center gap-2"><UIcon name="Lock" size={12} />End-to-end private</span>
          <span className="hidden sm:block h-3 w-px bg-black/[0.08]" />
          <span className="flex items-center gap-2"><UIcon name="Zap" size={12} />No server uploads</span>
          <span className="hidden sm:block h-3 w-px bg-black/[0.08]" />
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]" /></span>
            All systems operational
          </span>
        </div>
      </div>
    </div>
  );
}
