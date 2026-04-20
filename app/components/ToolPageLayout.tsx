"use client";

import React from "react";
import Link from "next/link";
import { UIcon } from "./Icons";

export default function ToolPageLayout({
  title,
  description,
  icon,
  iconColor,
  iconBg,
  tip,
  backHref = "/",
  backLabel = "All Tools",
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  tip?: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="page-shell max-w-[680px]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] text-[#9aa0a6] font-medium animate-fade-in">
        <Link href={backHref} className="flex items-center gap-1.5 text-[#9aa0a6] hover:text-[#e5322d] no-underline transition-colors">
          <UIcon name="ChevronLeft" size={14} />
          {backLabel}
        </Link>
        <span className="text-black/[0.15]">/</span>
        <span className="text-[#1a1a2e] font-semibold truncate">{title}</span>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-black/[0.06] p-6 sm:p-8 animate-fade-in bg-white" style={{ animationDelay: "0.05s" }}>
        {/* Subtle background blob */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[60px] pointer-events-none opacity-30" style={{ background: iconColor }} />

        <div className="relative z-10 flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105"
            style={{ backgroundColor: iconColor, boxShadow: `0 8px 24px ${iconColor}30` }}
          >
            <div className="text-white">{icon}</div>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-[#1a1a2e] tracking-tight">{title}</h1>
            <p className="mt-1.5 text-[14px] text-[#5f6368] leading-relaxed max-w-[440px]">{description}</p>
            {tip && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#f7f8fc] border border-black/[0.04] px-3 py-2 text-[12px] text-[#5f6368] leading-relaxed">
                <UIcon name="Info" size={13} className="flex-shrink-0 mt-0.5 text-[#9aa0a6]" />
                {tip}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tool Body */}
      <div className="surface-panel p-5 sm:p-6 md:p-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="flex flex-col gap-4">
          {children}
        </div>
      </div>

      {/* Trust bar */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px] text-[#9aa0a6] font-medium animate-fade-in" style={{ animationDelay: "0.15s" }}>
        <span className="flex items-center gap-1.5"><UIcon name="ShieldCheck" size={12} />100% private</span>
        <span className="hidden sm:block h-3 w-px bg-black/[0.06]" />
        <span className="flex items-center gap-1.5"><UIcon name="Zap" size={12} />In-browser processing</span>
        <span className="hidden sm:block h-3 w-px bg-black/[0.06]" />
        <span className="flex items-center gap-1.5"><UIcon name="Sparkles" size={12} />Free, no sign-up</span>
      </div>
    </div>
  );
}
