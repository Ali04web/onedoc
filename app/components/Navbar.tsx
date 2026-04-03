"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tip } from "./DocLensUI";
import { Emoji } from "./Icons";

const navItems = [
  { href: "/", icon: "🏠", label: "Home", tip: "Dashboard — overview of all tools" },
  { href: "/analyze", icon: "🔬", label: "Analyse", tip: "Analyze docs — extract text, stats, search" },
  { href: "/pdf-tools", icon: "📄", label: "PDF Tools", tip: "All PDF conversions and manipulations" },
  { href: "/docx-tools", icon: "📝", label: "DOCX Tools", tip: "All DOCX conversions and utilities" },
  { href: "/pdf-link", icon: "🔗", label: "PDF Link", tip: "Upload PDF & get a shareable link" },
  { href: "/support", icon: "💬", label: "Support", tip: "Help, FAQ, and contact us" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-4 md:px-[28px] h-[54px] border-b-2 border-[rgba(60,35,10,.18)] bg-[rgba(237,229,208,.7)] backdrop-blur-[8px] flex-shrink-0 sticky top-0 z-[100]">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-[10px] cursor-pointer no-underline">
        <Tip tip="OneDocs — a free doc toolkit. Everything runs in your browser.">
          <div className="flex items-center gap-[10px] cursor-pointer">
            <div className="font-caveat text-[24px] font-bold text-ink2 -rotate-[0.5deg] tracking-[-0.5px]">
              One<span className="text-amber">Docs</span>
            </div>
            <div className="font-patrick text-[10px] py-[3px] px-[10px] rounded-[2px_8px_3px_7px] bg-teal text-white font-semibold tracking-[0.5px] rotate-[0.8deg] animate-stamp-in">
              FREE
            </div>
          </div>
        </Tip>
      </Link>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-[2px]">
        {navItems.map(({ href, icon, label, tip }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Tip key={href} tip={tip} side="bottom">
              <Link
                href={href}
                className={`px-[14px] lg:px-[18px] h-[54px] text-[15px] font-bold cursor-pointer bg-transparent border-none border-b-[3px] font-caveat tracking-[0.3px] transition-all duration-150 flex items-center gap-[5px] no-underline ${
                  isActive
                    ? "border-amber text-amber2 rotate-0"
                    : "border-transparent text-ink3 rotate-[0.3deg] hover:text-ink2"
                }`}
              >
                <Emoji symbol={icon} size={18} className="mr-1" />
                <span className="hidden lg:inline">{label}</span>
              </Link>
            </Tip>
          );
        })}
      </nav>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden bg-transparent border-2 border-[rgba(100,70,40,.28)] rounded-[3px_10px_4px_9px] p-[8px] cursor-pointer text-ink2"
        aria-label="Toggle navigation"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
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

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <div className="absolute top-[54px] left-0 right-0 bg-paper border-b-2 border-[rgba(60,35,10,.18)] shadow-[0_8px_24px_rgba(30,15,5,.12)] z-[99] md:hidden animate-slide-down">
          {navItems.map(({ href, icon, label, tip }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-[12px] px-[24px] py-[14px] font-caveat text-[18px] font-bold no-underline transition-all duration-150 border-l-[3px] ${
                  isActive
                    ? "border-amber text-amber2 bg-[rgba(192,120,24,.06)]"
                    : "border-transparent text-ink3 hover:text-ink2 hover:bg-[rgba(100,70,40,.04)]"
                }`}
              >
                <Emoji symbol={icon} size={22} className="mr-1" />
                {label}
                <span className="text-[12px] font-patrick font-normal text-ink4 ml-auto">{tip}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
