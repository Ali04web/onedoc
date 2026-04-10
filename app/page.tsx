"use client";

import React from "react";
import Link from "next/link";
import { UIcon } from "./components/Icons";

const tools = [
  {
    href: "/analyze",
    icon: "Microscope",
    label: "Analyze",
    desc: "Extract text, search, and generate insights from PDFs & DOCX files.",
    gradient: "from-[#7c6aff] to-[#a78bfa]",
    glow: "rgba(124, 106, 255, 0.15)",
  },
  {
    href: "/pdf-tools",
    icon: "FileText",
    label: "PDF Suite",
    desc: "Convert, merge, split, rotate, lock, and unlock your PDF files.",
    gradient: "from-[#ff6b6b] to-[#ee5a24]",
    glow: "rgba(255, 107, 107, 0.15)",
  },
  {
    href: "/docx-tools",
    icon: "FileSignature",
    label: "Word Tools",
    desc: "Export DOCX to HTML, text, markdown, PDF, and CSV to HTML tables.",
    gradient: "from-[#ffa940] to-[#ff7b3a]",
    glow: "rgba(255, 169, 64, 0.15)",
  },
  {
    href: "/pdf-link",
    icon: "Link",
    label: "PDF Link",
    desc: "Upload a PDF and instantly get a shareable viewer link.",
    gradient: "from-[#00d4aa] to-[#00b894]",
    glow: "rgba(0, 212, 170, 0.15)",
  },
] as const;

const stats = [
  { value: "100%", label: "In-browser" },
  { value: "Free", label: "No sign-up" },
  { value: "12+", label: "Tools" },
  { value: "0", label: "Data stored" },
];

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center p-6 md:p-8 min-h-[80vh] relative z-10 w-full">
      {/* Hero Section */}
      <section className="w-full max-w-[960px] text-center mt-12 md:mt-20 mb-16 md:mb-20">
        {/* Floating badge */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-[#7c6aff]/10 border border-[#7c6aff]/15 text-[12px] font-semibold text-[#a78bfa] tracking-wide uppercase animate-fade-in">
          <div className="h-1.5 w-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
          All tools free · No sign-up required
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight animate-fade-in"
            style={{ animationDelay: "0.05s" }}>
          Your documents,{" "}
          <span className="bg-gradient-to-r from-[#7c6aff] via-[#00d4aa] to-[#ffa940] bg-clip-text text-transparent">
            reimagined
          </span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-[#9294a5] max-w-[600px] mx-auto leading-relaxed font-medium animate-fade-in"
           style={{ animationDelay: "0.1s" }}>
          Convert, analyze, merge, split, and share PDFs and Word documents — entirely in your browser, free forever.
        </p>

        {/* Stats row */}
        <div className="mt-10 flex flex-wrap justify-center gap-8 md:gap-12 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-2xl md:text-3xl font-bold text-white">{s.value}</div>
              <div className="text-[12px] text-[#6b6d80] font-medium uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tool cards grid */}
      <section className="w-full max-w-[960px] grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group relative flex flex-col p-6 md:p-8 rounded-2xl bg-white/[0.025] backdrop-blur-sm border border-white/[0.06] no-underline transition-all duration-300 hover:border-white/[0.12] hover:-translate-y-1 hover:shadow-2xl active:scale-[0.99]"
            style={{
              boxShadow: `0 0 0 0 transparent`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px ${tool.glow}`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 0 transparent`;
            }}
          >
            {/* Icon */}
            <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-5 shadow-lg transition-transform duration-300 group-hover:scale-110`}
                 style={{ boxShadow: `0 8px 24px ${tool.glow}` }}>
              <UIcon name={tool.icon as any} size={22} className="text-white" />
            </div>

            <h2 className="font-display text-xl font-bold text-white mb-2 tracking-tight">{tool.label}</h2>
            <p className="text-[14px] text-[#9294a5] leading-relaxed flex-1">{tool.desc}</p>

            {/* Arrow */}
            <div className="mt-5 flex items-center gap-2 text-[13px] font-semibold text-[#6b6d80] group-hover:text-white transition-colors duration-300">
              Open tool
              <UIcon name="ArrowRight" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </section>

    </div>
  );
}
