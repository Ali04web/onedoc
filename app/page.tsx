"use client";

import React from "react";
import Link from "next/link";
import { DocumentHeroArt } from "./components/DocumentHeroArt";
import { UIcon } from "./components/Icons";

export default function HomePage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="page-shell max-w-[1300px]">
        
        {/* Architectural Hero */}
        <section className="relative overflow-hidden vintage-card mb-10 p-8 sm:p-12 md:p-16 border-black/5 shadow-2xl bg-white">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 100%, var(--color-vintage-teal) 0%, transparent 60%), radial-gradient(circle at 0% 0%, var(--color-vintage-gold) 0%, transparent 50%)' }}></div>
          
          <div className="relative z-10 grid lg:grid-cols-[1fr_auto] gap-12 items-center">
            <div className="max-w-[640px]">
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-black/10 bg-paper2/50 backdrop-blur-md mb-8">
                <UIcon name="Sparkles" size={16} className="text-ink2" />
                <span className="text-[12px] font-bold tracking-widest uppercase text-ink2">Premium Document Suite</span>
              </div>
              <h1 className="font-caveat text-[5th] text-5xl sm:text-7xl lg:text-[88px] leading-[0.9] text-ink2 font-semibold tracking-[-0.02em] mb-8 drop-shadow-sm">
                Refined.<br />Powerful.<br />Yours.
              </h1>
              <p className="text-[18px] md:text-[20px] text-ink3 max-w-[500px] leading-[1.6] font-medium">
                OneDocs merges the tactile elegance of an analog workspace with flawless browser-based extraction. Analyze, convert, and command your files with total privacy.
              </p>
              
              <div className="mt-10 flex flex-wrap items-center gap-5">
                <Link href="/analyze" className="vintage-button vintage-button-primary shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.16)] hover:-translate-y-1 text-[16px] px-8 py-4">
                  <UIcon name="Microscope" size={20} />
                  Start Analyzing
                </Link>
                <Link href="/pdf-tools" className="vintage-button shadow-sm hover:shadow-md hover:-translate-y-1 text-[16px] px-8 py-4 bg-white/60 backdrop-blur-sm">
                  <UIcon name="FileText" size={20} />
                  Explore Toolkit
                </Link>
              </div>
            </div>
            
            <div className="hidden lg:flex justify-end pr-4">
               <div className="relative w-[440px] h-[440px] rounded-[48px] border border-black/5 bg-[#fdf6e3]/50 flex items-center justify-center p-8 shadow-inner overflow-visible">
                  <div className="absolute inset-x-8 -bottom-8 h-16 bg-black/5 blur-xl rounded-[100%] pointer-events-none"></div>
                  <DocumentHeroArt mode="home" className="w-[110%] h-[110%] object-contain relative z-10 transition-transform duration-[1200ms] ease-out hover:scale-[1.03] hover:rotate-1 origin-bottom" />
               </div>
            </div>
          </div>
        </section>

        {/* Dynamic Bento Box Layout */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Analyze - 2 span width */}
          <Link href="/analyze" className="group block md:col-span-2 vintage-card p-8 md:p-10 border-black/5 hover:border-ink2/30 transition-all duration-400 hover:shadow-[0_24px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 no-underline relative overflow-hidden bg-white">
             <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-all duration-700 ease-out group-hover:scale-110 group-hover:rotate-6 pointer-events-none">
                <UIcon name="Microscope" size={280} />
             </div>
             <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                   <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-paper2 border border-black/5 text-ink2 shadow-sm mb-6 group-hover:scale-110 transition-transform duration-500 ease-out">
                     <UIcon name="Microscope" size={28} />
                   </div>
                   <h2 className="font-caveat text-4xl sm:text-5xl text-ink2 mb-4 leading-none">Deep Analysis</h2>
                   <p className="text-[16px] text-ink3 max-w-[340px] leading-relaxed">
                     Surgically extract text from your PDFs and Word files locally. Unlock reading times, term mapping, and generate flawless plaintext or markdown.
                   </p>
                </div>
                <div className="mt-12 flex items-center justify-between">
                   <div className="flex gap-2">
                     <span className="vintage-badge bg-black/5 border-none">Extraction</span>
                     <span className="vintage-badge bg-black/5 border-none">Metrics</span>
                   </div>
                   <div className="h-12 w-12 flex items-center justify-center rounded-full bg-black/5 text-ink2 group-hover:bg-ink2 group-hover:text-white transition-colors duration-300">
                     <UIcon name="ArrowRight" size={20} />
                   </div>
                </div>
             </div>
          </Link>

          {/* PDF Tools - 1 span */}
          <Link href="/pdf-tools" className="group block md:col-span-1 vintage-card p-8 border-black/5 hover:border-ink2/30 transition-all duration-400 hover:shadow-[0_16px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 no-underline flex flex-col justify-between bg-white overflow-hidden relative">
            <div className="relative z-10">
               <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-paper2 border border-black/5 text-ink2 shadow-sm mb-6 group-hover:-translate-y-1 transition-transform duration-500 ease-out">
                 <UIcon name="FileText" size={24} />
               </div>
               <h2 className="font-caveat text-3xl sm:text-4xl text-ink2 mb-3 leading-none">PDF Suite</h2>
               <p className="text-[15px] text-ink4 leading-relaxed">
                 Convert to DOCX, merge, split, rotate, or export to crisp ZIP images effortlessly.
               </p>
            </div>
            <div className="mt-10 flex items-center justify-between relative z-10">
               <span className="vintage-badge bg-white">5 Tools</span>
               <div className="h-10 w-10 flex items-center justify-center rounded-full bg-black/5 text-ink2 group-hover:bg-ink2 group-hover:text-white transition-colors">
                 <UIcon name="ArrowRight" size={16} />
               </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-transparent to-[var(--color-vintage-teal)] opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
          </Link>

          {/* DOCX Tools - 1 span */}
          <Link href="/docx-tools" className="group block md:col-span-1 vintage-card p-8 border-black/5 hover:border-ink2/30 transition-all duration-400 hover:shadow-[0_16px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 no-underline flex flex-col justify-between bg-white overflow-hidden relative">
            <div className="relative z-10">
               <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-paper2 border border-black/5 text-ink2 shadow-sm mb-6 group-hover:-translate-y-1 transition-transform duration-500 ease-out">
                 <UIcon name="FileSignature" size={24} />
               </div>
               <h2 className="font-caveat text-3xl sm:text-4xl text-ink2 mb-3 leading-none">Word Tools</h2>
               <p className="text-[15px] text-ink4 leading-relaxed">
                 Export rich DOCX into premium Markdown, clean standalone HTML, or simple text.
               </p>
            </div>
            <div className="mt-10 flex items-center justify-between relative z-10">
               <span className="vintage-badge bg-white">Conversions</span>
               <div className="h-10 w-10 flex items-center justify-center rounded-full bg-black/5 text-ink2 group-hover:bg-ink2 group-hover:text-white transition-colors">
                 <UIcon name="ArrowRight" size={16} />
               </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-transparent to-[var(--color-vintage-gold)] opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
          </Link>
          
          {/* Support Bar - 3 span */}
          <Link href="/support" className="group block md:col-span-1 lg:col-span-3 vintage-card p-6 md:p-8 border-black/5 hover:border-ink2/30 transition-all duration-400 hover:shadow-[0_16px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 no-underline flex flex-col sm:flex-row items-start sm:items-center justify-between bg-paper2/50 backdrop-blur-sm">
             <div className="flex items-center gap-5 md:gap-6 mb-6 sm:mb-0">
                <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-full bg-white text-ink2 shadow-sm group-hover:rotate-12 transition-transform duration-500 ease-out">
                  <UIcon name="HeartHandshake" size={28} />
                </div>
                <div>
                   <h2 className="font-caveat text-[28px] sm:text-4xl text-ink2 mb-1 leading-none">Need assistance?</h2>
                   <p className="text-[15px] text-ink4 mt-2">Report bugs, request features, or check format specifications.</p>
                </div>
             </div>
             <div className="h-12 w-full sm:w-auto px-8 flex items-center justify-center rounded-full bg-white border border-black/10 text-ink2 font-bold text-[14px] shadow-sm group-hover:bg-ink2 group-hover:text-white transition-colors duration-300">
               Visit Help Desk
             </div>
          </Link>

          {/* PDF Link - 1 span */}
          <Link href="/pdf-link" className="group block md:col-span-1 lg:col-span-1 vintage-card p-6 md:p-8 border-black/5 hover:border-ink2/30 transition-all duration-400 hover:shadow-[0_16px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 no-underline flex flex-col justify-center items-center text-center bg-white relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white border border-black/10 text-ink2 shadow-[0_4px_12px_rgba(0,0,0,0.04)] mb-5 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 ease-out">
                 <UIcon name="Link" size={22} />
               </div>
               <h2 className="relative z-10 font-caveat text-[28px] sm:text-[32px] text-ink2 mb-2 leading-none">PDF Links</h2>
               <p className="relative z-10 text-[14px] text-ink4">Generate public viewers.</p>
          </Link>

        </section>
      </div>
    </div>
  );
}
