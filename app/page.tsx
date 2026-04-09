"use client";

import React from "react";
import Link from "next/link";
import { UIcon } from "./components/Icons";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[80vh] relative z-10 w-full">
         <div className="text-center mb-16 max-w-2xl mx-auto">
             <div className="inline-flex items-center justify-center mb-6 text-ink2">
                <UIcon name="PenTool" size={32} />
             </div>
             <h1 className="font-caveat text-6xl md:text-7xl text-ink2 mb-6">OneDocs Workspace</h1>
             <p className="font-patrick text-xl md:text-2xl text-ink3 leading-relaxed">
               A minimalist toolkit to analyze, convert, and command your documents.
               Choose a utility below to begin.
             </p>
         </div>

         <div className="grid md:grid-cols-2 gap-8 max-w-[800px] w-full">
            
            <Link href="/analyze" className="group rounded-[32px] border border-black/[0.08] bg-white/60 backdrop-blur-md flex flex-col items-center text-center p-12 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:bg-white/90 transition-all duration-300 cursor-pointer">
               <UIcon name="Microscope" size={56} className="text-ink2 mb-8 group-hover:scale-110 transition-transform duration-300" />
               <h2 className="font-caveat text-4xl sm:text-5xl text-[var(--color-vintage-teal)] mb-4">Deep Analyze</h2>
               <p className="font-patrick text-lg text-ink3 mb-6">Read, search, and extract rich document text instantly.</p>
               <span className="font-patrick text-sm text-ink4 uppercase tracking-widest border border-black/10 px-4 py-1.5 rounded-full">Explore Tool</span>
            </Link>

            <Link href="/pdf-tools" className="group rounded-[32px] border border-black/[0.08] bg-white/60 backdrop-blur-md flex flex-col items-center text-center p-12 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:bg-white/90 transition-all duration-300 cursor-pointer">
               <UIcon name="FileText" size={56} className="text-ink2 mb-8 group-hover:scale-110 transition-transform duration-300" />
               <h2 className="font-caveat text-4xl sm:text-5xl text-[var(--color-vintage-red)] mb-4">PDF Suite</h2>
               <p className="font-patrick text-lg text-ink3 mb-6">Convert, merge, split, and rotate PDF files safely.</p>
               <span className="font-patrick text-sm text-ink4 uppercase tracking-widest border border-black/10 px-4 py-1.5 rounded-full">Explore Tool</span>
            </Link>

            <Link href="/docx-tools" className="group rounded-[32px] border border-black/[0.08] bg-white/60 backdrop-blur-md flex flex-col items-center text-center p-12 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:bg-white/90 transition-all duration-300 cursor-pointer">
               <UIcon name="FileSignature" size={56} className="text-ink2 mb-8 group-hover:scale-110 transition-transform duration-300" />
               <h2 className="font-caveat text-4xl sm:text-5xl text-[var(--color-vintage-gold)] mb-4">Word Tools</h2>
               <p className="font-patrick text-lg text-ink3 mb-6">Export DOCX into HTML, raw text, or premium markdown.</p>
               <span className="font-patrick text-sm text-ink4 uppercase tracking-widest border border-black/10 px-4 py-1.5 rounded-full">Explore Tool</span>
            </Link>

            <Link href="/pdf-link" className="group rounded-[32px] border border-black/[0.08] bg-white/60 backdrop-blur-md flex flex-col items-center text-center p-12 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:bg-white/90 transition-all duration-300 cursor-pointer">
               <UIcon name="Link" size={56} className="text-ink2 mb-8 group-hover:scale-110 transition-transform duration-300" />
               <h2 className="font-caveat text-4xl sm:text-5xl text-[var(--color-vintage-gold)] mb-4">PDF to Link</h2>
               <p className="font-patrick text-lg text-ink3 mb-6">Turn a generic PDF into a highly shareable vintage viewer link.</p>
               <span className="font-patrick text-sm text-ink4 uppercase tracking-widest border border-black/10 px-4 py-1.5 rounded-full">Explore Tool</span>
            </Link>

         </div>
    </div>
  );
}
