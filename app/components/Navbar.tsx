"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tip } from "./DocLensUI";
import { Emoji } from "./Icons";

const navItems = [
  { href: "/", icon: "🏠", label: "Home", tip: "Overview and product entry points" },
  { href: "/analyze", icon: "🔬", label: "Analyse", tip: "Inspect text, search, and exports" },
  { href: "/pdf-tools", icon: "📄", label: "PDF Tools", tip: "Conversions and PDF operations" },
  { href: "/docx-tools", icon: "📝", label: "DOCX Tools", tip: "Word, text, and table exports" },
  { href: "/pdf-link", icon: "🔗", label: "PDF Link", tip: "Shareable PDF hosting" },
  { href: "/support", icon: "💬", label: "Support", tip: "FAQs, help, and contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[100] px-4 py-4">
      <div className="surface-panel mx-auto flex w-full max-w-[1280px] items-center justify-between px-5 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-4 no-underline">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(42,34,24,.12)] bg-white/78 text-amber shadow-[0_18px_38px_rgba(33,25,16,.08)]">
            <Emoji symbol="📄" size={22} />
          </div>
          <div>
            <div className="font-caveat text-[30px] font-semibold leading-none tracking-[-0.04em] text-ink2">
              OneDocs
            </div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-ink4">
              Crafted document tools
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 xl:flex">
          {navItems.map(({ href, icon, label, tip }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Tip key={href} tip={tip} side="bottom">
                <Link
                  href={href}
                  className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-[14px] font-semibold no-underline transition-all duration-200 ${
                    isActive
                      ? "bg-[rgba(186,138,66,.12)] text-amber2 shadow-[inset_0_0_0_1px_rgba(186,138,66,.18)]"
                      : "text-ink3 hover:bg-white/70 hover:text-ink2"
                  }`}
                >
                  <Emoji symbol={icon} size={16} />
                  {label}
                </Link>
              </Tip>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex xl:hidden">
          <div className="premium-chip">
            <Emoji symbol="✨" size={14} />
            Premium UI refresh
          </div>
        </div>

        <button
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(42,34,24,.12)] bg-white/70 text-ink2 xl:hidden"
          aria-label="Toggle navigation"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>

        {mobileOpen && (
          <div className="absolute inset-x-4 top-[96px] surface-panel animate-slide-down xl:hidden">
            <div className="grid gap-2 p-3">
              {navItems.map(({ href, icon, label, tip }) => {
                const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-[20px] px-4 py-3 no-underline transition-all duration-200 ${
                      isActive
                        ? "bg-[rgba(186,138,66,.12)] text-amber2"
                        : "text-ink3 hover:bg-white/70 hover:text-ink2"
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(42,34,24,.08)] bg-white/75">
                      <Emoji symbol={icon} size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-semibold">{label}</div>
                      <div className="mt-1 text-[12px] text-ink4">{tip}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
