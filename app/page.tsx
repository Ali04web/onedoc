"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { UIcon } from "./components/Icons";

const tools = [
  {
    href: "/analyze",
    icon: "Microscope",
    label: "Analyze",
    desc: "Extract text, search, and generate insights from PDFs & DOCX files.",
    gradient: "from-[#7c6aff] to-[#a78bfa]",
    glow: "rgba(124, 106, 255, 0.18)",
    accent: "#7c6aff",
  },
  {
    href: "/pdf-tools",
    icon: "FileText",
    label: "PDF Suite",
    desc: "Convert, merge, split, rotate, lock, and unlock your PDF files.",
    gradient: "from-[#ff6b6b] to-[#ee5a24]",
    glow: "rgba(255, 107, 107, 0.18)",
    accent: "#ff6b6b",
  },
  {
    href: "/docx-tools",
    icon: "FileSignature",
    label: "Word Tools",
    desc: "Export DOCX to HTML, text, markdown, PDF, and CSV to HTML tables.",
    gradient: "from-[#ffa940] to-[#ff7b3a]",
    glow: "rgba(255, 169, 64, 0.18)",
    accent: "#ffa940",
  },
  {
    href: "/pdf-link",
    icon: "Link",
    label: "PDF Link",
    desc: "Upload a PDF and instantly get a shareable viewer link.",
    gradient: "from-[#00d4aa] to-[#00b894]",
    glow: "rgba(0, 212, 170, 0.18)",
    accent: "#00d4aa",
  },
] as const;

const stats = [
  { value: "100%", label: "In-browser", icon: "Monitor" },
  { value: "Free", label: "No sign-up", icon: "Sparkles" },
  { value: "12+", label: "Tools", icon: "Wrench" },
  { value: "0", label: "Data stored", icon: "ShieldCheck" },
];

// Animated counter for stats
function AnimatedStat({ stat, index }: { stat: typeof stats[number]; index: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200 + index * 120);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      ref={ref}
      className={`group text-center transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="relative mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06] group-hover:border-[#7c6aff]/20 group-hover:bg-[#7c6aff]/[0.06] transition-all duration-300">
        <UIcon name={stat.icon as any} size={20} className="text-[#6b6d80] group-hover:text-[#7c6aff] transition-colors duration-300" />
      </div>
      <div className="font-display text-2xl md:text-3xl font-bold text-white mb-0.5">{stat.value}</div>
      <div className="text-[11px] text-[#6b6d80] font-semibold uppercase tracking-[0.12em]">{stat.label}</div>
    </div>
  );
}

// Animated tool card
function ToolCard({ tool, index }: { tool: typeof tools[number]; index: number }) {
  const [visible, setVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 400 + index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  function handleMouseMove(e: React.MouseEvent) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  return (
    <Link
      ref={cardRef}
      key={tool.href}
      href={tool.href}
      onMouseMove={handleMouseMove}
      className={`group relative flex flex-col p-7 md:p-8 rounded-2xl bg-white/[0.025] backdrop-blur-sm border border-white/[0.06] no-underline transition-all duration-500 hover:border-white/[0.14] hover:-translate-y-2 active:scale-[0.98] overflow-hidden ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{
        boxShadow: `0 0 0 0 transparent`,
        transitionDelay: `${index * 0.08}s`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 25px 80px ${tool.glow}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 0 transparent`;
      }}
    >
      {/* Spotlight glow that follows cursor */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, ${tool.glow}, transparent 60%)`,
        }}
      />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-[10%] right-[10%] h-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${tool.accent}, transparent)` }}
      />

      {/* Icon */}
      <div className="relative z-10">
        <div
          className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-5 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl`}
          style={{ boxShadow: `0 8px 30px ${tool.glow}` }}
        >
          <UIcon name={tool.icon as any} size={24} className="text-white" />
        </div>
      </div>

      <h2 className="relative z-10 font-display text-xl font-bold text-white mb-2 tracking-tight">
        {tool.label}
      </h2>
      <p className="relative z-10 text-[14px] text-[#9294a5] leading-relaxed flex-1">
        {tool.desc}
      </p>

      {/* Arrow CTA */}
      <div className="relative z-10 mt-5 flex items-center gap-2 text-[13px] font-semibold text-[#6b6d80] group-hover:text-white transition-all duration-300">
        <span className="transition-transform duration-300 group-hover:translate-x-1">Open tool</span>
        <UIcon name="ArrowRight" size={14} className="transition-transform duration-300 group-hover:translate-x-2" />
      </div>
    </Link>
  );
}

