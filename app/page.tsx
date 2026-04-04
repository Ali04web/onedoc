"use client";

import React from "react";
import Link from "next/link";
import { Emoji } from "./components/Icons";
import { SCard, Tip } from "./components/DocLensUI";

const tools = [
  {
    href: "/analyze",
    icon: "🔬",
    title: "Analyse Documents",
    desc: "Inspect PDFs and DOCX files with searchable text, reading stats, and export-ready outputs.",
    features: ["Cleaner extraction", "Search and stats", "Quick exports"],
    accent: "var(--color-amber)",
  },
  {
    href: "/pdf-tools",
    icon: "📄",
    title: "PDF Tools",
    desc: "Handle PDF conversion, page operations, previews, and delivery with a far more premium workflow.",
    features: ["Convert", "Merge or split", "Share and present"],
    accent: "var(--color-red)",
  },
  {
    href: "/docx-tools",
    icon: "📝",
    title: "DOCX Tools",
    desc: "Transform Word documents into HTML, Markdown, text, and polished printable outputs.",
    features: ["HTML and Markdown", "Text cleanup", "Print-ready exports"],
    accent: "var(--color-teal)",
  },
  {
    href: "/support",
    icon: "💬",
    title: "Help and Support",
    desc: "Guide customers, answer common questions, and keep the experience feeling cared for at every step.",
    features: ["FAQs", "Usage tips", "Support requests"],
    accent: "var(--color-ink3)",
  },
];

const principles = [
  {
    title: "Private by default",
    body: "Work with sensitive documents without sending them to a third-party service.",
  },
  {
    title: "Sharper outputs",
    body: "Conversions are presented in a way that feels reliable and customer-ready.",
  },
  {
    title: "One visual language",
    body: "The full product now shares one premium design system instead of disconnected tool screens.",
  },
];

export default function HomePage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="page-shell">
        <section className="page-hero p-8 md:p-10 xl:p-14">
          <div className="relative z-10 grid gap-10 xl:grid-cols-[minmax(0,1.2fr)_380px] xl:items-end">
            <div>
              <div className="page-kicker mb-5">Premium Document Workspace</div>
              <h1 className="page-title max-w-[760px]">
                A richer, more trusted experience for document conversion.
              </h1>
              <p className="page-copy mt-6">
                OneDocs helps you analyse, convert, present, and share PDF and
                DOCX files with a refined interface that feels deliberate,
                private, and built by someone who cares about the final result.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Tip tip="Jump into your document workspace" side="bottom">
                  <Link
                    href="/analyze"
                    className="inline-flex items-center gap-2 rounded-full border border-amber2/30 bg-gradient-to-r from-amber to-amber2 px-6 py-3.5 text-[15px] font-semibold text-white no-underline shadow-[0_18px_30px_rgba(186,138,66,.24)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_36px_rgba(186,138,66,.3)]"
                  >
                    <Emoji symbol="🔬" size={18} />
                    Open Analysis
                  </Link>
                </Tip>
                <Tip tip="Browse premium conversion tools" side="bottom">
                  <Link
                    href="/pdf-tools"
                    className="inline-flex items-center gap-2 rounded-full border border-[rgba(42,34,24,.12)] bg-white/78 px-6 py-3.5 text-[15px] font-semibold text-ink2 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
                  >
                    <Emoji symbol="📄" size={18} />
                    Explore Tools
                  </Link>
                </Tip>
              </div>
            </div>

            <div className="surface-panel p-6 md:p-7">
              <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-ink4">
                Product signals
              </div>
              <div className="premium-grid mt-5 md:grid-cols-3 xl:grid-cols-1">
                <div className="premium-metric">
                  <strong>Private</strong>
                  <span>Files stay with you while the interface feels premium.</span>
                </div>
                <div className="premium-metric">
                  <strong>Polished</strong>
                  <span>Every tool page now shares one higher-end visual language.</span>
                </div>
                <div className="premium-metric">
                  <strong>Focused</strong>
                  <span>Clear layouts, better spacing, stronger contrast, better trust.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {principles.map((item) => (
            <div key={item.title} className="surface-panel p-6">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink4">
                Design Principle
              </div>
              <div className="mt-3 font-caveat text-[28px] font-semibold leading-none text-ink2">
                {item.title}
              </div>
              <p className="mt-3 text-[14px] leading-relaxed text-ink3">{item.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-12">
          <div className="mb-6 flex items-center gap-4">
            <div className="page-kicker">Workspaces</div>
            <div className="premium-divider flex-1" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {tools.map((tool) => (
              <Link key={tool.href} href={tool.href} className="no-underline">
                <SCard>
                  <div className="flex items-start gap-5">
                    <div
                      className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border bg-white/85"
                      style={{ borderColor: `${tool.accent}30`, color: tool.accent }}
                    >
                      <Emoji symbol={tool.icon} size={24} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <h2 className="font-caveat text-[28px] font-semibold leading-none text-ink2">
                          {tool.title}
                        </h2>
                        <span className="premium-chip">
                          <Emoji symbol="↗" size={12} />
                          Open
                        </span>
                      </div>
                      <p className="mt-3 text-[14px] leading-relaxed text-ink3">
                        {tool.desc}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {tool.features.map((feature) => (
                          <span key={feature} className="premium-chip">
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

        <section className="mt-12 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
          <div className="surface-panel p-8">
            <div className="page-kicker mb-4">Trust and performance</div>
            <div className="font-caveat text-[34px] font-semibold leading-none text-ink2">
              Designed to feel premium without losing speed or privacy.
            </div>
            <p className="mt-4 max-w-[760px] text-[15px] leading-relaxed text-ink3">
              The refresh focuses on typography, spacing, depth, and interaction
              quality so the app feels like a serious product, not a quick UI
              mock. That means cleaner surfaces, stronger hierarchy, calmer
              motion, and clearer actions across every page.
            </p>
          </div>
          <div className="surface-panel p-8">
            <div className="page-kicker mb-4">Always on-brand</div>
            <div className="font-caveat text-[30px] font-semibold leading-none text-ink2">
              One visual identity
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-ink3">
              Home, tools, uploads, analysis, support, and viewing now align
              around the same material palette and premium layout logic.
            </p>
            <div className="mt-6 premium-divider" />
            <div className="mt-6 text-[13px] font-semibold uppercase tracking-[0.22em] text-ink4">
              OneDocs
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
