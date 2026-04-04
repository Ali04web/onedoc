"use client";

import React from "react";
import Link from "next/link";
import { Emoji } from "./components/Icons";
import { SCard } from "./components/DocLensUI";
import { PageHero } from "./components/PageHero";

const tools = [
  {
    href: "/analyze",
    icon: "ðŸ”¬",
    title: "Analyze",
    desc: "Read, search, and export document text.",
    accent: "var(--color-teal)",
  },
  {
    href: "/pdf-tools",
    icon: "ðŸ“„",
    title: "PDF Tools",
    desc: "Convert, merge, split, and rotate PDFs.",
    accent: "var(--color-red)",
  },
  {
    href: "/docx-tools",
    icon: "ðŸ“",
    title: "DOCX Tools",
    desc: "Export DOCX to HTML, text, markdown, or PDF.",
    accent: "var(--color-amber2)",
  },
  {
    href: "/pdf-link",
    icon: "ðŸ”—",
    title: "PDF Link",
    desc: "Turn a PDF into a shareable viewer link.",
    accent: "var(--color-violet)",
  },
];

export default function HomePage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="page-shell">
        <PageHero
          kicker="Simple, colorful, faster"
          title="Convert, analyze, and share documents with a clearer visual flow."
          copy="The new hero artwork gives OneDocs a stronger personality while the workspace still stays quick to scan and easy to use."
          chips={["PDF + DOCX", "Accurate output", "Shareable viewer"]}
          stats={[
            { label: "Main tools", value: "4 workspaces" },
            { label: "Best fit", value: "Fast daily use" },
            { label: "Style", value: "Bright and readable" },
          ]}
          artMode="home"
          actions={
            <>
              <Link
                href="/pdf-tools"
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--color-red),var(--color-violet),var(--color-amber2))] px-5 py-3 text-[14px] font-semibold text-white no-underline shadow-[0_18px_30px_rgba(54,74,146,.22)] transition-all duration-200 hover:-translate-y-0.5"
              >
                <Emoji symbol="ðŸ“„" size={16} />
                Open PDF Tools
              </Link>
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(110,124,255,.16)] bg-white/88 px-5 py-3 text-[14px] font-semibold text-ink2 no-underline transition-all duration-200 hover:-translate-y-0.5"
              >
                <Emoji symbol="ðŸ”¬" size={16} />
                Analyze Files
              </Link>
            </>
          }
        />

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
                          ? "linear-gradient(135deg, rgba(255,102,120,.14), rgba(255,201,90,.18))"
                          : tool.title === "DOCX Tools"
                            ? "linear-gradient(135deg, rgba(255,145,71,.14), rgba(110,124,255,.16))"
                            : tool.title === "PDF Link"
                              ? "linear-gradient(135deg, rgba(110,124,255,.16), rgba(85,199,247,.18))"
                              : "linear-gradient(135deg, rgba(110,124,255,.14), rgba(16,199,162,.16))",
                    }}
                  >
                    <Emoji symbol={tool.icon} size={22} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-caveat text-[24px] font-semibold leading-none text-ink2">
                        {tool.title}
                      </div>
                      <span className="premium-chip text-[11px]">Popular</span>
                    </div>
                    <div className="mt-2 text-[13px] leading-relaxed text-ink4">
                      {tool.desc}
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3">
                    <span className="premium-chip">
                      <Emoji symbol="â†—" size={12} />
                      Open
                    </span>
                    <div className="h-2 flex-1 rounded-full bg-[linear-gradient(90deg,rgba(110,124,255,.14),rgba(16,199,162,.14),rgba(255,145,71,.14))]" />
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
