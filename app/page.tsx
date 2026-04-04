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
    desc: "Extract cleaner text from PDFs and DOCX files, then explore search, stats, and customer-ready exports.",
    features: ["Smarter PDF text", "Word frequency", "Full-text search", "Export results"],
    color: "#3b82f6",
  },
  {
    href: "/pdf-tools",
    icon: "📄",
    title: "PDF Tools",
    desc: "Convert, merge, split, rotate, and export PDFs with a much stronger PDF to DOCX workflow.",
    features: ["Accurate PDF -> DOCX", "PDF -> Images", "Merge PDFs", "Split pages", "Rotate pages", "Images -> PDF"],
    color: "#ef4444",
  },
  {
    href: "/docx-tools",
    icon: "📝",
    title: "DOCX Tools",
    desc: "Convert Word documents into cleaner HTML, text, Markdown, and print-ready PDF previews.",
    features: ["DOCX -> HTML", "DOCX -> Text", "DOCX -> Markdown", "Print-ready PDF", "CSV -> HTML"],
    color: "#10b981",
  },
  {
    href: "/support",
    icon: "💬",
    title: "Help & Support",
    desc: "Browse FAQs, learn tips, or reach out when you need help getting the best output.",
    features: ["FAQ", "Quick tips", "Contact form", "Feature requests"],
    color: "#8b5cf6",
  },
];

export default function HomePage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-16 text-center md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber/5 to-transparent" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-6 inline-block rounded-2xl border border-paper3 bg-paper2 p-4 shadow-sm">
            <Emoji symbol="📄" size={48} className="text-amber" />
          </div>
          <h1 className="mb-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-ink md:text-5xl lg:text-6xl">
            Your documents,
            <br />
            <span className="cursor-default bg-gradient-to-r from-amber to-amber2 bg-clip-text text-transparent">
              converted with care
            </span>
          </h1>
          <p className="mb-10 max-w-[560px] text-base leading-relaxed text-ink3 md:text-lg">
            Analyze, convert, and manage PDF & DOCX files with higher-fidelity
            exports. Private, fast, and built for customer-ready results.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Tip tip="Jump into document analysis" side="bottom">
              <Link
                href="/analyze"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-amber px-8 py-3 text-[15px] font-semibold text-white no-underline shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber2 hover:shadow-lg"
              >
                <Emoji symbol="🔬" size={18} /> Start Analysing
              </Link>
            </Tip>
            <Tip tip="Browse all conversion tools" side="bottom">
              <Link
                href="/pdf-tools"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-paper3 bg-paper px-8 py-3 text-[15px] font-semibold text-ink2 no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-paper2 hover:shadow"
              >
                <Emoji symbol="🔄" size={18} /> Convert Files
              </Link>
            </Tip>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-10 lg:px-20">
        <div className="mb-8 flex items-center gap-4">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-paper3 bg-paper2 shadow-sm">
            <Emoji symbol="🧰" size={20} />
          </div>
          <div className="text-2xl font-bold text-ink">All tools</div>
          <div className="mt-1 flex-1 border-t border-paper3" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="group no-underline outline-none">
              <SCard>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-paper3 bg-paper text-ink2 shadow-sm transition-transform duration-300 group-hover:scale-110">
                    <Emoji symbol={tool.icon} size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2 text-xl font-bold text-ink transition-colors group-hover:text-amber">
                      {tool.title}
                      <span className="translate-x-[-8px] text-sm font-normal text-ink4 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                        {"->"}
                      </span>
                    </div>
                    <div className="mb-4 text-[14px] leading-relaxed text-ink4">
                      {tool.desc}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tool.features.map((feature) => (
                        <span
                          key={feature}
                          className="rounded border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                          style={{
                            borderColor: `${tool.color}33`,
                            color: tool.color,
                            backgroundColor: `${tool.color}11`,
                          }}
                        >
                          {feature}
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

      <section className="mx-auto max-w-5xl px-6 pb-16 md:px-10 lg:px-20">
        <div className="flex flex-col items-center rounded-2xl border border-teal/20 bg-teal/5 p-8 text-center md:p-12">
          <div className="mb-4 rounded-full bg-teal/10 p-3">
            <Emoji symbol="🔒" size={28} className="text-teal" />
          </div>
          <div className="mb-3 text-2xl font-bold text-teal">
            100% Private & Secure
          </div>
          <div className="max-w-2xl text-[15px] leading-relaxed text-ink3">
            Every single operation happens right in your browser. Your files
            never leave your device - no server uploads, no cloud storage, no
            tracking. OneDocs stays private while still giving you stronger
            conversion output.
          </div>
        </div>
      </section>

      <footer className="border-t border-paper3 px-6 py-8 text-center">
        <div className="text-sm font-medium text-ink4">
          Made by{" "}
          <a
            href="https://x.com/alivldm"
            className="font-bold text-ink transition-colors hover:text-amber"
          >
            Ali
          </a>{" "}
          - OneDocs is free, private, and built to make document conversion feel
          trustworthy.
        </div>
      </footer>
    </div>
  );
}
