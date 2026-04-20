"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UIcon } from "./Icons";
import LanguageSelector from "./LanguageSelector";

const navItems = [
  { href: "/", icon: "NavHome", label: "Home" },
  { href: "/analyze", icon: "NavAnalyze", label: "Analyze" },
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

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header
      className={`sticky top-0 z-[100] transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          : "bg-white border-b border-black/[0.04]"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group no-underline transition-all active:scale-95">
          <div className="relative h-9 w-9 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
            <img src="/onedoc-symbol.svg" alt="OneDoc Logo" className="h-full w-full object-contain" />
          </div>
          <div className="font-display text-[19px] font-bold tracking-tight text-[#1a1a2e] transition-colors group-hover:text-[#e5322d]">
            OneDoc
          </div>
        </Link>

        {/* Center Nav - Desktop */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {navItems.map(({ href, icon, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium no-underline transition-all duration-200 ${
                  active
                    ? "text-[#e5322d] bg-[#e5322d]/[0.06]"
                    : "text-[#5f6368] hover:text-[#1a1a2e] hover:bg-black/[0.03]"
                }`}
              >
                <div className="relative flex h-4 w-4 items-center justify-center">
                  <UIcon name={icon} size={14} />
                </div>
                <span className="relative">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector />
          {/* CTA button - Desktop only */}
          <Link
            href="/#tools"
            className="hidden lg:inline-flex items-center gap-2 rounded-lg bg-[#e5322d] px-4 py-2 text-[13px] font-semibold text-white no-underline transition-all duration-200 hover:bg-[#d42b26] hover:shadow-md hover:shadow-[#e5322d]/20 active:scale-[0.97]"
          >
            All Tools
          </Link>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen((open) => !open)}
            className={`relative flex h-10 w-10 items-center justify-center rounded-lg lg:hidden border transition-all duration-200 ${
              mobileOpen
                ? "bg-[#e5322d]/[0.06] border-[#e5322d]/20 text-[#e5322d]"
                : "bg-transparent border-black/[0.06] text-[#5f6368] hover:bg-black/[0.03]"
            }`}
            aria-label="Toggle navigation"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={`transition-transform duration-300 ${mobileOpen ? "rotate-90" : ""}`}
            >
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu — Full screen overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[99] lg:hidden animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          {/* Menu */}
          <div className="fixed inset-x-0 top-[57px] bottom-0 z-[100] bg-white overflow-y-auto lg:hidden animate-fade-in-scale">
            <div className="p-4 sm:p-6 flex flex-col gap-1">
              {navItems.map(({ href, icon, label }, index) => {
                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3.5 rounded-xl px-4 py-3.5 no-underline transition-all duration-200 animate-fade-in ${
                      active
                        ? "bg-[#e5322d]/[0.06] text-[#e5322d]"
                        : "text-[#5f6368] hover:bg-black/[0.03] hover:text-[#1a1a2e]"
                    }`}
                    style={{ animationDelay: `${index * 0.04}s` }}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                      active ? "bg-[#e5322d]/10 text-[#e5322d]" : "bg-[#f7f8fc] text-[#9aa0a6]"
                    }`}>
                      <UIcon name={icon} size={18} />
                    </div>
                    <div className="text-[15px] font-semibold">{label}</div>
                    {active && (
                      <div className="ml-auto h-2 w-2 rounded-full bg-[#e5322d]" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile CTA */}
            <div className="px-4 sm:px-6 pt-4 pb-6">
              <Link
                href="/#tools"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#e5322d] px-6 py-3.5 text-[15px] font-bold text-white no-underline transition-all hover:bg-[#d42b26] active:scale-[0.97] w-full"
              >
                All Tools — Free
              </Link>
            </div>

            {/* Mobile footer */}
            <div className="border-t border-black/[0.06] px-6 py-4 text-[12px] text-[#9aa0a6] font-medium text-center">
              All tools free · No sign-up required
            </div>
          </div>
        </>
      )}
    </header>
  );
}
