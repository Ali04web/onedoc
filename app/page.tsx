"use client";

import React from "react";
import Link from "next/link";
import { UIcon } from "./components/Icons";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[80vh] relative z-10 w-full">
         <div className="text-center mb-24 max-w-lg mx-auto">
             <UIcon name="PenTool" size={28} className="text-ink3 mx-auto mb-6 opacity-60" />
             <h1 className="font-display text-6xl text-ink2 mb-4 tracking-tight">OneDocs</h1>
             <p className="font-body text-xl text-ink3 opacity-80">
               Select a utility below to begin.
             </p>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[900px] w-full">
            
            <Link href="/analyze" className="group flex flex-col items-center text-center p-8 hover:-translate-y-2 transition-all duration-300 cursor-pointer text-ink3 hover:text-ink2">
               <div className="h-20 w-20 flex items-center justify-center rounded-2xl border border-black/5 bg-white/40 mb-6 group-hover:border-[var(--color-vintage-teal)] group-hover:bg-white transition-all duration-300">
                  <UIcon name="Microscope" size={32} className="group-hover:text-[var(--color-vintage-teal)] transition-colors duration-300" />
               </div>
               <h2 className="font-display text-3xl mb-2 text-ink2">Analyze</h2>
               <p className="font-body text-[15px] opacity-70">Extract & search</p>
            </Link>

            <Link href="/pdf-tools" className="group flex flex-col items-center text-center p-8 hover:-translate-y-2 transition-all duration-300 cursor-pointer text-ink3 hover:text-ink2">
               <div className="h-20 w-20 flex items-center justify-center rounded-2xl border border-black/5 bg-white/40 mb-6 group-hover:border-[var(--color-vintage-red)] group-hover:bg-white transition-all duration-300">
                  <UIcon name="FileText" size={32} className="group-hover:text-[var(--color-vintage-red)] transition-colors duration-300" />
               </div>
               <h2 className="font-display text-3xl mb-2 text-ink2">PDF Suite</h2>
               <p className="font-body text-[15px] opacity-70">Convert & organize</p>
            </Link>

            <Link href="/docx-tools" className="group flex flex-col items-center text-center p-8 hover:-translate-y-2 transition-all duration-300 cursor-pointer text-ink3 hover:text-ink2">
               <div className="h-20 w-20 flex items-center justify-center rounded-2xl border border-black/5 bg-white/40 mb-6 group-hover:border-[var(--color-vintage-gold)] group-hover:bg-white transition-all duration-300">
                  <UIcon name="FileSignature" size={32} className="group-hover:text-[var(--color-vintage-gold)] transition-colors duration-300" />
               </div>
               <h2 className="font-display text-3xl mb-2 text-ink2">Word Tools</h2>
               <p className="font-body text-[15px] opacity-70">Export formats</p>
            </Link>

            <Link href="/pdf-link" className="group flex flex-col items-center text-center p-8 hover:-translate-y-2 transition-all duration-300 cursor-pointer text-ink3 hover:text-ink2">
               <div className="h-20 w-20 flex items-center justify-center rounded-2xl border border-black/5 bg-white/40 mb-6 group-hover:border-[var(--color-vintage-teal)] group-hover:bg-white transition-all duration-300">
                  <UIcon name="Link" size={32} className="group-hover:text-[var(--color-vintage-teal)] transition-colors duration-300" />
               </div>
               <h2 className="font-display text-3xl mb-2 text-ink2">PDF Link</h2>
               <p className="font-body text-[15px] opacity-70">Shareable viewers</p>
            </Link>

         </div>
    </div>
  );
}
