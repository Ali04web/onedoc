"use client";

import React from "react";
import Link from "next/link";
import { PageHero } from "./components/PageHero";
import { SCard, Tip } from "./components/DocLensUI";
import { UIcon } from "./components/Icons";

const tools = [
  {
    href: "/analyze",
    icon: "Microscope" as const,
    title: "Analyze",
    desc: "Read, search, and export document text.",
    accent: "var(--color-teal)",
    tip: "Open the analyzer for PDFs and DOCX files.",
  },
  {
    href: "/pdf-tools",
    icon: "FileText" as const,
    title: "PDF Tools",
    desc: "Convert, merge, split, and rotate PDFs.",
    accent: "var(--color-red)",
    tip: "Open the PDF workspace for conversion and file organization.",
  },
  {
    href: "/docx-tools",
    icon: "FileSignature" as const,
    title: "DOCX Tools",
    desc: "Export DOCX to HTML, text, markdown, or PDF.",
    accent: "var(--color-amber2)",
    tip: "Open the DOCX workspace for Word document exports.",
  },
  {
    href: "/pdf-link",
    icon: "Link" as const,
    title: "PDF Link",
    desc: "Turn a PDF into a shareable viewer link.",
    accent: "var(--color-violet)",
    tip: "Generate a hosted link for a PDF viewer page.",
  },
];

export default function HomePage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="page-shell">
        <PageHero
          kicker="Home"
          title="All your document tools in one place."
          copy="Pick a workspace below, or jump straight into the PDF tools. The home hero stays here only, and everything underneath gets you into the tools fast."
          chips={["PDF + DOCX", "Tool-first", "Mobile-ready"]}
          artMode="home"
          actions={
            <>
              <Tip tip="Open the full PDF conversion workspace." side="bottom">
                <Link
                  href="/pdf-tools"
                  title="Open the full PDF conversion workspace."
                  className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--color-red),var(--color-violet),var(--color-teal))] px-5 py-3 text-[14px] font-semibold text-white no-underline shadow-[0_18px_30px_rgba(54,74,146,.22)] transition-all duration-200 hover:-translate-y-0.5"
                >
                  <UIcon name="FileText" size={16} />
                  Open PDF Tools
                </Link>
              </Tip>
              <Tip tip="Open the document analyzer." side="bottom">
                <Link
                  href="/analyze"
                  title="Open the document analyzer."
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(110,124,255,.16)] bg-white/88 px-5 py-3 text-[14px] font-semibold text-ink2 no-underline transition-all duration-200 hover:-translate-y-0.5"
                >
                  <UIcon name="Microscope" size={16} />
                  Analyze Files
                </Link>
              </Tip>
            </>
          }
        />

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tools.map((tool) => (
            <Tip key={tool.href} tip={tool.tip} side="top">
              <Link href={tool.href} title={tool.tip} className="no-underline">
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
                      <UIcon name={tool.icon} size={22} />
                    </div>

                    <div>
                      <div className="font-caveat text-[24px] font-semibold leading-none text-ink2">
                        {tool.title}
                      </div>
                      <div className="mt-2 text-[13px] leading-relaxed text-ink4">
                        {tool.desc}
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3">
                      <span className="premium-chip">
                        <UIcon name="ExternalLink" size={12} />
                        Open
                      </span>
                      <div className="h-2 flex-1 rounded-full bg-[linear-gradient(90deg,rgba(110,124,255,.14),rgba(16,199,162,.14),rgba(255,145,71,.14))]" />
                    </div>
                  </div>
                </SCard>
              </Link>
            </Tip>
          ))}
        </section>
      </div>
    </div>
  );
}
