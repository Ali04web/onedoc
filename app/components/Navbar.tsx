"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Emoji } from "./Icons";

const navItems = [
  { href: "/", icon: "🏠", label: "Home" },
  { href: "/analyze", icon: "🔬", label: "Analyze" },
  { href: "/pdf-tools", icon: "📄", label: "PDF" },
  { href: "/docx-tools", icon: "📝", label: "DOCX" },
  { href: "/pdf-link", icon: "🔗", label: "PDF Link" },
  { href: "/support", icon: "💬", label: "Support" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[100] px-3 py-3">
      <div className="surface-panel mx-auto flex w-full max-w-[1240px] items-center justify-between px-4 py-3 md:px-5">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-red),var(--color-amber))] text-white shadow-[0_16px_28px_rgba(240,141,54,.28)]">
            <Emoji symbol="📄" size={20} />
          </div>
          <div>
            <div className="font-caveat text-[24px] font-semibold leading-none text-ink2">
              OneDocs
            </div>
            <div className="mt-1 text-[12px] text-ink4">Simple document tools</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {navItems.map(({ href, icon, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-semibold no-underline transition-all duration-200 ${
                  active
                    ? "bg-[linear-gradient(135deg,rgba(91,124,255,.14),rgba(23,184,151,.1))] text-ink2 shadow-[inset_0_0_0_1px_rgba(91,124,255,.16)]"
                    : "text-ink3 hover:bg-white/80 hover:text-ink2"
                }`}
              >
                <Emoji symbol={icon} size={15} />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(91,124,255,.14)] bg-white/82 text-ink2 lg:hidden"
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

        {mobileOpen && (
          <div className="absolute inset-x-3 top-[82px] surface-panel animate-slide-down lg:hidden">
            <div className="grid gap-2 p-3">
              {navItems.map(({ href, icon, label }) => {
                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-[18px] px-4 py-3 no-underline transition-all duration-200 ${
                      active
                        ? "bg-[linear-gradient(135deg,rgba(91,124,255,.14),rgba(23,184,151,.1))] text-ink2"
                        : "text-ink3 hover:bg-white/80 hover:text-ink2"
                    }`}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/86">
                      <Emoji symbol={icon} size={15} />
                    </div>
                    <div className="text-[14px] font-semibold">{label}</div>
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
