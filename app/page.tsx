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
                  className="vintage-button vintage-button-primary w-full sm:w-auto no-underline justify-center shadow-lg"
                >
                  <UIcon name="FileText" size={16} />
                  Open PDF Tools
                </Link>
              </Tip>
              <Tip tip="Open the document analyzer." side="bottom">
                <Link
                  href="/analyze"
                  className="vintage-button w-full sm:w-auto no-underline justify-center"
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
            <div key={tool.href} className="h-full">
              <Tip tip={tool.tip} side="top">
                <Link href={tool.href} title={tool.tip} className="block h-full no-underline">
                  <SCard>
                    <div className="flex h-full flex-col gap-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl"
                        style={{
                          color: tool.accent,
                          background: "rgba(0,0,0,0.05)",
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
                        <span className="vintage-badge">
                          <UIcon name="ExternalLink" size={12} />
                          Open
                        </span>
                        <div className="h-px flex-1 bg-black/10 mx-2" />
                      </div>
                    </div>
                  </SCard>
                </Link>
              </Tip>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
