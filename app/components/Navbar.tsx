"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UIcon } from "./Icons";

const navItems = [
  { href: "/", icon: "Home", label: "Home" },
  { href: "/analyze", icon: "Microscope", label: "Analyze" },
  { href: "/pdf-tools", icon: "FileText", label: "PDF Tools" },
  { href: "/docx-tools", icon: "FileSignature", label: "DOCX Tools" },
  { href: "/pdf-link", icon: "Link", label: "PDF Link" },
  { href: "/support", icon: "MessageCircleHeart", label: "Support" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[100] bg-[rgba(10,10,15,0.7)] backdrop-blur-2xl border-b border-white/[0.04]">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-3.5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group no-underline transition-all active:scale-95">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#7c6aff] to-[#00d4aa] flex items-center justify-center shadow-lg shadow-[#7c6aff]/20">
            <UIcon name="FileText" size={18} className="text-white" />
          </div>
          <div className="font-display text-[20px] font-bold tracking-tight text-white">
            OneDocs
          </div>
          <span className="rounded-md bg-[#00d4aa]/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#00d4aa] border border-[#00d4aa]/20">
            FREE
          </span>
        </Link>

        {/* Center Nav */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {navItems.map(({ href, icon, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-medium no-underline transition-all duration-200 ${
                  active
                    ? "bg-white/[0.08] text-white"
                    : "text-[#9294a5] hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <div className="flex h-4 w-4 items-center justify-center">
                  <UIcon name={icon} size={14} />
                </div>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/pdf-link"
            className="hidden lg:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#5b4bcf] px-4 py-2.5 text-[12px] font-bold text-white no-underline shadow-lg shadow-[#7c6aff]/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#7c6aff]/30 active:translate-y-0"
          >
            <UIcon name="Link" size={13} />
            Get Shareable Link
          </Link>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-white lg:hidden border border-white/[0.06]"
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
          <div className="absolute inset-x-4 top-[72px] overflow-hidden rounded-2xl bg-[#12121a]/95 backdrop-blur-2xl border border-white/[0.06] shadow-2xl animate-fade-in lg:hidden">
            <div className="grid gap-1 p-3">
              {navItems.map(({ href, icon, label }) => {
                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 no-underline transition-all duration-200 ${
                      active
                        ? "bg-white/[0.06] text-white"
                        : "text-[#9294a5] hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <UIcon name={icon} size={15} />
                    <div className="text-[14px] font-medium">{label}</div>
                  </Link>
                );
              })}
              <div className="mt-2 border-t border-white/[0.06] pt-2">
                <Link
                  href="/pdf-link"
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#5b4bcf] py-3 text-[14px] font-semibold text-white no-underline"
                >
                  <UIcon name="Link" size={14} />
                  Get Shareable Link
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
