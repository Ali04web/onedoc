"use client";

import React from "react";
import Link from "next/link";
import { Tip, SCard } from "./components/DocLensUI";
import { Emoji } from "./components/Icons";

const tools = [
  {
    href: "/analyze",
    icon: "🔬",
    title: "Analyse Documents",
    desc: "Extract text from PDFs and DOCX files. Get word counts, sentence stats, frequency analysis, and search within documents.",
    features: ["Text extraction", "Word frequency", "Full-text search", "Export results"],
    color: "#3b82f6", // amber to blue
  },
  {
    href: "/pdf-tools",
    icon: "📄",
    title: "PDF Tools",
    desc: "Convert, merge, split, rotate PDFs. Turn images into PDFs or render pages as PNG images.",
    features: ["PDF → Text", "PDF → Images", "Merge PDFs", "Split pages", "Rotate pages", "Images → PDF"],
    color: "#ef4444", // red
  },
  {
    href: "/docx-tools",
    icon: "📝",
    title: "DOCX Tools",
    desc: "Convert Word documents to HTML, plain text, or Markdown. Also convert TXT/CSV into formatted outputs.",
    features: ["DOCX → HTML", "DOCX → Text", "DOCX → Markdown", "TXT → PDF", "CSV → HTML"],
    color: "#10b981", // teal to emerald
  },
  {
    href: "/support",
    icon: "💬",
    title: "Help & Support",
    desc: "Browse FAQs, learn tips, or get in touch with us. Everything you need to get started.",
    features: ["FAQ", "Quick tips", "Contact form", "Feature requests"],
    color: "#8b5cf6", // brown to purple
  },
];

export default function HomePage() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center py-16 md:py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-block animate-slide-down mb-6 bg-paper2 p-4 rounded-2xl shadow-sm border border-paper3"><Emoji symbol="📄" size={48} className="text-amber" /></div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-ink mb-6 tracking-tight leading-tight max-w-3xl">
            Your documents,<br />
            <span className="text-amber bg-clip-text text-transparent bg-gradient-to-r from-amber to-amber2 cursor-default">understood</span>
          </h1>
          <p className="text-base md:text-lg text-ink3 max-w-[540px] leading-relaxed mb-10">
            Analyze, convert, and manage PDF & DOCX files. Entirely in your browser.
            No uploads, no accounts, no limits.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Tip tip="Jump into document analysis" side="bottom">
              <Link
                href="/analyze"
                className="py-3 px-8 bg-amber hover:bg-amber2 text-white text-[15px] font-semibold rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 no-underline flex items-center justify-center gap-2 cursor-pointer"
              >
                <Emoji symbol="🔬" size={18} /> Start Analysing
              </Link>
            </Tip>
            <Tip tip="Browse all conversion tools" side="bottom">
              <Link
                href="/pdf-tools"
                className="py-3 px-8 bg-paper hover:bg-paper2 text-ink2 text-[15px] font-semibold rounded-full border border-paper3 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all duration-200 no-underline flex items-center justify-center gap-2 cursor-pointer"
              >
                <Emoji symbol="🔄" size={18} /> Convert Files
              </Link>
            </Tip>
          </div>
        </div>
      </section>

      {/* Tool cards */}
      <section className="px-6 md:px-10 lg:px-20 pb-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-paper2 border border-paper3 shadow-sm"><Emoji symbol="🧰" size={20} /></div>
          <div className="text-2xl font-bold text-ink">
            All tools
          </div>
          <div className="flex-1 border-t border-paper3 mt-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="no-underline group outline-none">
              <SCard>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-paper border border-paper3 text-ink2 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <Emoji symbol={tool.icon} size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xl font-bold text-ink mb-2 flex items-center gap-2 group-hover:text-amber transition-colors">
                      {tool.title}
                      <span className="text-sm text-ink4 font-normal opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">→</span>
                    </div>
                    <div className="text-[14px] text-ink4 leading-relaxed mb-4">{tool.desc}</div>
                    <div className="flex flex-wrap gap-2">
                      {tool.features.map((f) => (
                        <span
                          key={f}
                          className="text-[11px] font-semibold py-1 px-2.5 rounded border tracking-wide uppercase"
                          style={{ borderColor: `${tool.color}33`, color: tool.color, backgroundColor: `${tool.color}11` }}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </SCard>
            </Link>
          ))}
        </div>
      </section>

      {/* Privacy notice */}
      <section className="px-6 md:px-10 lg:px-20 pb-16 max-w-5xl mx-auto">
        <div className="bg-teal/5 border border-teal/20 rounded-2xl p-8 md:p-12 text-center flex flex-col items-center">
          <div className="mb-4 bg-teal/10 p-3 rounded-full"><Emoji symbol="🔒" size={28} className="text-teal" /></div>
          <div className="text-2xl font-bold text-teal mb-3">100% Private & Secure</div>
          <div className="text-[15px] text-ink3 max-w-2xl mx-auto leading-relaxed">
            Every single operation happens right in your browser. Your files never leave your device — no server uploads, no cloud storage, no tracking. DocLens is completely free and always will be.
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-paper3 text-center">
        <div className="text-sm text-ink4 font-medium">
          Made by <a href="https://x.com/alivldm" className="text-ink hover:text-amber transition-colors font-bold">Ali</a> — OneDocs is free, open, and privacy-first.
        </div>
      </footer>
    </div>
  );
}