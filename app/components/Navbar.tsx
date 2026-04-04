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
    <header className="sticky top-0 z-[100] bg-white/70 backdrop-blur-md border-b border-black/5">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group no-underline transition-all active:scale-95">
          <div className="font-caveat text-[28px] font-bold tracking-tight text-ink2 drop-shadow-sm">
            OneDocs
          </div>
          <span className="rounded-md bg-[#4ba391] px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white shadow-sm">
            FREE
          </span>
        </Link>

        {/* Center Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map(({ href, icon, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[14px] font-semibold no-underline transition-all duration-200 ${
                  active
                    ? "bg-[#fdf6e3] text-ink2 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.03)]"
                    : "text-ink3 hover:bg-black/5 hover:text-ink2"
                }`}
              >
                <div className="flex h-5 w-5 items-center justify-center opacity-80">
                  <UIcon name={icon} size={16} />
                </div>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action */}
        <div className="flex items-center gap-4">
          <Link
            href="/pdf-link"
            className="hidden lg:inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white/50 px-4 py-2.5 text-[13px] font-bold text-ink2 no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:translate-y-0 md:flex"
          >
            Upload PDF & get a shareable link
          </Link>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-ink2 lg:hidden"
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
          <div className="absolute inset-x-4 top-[82px] overflow-hidden rounded-2xl bg-white border border-black/5 shadow-2xl animate-fade-in lg:hidden">
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
                        ? "bg-[#fdf6e3] text-ink2"
                        : "text-ink3 hover:bg-black/5 hover:text-ink2"
                    }`}
                  >
                    <UIcon name={icon} size={15} />
                    <div className="text-[14px] font-semibold">{label}</div>
                  </Link>
                );
              })}
              <div className="mt-2 border-t border-black/5 pt-2">
                <Link
                  href="/pdf-link"
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink2 py-3 text-[14px] font-semibold text-white no-underline"
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
