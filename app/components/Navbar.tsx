"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandSymbol } from "./BrandSymbol";
import { Tip } from "./DocLensUI";
import { UIcon } from "./Icons";

const navItems = [
  { href: "/", icon: "Home", label: "Home", tip: "Go back to the main dashboard." },
  { href: "/analyze", icon: "Microscope", label: "Analyze", tip: "Open document reading, search, and export." },
  { href: "/pdf-tools", icon: "FileText", label: "PDF", tip: "Open PDF conversion and organization tools." },
  { href: "/docx-tools", icon: "FileSignature", label: "DOCX", tip: "Open Word document conversion tools." },
  { href: "/pdf-link", icon: "Link", label: "PDF Link", tip: "Generate a shareable hosted PDF viewer link." },
  { href: "/support", icon: "MessageCircleHeart", label: "Support", tip: "View help, FAQs, and support contact options." },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[100] px-3 py-3">
      <div className="surface-panel mx-auto flex w-full max-w-[1240px] items-center justify-between gap-3 px-4 py-3 md:px-5">
        <Tip tip="OneDocs home workspace" side="bottom">
          <Link href="/" className="flex min-w-0 items-center gap-3 no-underline">
            <div className="rounded-[18px] bg-[linear-gradient(135deg,rgba(255,255,255,.94),rgba(243,248,255,.88))] p-1.5 shadow-[0_18px_30px_rgba(93,104,214,.16)]">
              <BrandSymbol size={38} />
            </div>
            <div className="min-w-0">
              <div className="truncate font-caveat text-[22px] font-semibold leading-none text-ink2 md:text-[24px]">
                OneDocs
              </div>
              <div className="mt-1 hidden text-[12px] text-ink4 sm:block">
                Bright document workspace
              </div>
            </div>
          </Link>
        </Tip>

        <nav className="hidden items-center gap-2 lg:flex">
          {navItems.map(({ href, icon, label, tip }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Tip key={href} tip={tip} side="bottom">
                <Link
                  href={href}
                  title={tip}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-semibold no-underline transition-all duration-200 ${
                    active
                      ? "bg-[linear-gradient(135deg,rgba(110,124,255,.14),rgba(16,199,162,.12),rgba(255,145,71,.08))] text-ink2 shadow-[inset_0_0_0_1px_rgba(110,124,255,.16),0_12px_24px_rgba(54,74,146,.08)]"
                      : "text-ink3 hover:bg-white/80 hover:text-ink2"
                  }`}
                >
                  <UIcon name={icon} size={15} />
                  {label}
                </Link>
              </Tip>
            );
          })}
        </nav>

        <Tip tip={mobileOpen ? "Close navigation menu" : "Open navigation menu"} side="bottom">
          <button
            onClick={() => setMobileOpen((open) => !open)}
            title={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
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
        </Tip>

        {mobileOpen && (
          <div className="absolute inset-x-3 top-[82px] surface-panel animate-slide-down lg:hidden">
            <div className="grid gap-2 p-3">
              {navItems.map(({ href, icon, label, tip }) => {
                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Tip key={href} tip={tip} side="left">
                    <Link
                      href={href}
                      title={tip}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-[18px] px-4 py-3 no-underline transition-all duration-200 ${
                        active
                          ? "bg-[linear-gradient(135deg,rgba(110,124,255,.14),rgba(16,199,162,.12),rgba(255,145,71,.08))] text-ink2"
                          : "text-ink3 hover:bg-white/80 hover:text-ink2"
                      }`}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/86">
                        <UIcon name={icon} size={15} />
                      </div>
                      <div className="text-[14px] font-semibold">{label}</div>
                    </Link>
                  </Tip>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
