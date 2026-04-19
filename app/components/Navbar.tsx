"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UIcon } from "./Icons";

const navItems = [
  { href: "/", icon: "NavHome", label: "Home" },
  { href: "/analyze", icon: "NavAnalyze", label: "Analyze" },
  { href: "/pdf-tools", icon: "NavPdfTools", label: "PDF Tools" },
  { href: "/docx-tools", icon: "NavDocxTools", label: "DOCX Tools" },
  { href: "/pdf-link", icon: "NavPdfLink", label: "PDF Link" },
  { href: "/support", icon: "NavSupport", label: "Support" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-[100] transition-all duration-500 ${
        scrolled
          ? "bg-[rgba(6,6,11,0.85)] backdrop-blur-2xl border-b border-white/[0.06] shadow-lg shadow-black/20"
          : "bg-[rgba(6,6,11,0.5)] backdrop-blur-xl border-b border-white/[0.03]"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group no-underline transition-all active:scale-95">
          <div className="relative h-10 w-10 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
            <img src="/onedoc-symbol.svg" alt="OneDoc Logo" className="h-full w-full object-contain" />
          </div>
          <div className="font-display text-[20px] font-bold tracking-tight text-white transition-colors group-hover:text-white/90">
            OneDoc
          </div>
          <span className="rounded-lg bg-[#10b981]/12 px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#10b981] border border-[#10b981]/15 transition-all duration-300 group-hover:bg-[#10b981]/18">
            FREE
          </span>
        </Link>

        {/* Center Nav */}
        <nav className="hidden items-center gap-1 rounded-2xl bg-white/[0.03] border border-white/[0.04] p-1.5 lg:flex">
          {navItems.map(({ href, icon, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium no-underline transition-all duration-300 ${
                  active
                    ? "bg-white/[0.1] text-white shadow-sm"
                    : "text-[#9294a5] hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {active && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#10b981]/10 to-[#f59e0b]/5 border border-white/[0.08]" />
                )}
                <div className="relative flex h-4 w-4 items-center justify-center">
                  <UIcon name={icon} size={14} />
                </div>
                <span className="relative">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen((open) => !open)}
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl text-white lg:hidden border transition-all duration-300 ${
              mobileOpen
                ? "bg-white/[0.1] border-white/[0.1]"
                : "bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.08]"
            }`}
            aria-label="Toggle navigation"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={`transition-transform duration-300 ${mobileOpen ? "rotate-180" : ""}`}
            >
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
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="absolute inset-x-4 top-[68px] overflow-hidden rounded-2xl bg-[#0e0e18]/97 backdrop-blur-2xl border border-white/[0.08] shadow-2xl lg:hidden animate-fade-in-scale">
            <div className="grid gap-1 p-3">
              {navItems.map(({ href, icon, label }, index) => {
                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3.5 no-underline transition-all duration-300 animate-fade-in ${
                      active
                        ? "bg-white/[0.07] text-white border border-white/[0.06]"
                        : "text-[#9294a5] hover:bg-white/[0.04] hover:text-white border border-transparent"
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                      active ? "bg-[#10b981]/15 text-[#10b981]" : "bg-white/[0.04]"
                    }`}>
                      <UIcon name={icon} size={16} />
                    </div>
                    <div className="text-[14px] font-semibold">{label}</div>
                    {active && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile footer */}
            <div className="border-t border-white/[0.04] px-5 py-3 text-[11px] text-[#6b6d80] font-medium text-center">
              All tools free · No sign-up required
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
