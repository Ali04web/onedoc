"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tip } from "./DocLensUI";
import { Emoji } from "./Icons";

const navItems = [
  { href: "/", icon: "🏠", label: "Home", tip: "Dashboard overview" },
  { href: "/analyze", icon: "🔬", label: "Analyze", tip: "Extract text & search" },
  { href: "/pdf-tools", icon: "📄", label: "PDF Tools", tip: "PDF utilities" },
  { href: "/docx-tools", icon: "📝", label: "DOCX Tools", tip: "DOCX utilities" },
  { href: "/pdf-link", icon: "🔗", label: "PDF Link", tip: "Shareable PDF links" },
  { href: "/support", icon: "💬", label: "Support", tip: "Help & FAQ" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-6 h-16 border-b border-paper3 bg-paper/80 backdrop-blur-md sticky top-0 z-[100]">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 no-underline group">
        <Tip tip="OneDocs — Free document toolkit">
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold text-ink tracking-tight transition-colors group-hover:text-amber">
              One<span className="text-amber">Docs</span>
            </div>
            <div className="text-[10px] py-1 px-2 rounded bg-teal/10 text-teal font-semibold tracking-wider uppercase">
              Free
            </div>
          </div>
        </Tip>
      </Link>

      {/* Desktop Nav */}
      <nav className="hidden lg:flex items-center gap-1">
        {navItems.map(({ href, icon, label, tip }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Tip key={href} tip={tip} side="bottom">
              <Link
                href={href}
                className={`py-2 px-4 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 no-underline ${
                  isActive
                    ? "bg-amber/10 text-amber"
                    : "text-ink3 hover:bg-paper3 hover:text-ink2"
                }`}
              >
                <Emoji symbol={icon} size={16} />
                <span>{label}</span>
              </Link>
            </Tip>
          );
        })}
      </nav>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden p-2 rounded-lg border border-paper3 text-ink2 hover:bg-paper3 transition-colors"
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

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <div className="absolute top-16 left-0 right-0 bg-paper border-b border-paper3 shadow-lg z-[99] lg:hidden animate-slide-down">
          {navItems.map(({ href, icon, label, tip }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-6 py-4 text-base font-medium no-underline transition-colors ${
                  isActive
                    ? "bg-amber/5 text-amber border-l-4 border-amber"
                    : "text-ink3 border-l-4 border-transparent hover:bg-paper3"
                }`}
              >
                <Emoji symbol={icon} size={20} />
                {label}
                <span className="text-xs font-normal text-ink4 ml-auto">{tip}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
