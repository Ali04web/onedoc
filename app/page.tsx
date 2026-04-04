"use client";

import React from "react";
import Link from "next/link";
import { Emoji } from "./components/Icons";
import { SCard } from "./components/DocLensUI";
import { BrandSymbol } from "./components/BrandSymbol";

const tools = [
  {
    href: "/analyze",
    icon: "🔬",
    title: "Analyze",
    desc: "Read, search, and export document text.",
    accent: "var(--color-teal)",
  },
  {
    href: "/pdf-tools",
    icon: "📄",
    title: "PDF Tools",
    desc: "Convert, merge, split, and rotate PDFs.",
    accent: "var(--color-red)",
  },
  {
    href: "/docx-tools",
    icon: "📝",
    title: "DOCX Tools",
    desc: "Export DOCX to HTML, text, markdown, or PDF.",
    accent: "var(--color-amber2)",
  },
  {
    href: "/pdf-link",
    icon: "🔗",
    title: "PDF Link",
    desc: "Turn a PDF into a shareable viewer link.",
    accent: "var(--color-teal)",
  },
];

export default function HomePage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="page-shell">
        <section className="page-hero p-7 md:p-8">
          <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <div className="page-kicker mb-4">Simple, colorful, faster</div>
              <h1 className="page-title max-w-[700px]">
                Convert, analyze, and share documents without the clutter.
              </h1>
              <p className="page-copy mt-4">
                OneDocs keeps the UI light and puts the tools first.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/pdf-tools"
                  className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--color-red),var(--color-amber2))] px-5 py-3 text-[14px] font-semibold text-white no-underline shadow-[0_16px_28px_rgba(240,141,54,.26)] transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Emoji symbol="📄" size={16} />
                  Open PDF Tools
                </Link>
                <Link
                  href="/analyze"
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(91,124,255,.14)] bg-white/88 px-5 py-3 text-[14px] font-semibold text-ink2 no-underline transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Emoji symbol="🔬" size={16} />
                  Analyze Files
                </Link>
              </div>
            </div>

            <div className="surface-panel flex items-center gap-4 p-5">
              <div className="rounded-[24px] bg-white/92 p-2 shadow-[0_16px_28px_rgba(93,104,214,.14)]">
                <BrandSymbol size={74} detailed />
              </div>
              <div className="min-w-0">
                <div className="font-caveat text-[24px] font-semibold leading-none text-ink2">
                  OneDocs mark
                </div>
                <div className="mt-2 text-[13px] leading-relaxed text-ink4">
                  Custom SVG identity built around documents, links, and bright motion.
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="premium-chip">PDF + DOCX</span>
                  <span className="premium-chip">Readable UI</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="no-underline">
              <SCard>
                <div className="flex h-full flex-col gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{
                      color: tool.accent,
                      background:
                        tool.title === "PDF Tools"
                          ? "linear-gradient(135deg, rgba(255,100,116,.14), rgba(255,195,77,.18))"
                          : tool.title === "DOCX Tools"
                            ? "linear-gradient(135deg, rgba(255,143,63,.14), rgba(110,124,255,.16))"
                            : "linear-gradient(135deg, rgba(110,124,255,.14), rgba(22,199,161,.16))",
                    }}
                  >
                    <Emoji symbol={tool.icon} size={22} />
                  </div>
                  <div>
                    <div className="font-caveat text-[24px] font-semibold leading-none text-ink2">
                      {tool.title}
                    </div>
                    <div className="mt-2 text-[13px] leading-relaxed text-ink4">
                      {tool.desc}
                    </div>
                  </div>
                  <div className="mt-auto">
                    <span className="premium-chip">
                      <Emoji symbol="↗" size={12} />
                      Open
                    </span>
                  </div>
                </div>
              </SCard>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