// Particle dots background for hero — deterministic to avoid hydration mismatch
const PARTICLES = [
  { w: 4, h: 4, top: 20, left: 15, delay: 0, dur: 5, color: "#7c6aff", opacity: 0.2 },
  { w: 3, h: 3, top: 45, left: 70, delay: 0.7, dur: 6, color: "#00d4aa", opacity: 0.18 },
  { w: 5, h: 5, top: 65, left: 30, delay: 1.4, dur: 4.5, color: "#ffa940", opacity: 0.22 },
  { w: 3, h: 3, top: 30, left: 85, delay: 2.1, dur: 5.5, color: "#ff6b6b", opacity: 0.16 },
  { w: 4, h: 4, top: 75, left: 55, delay: 2.8, dur: 6.5, color: "#7c6aff", opacity: 0.2 },
  { w: 5, h: 5, top: 50, left: 40, delay: 3.5, dur: 4, color: "#00d4aa", opacity: 0.15 },
];

function HeroParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float"
          style={{
            width: `${p.w}px`,
            height: `${p.h}px`,
            background: p.color,
            opacity: p.opacity,
            top: `${p.top}%`,
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center p-6 md:p-8 min-h-[80vh] relative z-10 w-full">
      {/* Hero Section */}
      <section className="w-full max-w-[960px] text-center mt-12 md:mt-20 mb-16 md:mb-20 relative">
        <HeroParticles />

        {/* Floating badge */}
        <div
          className={`inline-flex items-center gap-2.5 mb-8 px-5 py-2.5 rounded-full bg-[#7c6aff]/10 border border-[#7c6aff]/15 text-[12px] font-semibold text-[#a78bfa] tracking-wide uppercase transition-all duration-700 ${
            heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="h-2 w-2 rounded-full bg-[#00d4aa] animate-pulse" />
          All tools free · No sign-up required
          <div className="h-2 w-2 rounded-full bg-[#7c6aff] animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>

        <h1
          className={`font-display text-5xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight transition-all duration-1000 ${
            heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "0.1s" }}
        >
          Your documents,{" "}
          <span className="animate-text-shimmer inline-block">
            reimagined
          </span>
        </h1>

        <p
          className={`mt-6 text-lg md:text-xl text-[#9294a5] max-w-[600px] mx-auto leading-relaxed font-medium transition-all duration-1000 ${
            heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "0.2s" }}
        >
          Convert, analyze, merge, split, and share PDFs and Word documents — entirely in your browser, free forever.
        </p>

        {/* CTA Buttons */}
        <div
          className={`mt-8 flex flex-wrap justify-center gap-4 transition-all duration-1000 ${
            heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "0.25s" }}
        >
          <Link
            href="/pdf-tools"
            className="group relative inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#7c6aff] to-[#5b4bcf] px-7 py-3.5 text-[14px] font-bold text-white no-underline shadow-xl shadow-[#7c6aff]/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#7c6aff]/35 active:scale-[0.97] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <UIcon name="Sparkles" size={16} />
            Get started
            <UIcon name="ArrowRight" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2.5 rounded-2xl border border-white/[0.1] bg-white/[0.04] px-7 py-3.5 text-[14px] font-bold text-white no-underline transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.16] hover:-translate-y-1 active:scale-[0.97]"
          >
            <UIcon name="Microscope" size={16} />
            Analyze docs
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-14 flex flex-wrap justify-center gap-10 md:gap-14">
          {stats.map((s, i) => (
            <AnimatedStat key={s.label} stat={s} index={i} />
          ))}
        </div>
      </section>

      {/* Section Heading */}
      <div className="w-full max-w-[960px] mb-2">
        <div className="flex items-center gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7c6aff]/10 border border-[#7c6aff]/15 text-[#7c6aff]">
            <UIcon name="LayoutGrid" size={14} />
          </div>
          <span className="font-display text-[15px] font-bold text-white">All Tools</span>
          <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
        </div>
      </div>

      {/* Tool cards grid */}
      <section className="w-full max-w-[960px] grid grid-cols-1 sm:grid-cols-2 gap-5">
        {tools.map((tool, i) => (
          <ToolCard key={tool.href} tool={tool} index={i} />
        ))}
      </section>

      {/* Bottom flourish */}
      <div className="mt-16 mb-8 text-center animate-fade-in" style={{ animationDelay: "0.8s" }}>
        <div className="flex items-center justify-center gap-3 text-[13px] text-[#6b6d80] font-medium">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/[0.06]" />
          <UIcon name="Lock" size={12} />
          <span>Your files never leave your device</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/[0.06]" />
        </div>
      </div>
    </div>
  );
}
