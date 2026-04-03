"use client";

import React from "react";
import Link from "next/link";
import { Tip, SCard } from "./components/DocLensUI";

const tools = [
  {
    href: "/analyze",
    icon: "🔬",
    title: "Analyse Documents",
    desc: "Extract text from PDFs and DOCX files. Get word counts, sentence stats, frequency analysis, and search within documents.",
    features: ["Text extraction", "Word frequency", "Full-text search", "Export results"],
    color: "#c07818",
    rot: 0.3,
  },
  {
    href: "/pdf-tools",
    icon: "📄",
    title: "PDF Tools",
    desc: "Convert, merge, split, rotate PDFs. Turn images into PDFs or render pages as PNG images.",
    features: ["PDF → Text", "PDF → Images", "Merge PDFs", "Split pages", "Rotate pages", "Images → PDF"],
    color: "#b02020",
    rot: -0.2,
  },
  {
    href: "/docx-tools",
    icon: "📝",
    title: "DOCX Tools",
    desc: "Convert Word documents to HTML, plain text, or Markdown. Also convert TXT/CSV into formatted outputs.",
    features: ["DOCX → HTML", "DOCX → Text", "DOCX → Markdown", "TXT → PDF", "CSV → HTML"],
    color: "#1a5c5c",
    rot: 0.2,
  },
  {
    href: "/support",
    icon: "💬",
    title: "Help & Support",
    desc: "Browse FAQs, learn tips, or get in touch with us. Everything you need to get started.",
    features: ["FAQ", "Quick tips", "Contact form", "Feature requests"],
    color: "#7a5535",
    rot: -0.3,
  },
];

export default function HomePage() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center py-12 md:py-20 px-6">
        <div className="text-[56px] md:text-[72px] inline-block animate-wobble-in -rotate-[6deg] mb-4">📄</div>
        <h1 className="font-caveat text-[36px] md:text-[48px] font-bold text-ink2 -rotate-[0.5deg] mb-3 leading-tight">
          Your documents,<br />
          <span className="text-amber">understood</span>
        </h1>
        <p className="font-patrick text-[16px] md:text-[18px] text-ink4 max-w-[480px] leading-[1.75] mb-8">
          Analyze, convert, and manage PDF & DOCX files — entirely in your browser.
          No uploads, no accounts, no limits.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Tip tip="Jump into document analysis" side="bottom">
            <Link
              href="/analyze"
              className="py-[12px] px-[28px] bg-amber hover:bg-amber2 text-white font-caveat text-[18px] font-bold rounded-[3px_12px_5px_10px] border-2 border-amber2 shadow-[2px_3px_0_rgba(30,15,5,.15)] hover:shadow-[3px_4px_0_rgba(30,15,5,.2)] hover:-translate-y-[1px] transition-all duration-150 no-underline cursor-pointer"
            >
              🔬 Start Analysing
            </Link>
          </Tip>
          <Tip tip="Browse all conversion tools" side="bottom">
            <Link
              href="/pdf-tools"
              className="py-[12px] px-[28px] bg-paper hover:bg-paper2 text-ink2 font-caveat text-[18px] font-bold rounded-[3px_12px_5px_10px] border-2 border-[rgba(60,35,10,.32)] shadow-[2px_3px_0_rgba(30,15,5,.1)] hover:shadow-[3px_4px_0_rgba(30,15,5,.15)] hover:-translate-y-[1px] transition-all duration-150 no-underline cursor-pointer"
            >
              🔄 Convert Files
            </Link>
          </Tip>
        </div>
      </section>

      {/* Tool cards */}
      <section className="px-4 md:px-8 lg:px-16 pb-16">
        <div className="flex items-center gap-[14px] mb-6 px-2">
          <span className="text-[22px] -rotate-[4deg] inline-block">🧰</span>
          <div className="font-caveat text-[24px] font-bold text-ink2 leading-none relative inline-block">
            All tools
            <svg className="absolute -bottom-1 left-0 w-full h-[6px] overflow-visible" viewBox="0 0 100 6" preserveAspectRatio="none">
              <path d="M2,4 Q25,1 50,3.5 Q75,6 98,2" stroke="var(--color-amber)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1 border-t-[1.5px] border-dashed border-[rgba(100,70,40,.22)] mt-[2px]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="no-underline group">
              <SCard rotate={tool.rot}>
                <div className="flex items-start gap-[14px]">
                  <span className="text-[32px] flex-shrink-0 inline-block group-hover:-rotate-[5deg] transition-transform duration-200">
                    {tool.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-caveat text-[22px] font-bold text-ink2 mb-[4px] leading-[1.1] flex items-center gap-2">
                      {tool.title}
                      <span className="text-[14px] text-ink4 font-patrick font-normal">→</span>
                    </div>
                    <div className="font-patrick text-[14px] text-ink4 leading-[1.6] mb-3">{tool.desc}</div>
                    <div className="flex flex-wrap gap-[6px]">
                      {tool.features.map((f) => (
                        <span
                          key={f}
                          className="font-caveat text-[12px] font-bold py-[2px] px-[10px] rounded-[2px_7px_3px_6px] border-[1.5px] tracking-[0.5px]"
                          style={{ borderColor: tool.color, color: tool.color }}
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
      <section className="px-4 md:px-8 lg:px-16 pb-16">
        <div className="bg-[rgba(26,92,92,.06)] border-2 border-teal rounded-[4px_16px_6px_14px] p-6 md:p-8 text-center">
          <div className="text-[28px] mb-2">🔒</div>
          <div className="font-caveat text-[22px] font-bold text-teal mb-2">100% Private & Secure</div>
          <div className="font-patrick text-[14px] text-ink3 max-w-[500px] mx-auto leading-[1.7]">
            Every single operation happens right in your browser. Your files never leave your device — no server uploads, no cloud storage, no tracking. DocLens is completely free and always will be.
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t-2 border-dashed border-[rgba(100,70,40,.15)] text-center">
        <div className="font-caveat text-[15px] text-ink4">
          Made by <a href="https://x.com/alivldm">Ali</a> — OneDocs is free, open, and privacy-first.
        </div>
      </footer>
    </div>
  );
}