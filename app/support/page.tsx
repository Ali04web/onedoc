"use client";

import React, { useState } from "react";
import { Tip, SCard, Toast } from "@/app/components/DocLensUI";
import { Emoji } from "@/app/components/Icons";

const faqs = [
  { q: "Is DocLens really free?", a: "Yes, 100% free — no hidden charges, no premium tiers, no ads. DocLens is an open-source tool built for the community." },
  { q: "Are my files uploaded to a server?", a: "Never. Every single operation happens entirely in your browser using JavaScript. Your files never leave your device. We don't have a backend server for file processing." },
  { q: "What file types are supported?", a: "DocLens supports PDF, DOCX, TXT, MD, CSV, JPG, and PNG files. You can analyze PDF and DOCX content, and convert between many of these formats." },
  { q: "Is there a file size limit?", a: "There's no hard limit, but very large files (100MB+) may be slow depending on your device's memory and processing power. We recommend keeping files under 50MB for the best experience." },
  { q: "Can I merge multiple PDFs?", a: "Yes! Head to the PDF Tools page and use the 'Merge PDFs' tool. You can select multiple PDF files and combine them into a single document." },
  { q: "How does text extraction work?", a: "For PDFs, we use pdf.js to parse the document structure and extract text layer content. For DOCX files, we use mammoth.js to parse the Word XML format. Both are industry-standard open-source libraries." },
  { q: "Can I use DocLens offline?", a: "Currently DocLens requires an internet connection to load the processing libraries (pdf.js, mammoth.js, pdf-lib). Once loaded, all processing happens locally. We're exploring a fully offline PWA version for the future." },
  { q: "Does DocLens work on mobile?", a: "Yes! DocLens is fully responsive and works on phones and tablets. The sidebar collapses into a slide-out drawer on smaller screens." },
];

const tips = [
  { icon: "⚡", title: "Drag & Drop", desc: "You can drag files directly onto the upload areas — no need to browse every time." },
  { icon: "🔍", title: "Smart Search", desc: "The search tool highlights all matches and lets you navigate between them with arrow buttons." },
  { icon: "📊", title: "Word Frequency", desc: "The stats view filters out common words (the, a, is…) to show you only meaningful word frequencies." },
  { icon: "📋", title: "Quick Copy", desc: "Use the 'Copy all' quick tool in the sidebar to instantly copy extracted text to your clipboard." },
  { icon: "🖼️", title: "High-DPI Export", desc: "When converting PDF to images, increase the DPI setting (up to 300) for sharper, print-quality results." },
  { icon: "✂️", title: "Page Ranges", desc: "When splitting PDFs, use formats like '1-3, 5, 7-10' to extract exactly the pages you need." },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", type: "question", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setToast("Please fill in all fields");
      return;
    }
    // In a real app, this would send to an API
    setToast("✓ Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", type: "question", message: "" });
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero */}
      <section className="text-center py-10 md:py-16 px-6">
        <div className="inline-block animate-wobble-in -rotate-[5deg] mb-3"><Emoji symbol="💬" size={56} className="text-amber" /></div>
        <h1 className="font-caveat text-[32px] md:text-[42px] font-bold text-ink2 -rotate-[0.5deg] mb-2">
          Help & Support
        </h1>
        <p className="font-patrick text-[15px] md:text-[16px] text-ink4 max-w-[440px] mx-auto leading-[1.7] mb-6">
          Find answers, learn tips, or reach out to us. We&apos;re here to help you get the most out of DocLens.
        </p>
        <div className="flex justify-center">
          <Tip tip="Follow us on X (Twitter)" side="bottom">
            <a
              href="https://x.com/alivldm"
              target="_blank"
              rel="noopener noreferrer"
              className="py-[10px] px-[20px] bg-paper2 hover:bg-paper3 text-ink2 font-caveat text-[16px] font-bold rounded-[4px_12px_3px_10px] border-2 border-[rgba(100,70,40,.25)] shadow-[2px_2px_0_rgba(30,15,5,.08)] hover:shadow-[3px_3px_0_rgba(30,15,5,.12)] hover:-translate-y-[1px] transition-all duration-150 no-underline cursor-pointer flex items-center gap-[8px]"
            >
              <Emoji symbol="𝕏" size={16} /> Connect on X
            </a>
          </Tip>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-16 pb-16 space-y-12">
        {/* Quick Tips */}
        <section>
          <div className="flex items-center gap-[14px] mb-6">
            <div className="-rotate-[4deg] inline-block"><Emoji symbol="💡" size={26} /></div>
            <div className="font-caveat text-[24px] font-bold text-ink2 leading-none relative inline-block">
              Quick Tips
              <svg className="absolute -bottom-1 left-0 w-full h-[6px] overflow-visible" viewBox="0 0 100 6" preserveAspectRatio="none">
                <path d="M2,4 Q25,1 50,3.5 Q75,6 98,2" stroke="var(--color-amber)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1 border-t-[1.5px] border-dashed border-[rgba(100,70,40,.22)] mt-[2px]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tips.map((tip, i) => (
              <Tip key={tip.title} tip={tip.desc} side="top">
                <SCard rotate={i % 2 === 0 ? 0.2 : -0.2}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0"><Emoji symbol={tip.icon} size={28} /></div>
                    <div>
                      <div className="font-caveat text-[18px] font-bold text-ink2 mb-1">{tip.title}</div>
                      <div className="font-patrick text-[13px] text-ink4 leading-[1.5]">{tip.desc}</div>
                    </div>
                  </div>
                </SCard>
              </Tip>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="flex items-center gap-[14px] mb-6">
            <div className="-rotate-[4deg] inline-block"><Emoji symbol="❓" size={26} /></div>
            <div className="font-caveat text-[24px] font-bold text-ink2 leading-none relative inline-block">
              Frequently Asked Questions
              <svg className="absolute -bottom-1 left-0 w-full h-[6px] overflow-visible" viewBox="0 0 100 6" preserveAspectRatio="none">
                <path d="M2,4 Q25,1 50,3.5 Q75,6 98,2" stroke="var(--color-teal)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1 border-t-[1.5px] border-dashed border-[rgba(100,70,40,.22)] mt-[2px]" />
          </div>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border-2 border-[rgba(60,35,10,.22)] rounded-[4px_14px_5px_13px] overflow-hidden bg-paper transition-all duration-200">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center gap-3 py-[14px] px-[18px] bg-transparent border-none cursor-pointer text-left"
                >
                  <span className={`text-[14px] text-amber2 font-bold transition-transform duration-200 ${openFaq === i ? "rotate-90" : ""}`}>▶</span>
                  <span className="font-caveat text-[18px] font-bold text-ink2 flex-1">{faq.q}</span>
                  <span className="font-patrick text-[12px] text-ink4">{openFaq === i ? "collapse" : "expand"}</span>
                </button>
                {openFaq === i && (
                  <div className="px-[18px] pb-[16px] pt-0 border-t border-dashed border-[rgba(100,70,40,.15)] animate-fade-up">
                    <div className="font-patrick text-[14px] text-ink3 leading-[1.7] pt-3">{faq.a}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section>
          <div className="flex items-center gap-[14px] mb-6">
            <div className="-rotate-[4deg] inline-block"><Emoji symbol="✉️" size={26} /></div>
            <div className="font-caveat text-[24px] font-bold text-ink2 leading-none relative inline-block">
              Contact Us
              <svg className="absolute -bottom-1 left-0 w-full h-[6px] overflow-visible" viewBox="0 0 100 6" preserveAspectRatio="none">
                <path d="M2,4 Q25,1 50,3.5 Q75,6 98,2" stroke="var(--color-amber)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1 border-t-[1.5px] border-dashed border-[rgba(100,70,40,.22)] mt-[2px]" />
          </div>
          <SCard rotate={0.15}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-caveat text-[15px] font-semibold text-ink2 mb-1 block">Your Name</label>
                  <Tip tip="How should we address you?" side="top">
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Jane Doe"
                      className="w-full bg-paper2 border-[1.5px] border-[rgba(100,70,40,.38)] rounded-[2px_8px_3px_7px] py-[10px] px-[14px] text-ink font-patrick text-[14px] outline-none"
                    />
                  </Tip>
                </div>
                <div>
                  <label className="font-caveat text-[15px] font-semibold text-ink2 mb-1 block">Email</label>
                  <Tip tip="We'll reply to this address" side="top">
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="jane@example.com"
                      className="w-full bg-paper2 border-[1.5px] border-[rgba(100,70,40,.38)] rounded-[2px_8px_3px_7px] py-[10px] px-[14px] text-ink font-patrick text-[14px] outline-none"
                    />
                  </Tip>
                </div>
              </div>
              <div>
                <label className="font-caveat text-[15px] font-semibold text-ink2 mb-1 block">Type</label>
                <Tip tip="Let us know what this is about" side="right">
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full bg-paper2 border-[1.5px] border-[rgba(100,70,40,.38)] rounded-[2px_8px_3px_7px] py-[10px] px-[14px] text-ink font-patrick text-[14px] outline-none cursor-pointer"
                  >
                    <option value="question">❓ Question</option>
                    <option value="bug">🐛 Bug Report</option>
                    <option value="feature">💡 Feature Request</option>
                    <option value="feedback">💬 General Feedback</option>
                  </select>
                </Tip>
              </div>
              <div>
                <label className="font-caveat text-[15px] font-semibold text-ink2 mb-1 block">Message</label>
                <Tip tip="Describe your issue or idea in detail" side="top">
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Tell us what's on your mind…"
                    rows={5}
                    className="w-full bg-paper2 border-[1.5px] border-[rgba(100,70,40,.38)] rounded-[2px_8px_3px_7px] py-[10px] px-[14px] text-ink font-patrick text-[14px] outline-none resize-y"
                  />
                </Tip>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Tip tip="Submit your message — we typically reply within 24 hours" side="top">
                  <button
                    type="submit"
                    className="py-[12px] px-[24px] bg-amber hover:bg-amber2 text-white font-caveat text-[18px] font-bold rounded-[3px_12px_5px_10px] border-2 border-amber2 shadow-[2px_3px_0_rgba(30,15,5,.15)] hover:shadow-[3px_4px_0_rgba(30,15,5,.2)] hover:-translate-y-[1px] transition-all duration-150 cursor-pointer w-full sm:w-auto flex items-center justify-center gap-[8px]"
                  >
                    <Emoji symbol="✉️" size={18} /> Send Message
                  </button>
                </Tip>
                <Tip tip="Contact us on X (Twitter)" side="top">
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-[12px] px-[24px] bg-paper2 hover:bg-paper3 text-ink2 font-caveat text-[18px] font-bold rounded-[4px_10px_3px_12px] border-2 border-[rgba(100,70,40,.28)] shadow-[2px_3px_0_rgba(30,15,5,.1)] hover:shadow-[3px_4px_0_rgba(30,15,5,.15)] hover:-translate-y-[1px] transition-all duration-150 no-underline cursor-pointer w-full sm:w-auto flex items-center justify-center gap-[8px]"
                  >
                    <Emoji symbol="𝕏" size={18} /> Connect on X
                  </a>
                </Tip>
              </div>
            </form>
          </SCard>
        </section>

        {/* Keyboard shortcuts */}
        <section>
          <div className="flex items-center gap-[14px] mb-6">
            <div className="-rotate-[4deg] inline-block"><Emoji symbol="⌨️" size={26} /></div>
            <div className="font-caveat text-[24px] font-bold text-ink2 leading-none relative inline-block">
              Supported Formats
              <svg className="absolute -bottom-1 left-0 w-full h-[6px] overflow-visible" viewBox="0 0 100 6" preserveAspectRatio="none">
                <path d="M2,4 Q25,1 50,3.5 Q75,6 98,2" stroke="var(--color-teal)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1 border-t-[1.5px] border-dashed border-[rgba(100,70,40,.22)] mt-[2px]" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="font-caveat text-[16px] font-bold text-ink2 text-left py-3 px-4 border-b-2 border-[rgba(60,35,10,.2)]">Format</th>
                  <th className="font-caveat text-[16px] font-bold text-ink2 text-left py-3 px-4 border-b-2 border-[rgba(60,35,10,.2)]">Input</th>
                  <th className="font-caveat text-[16px] font-bold text-ink2 text-left py-3 px-4 border-b-2 border-[rgba(60,35,10,.2)]">Output</th>
                  <th className="font-caveat text-[16px] font-bold text-ink2 text-left py-3 px-4 border-b-2 border-[rgba(60,35,10,.2)]">Page</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["PDF", "✓ Analyse, Convert", "✓ From Images, Text", "PDF Tools"],
                  ["DOCX", "✓ Analyse, Convert", "—", "DOCX Tools"],
                  ["TXT", "✓ Convert to PDF", "✓ From PDF, DOCX", "DOCX Tools"],
                  ["HTML", "—", "✓ From DOCX, CSV", "DOCX Tools"],
                  ["Markdown", "—", "✓ From DOCX", "DOCX Tools"],
                  ["CSV", "✓ Convert to HTML", "✓ Word frequency", "DOCX Tools"],
                  ["PNG/JPG", "✓ Bundle to PDF", "✓ From PDF pages", "PDF Tools"],
                ].map(([fmt, inp, out, pg]) => (
                  <tr key={fmt} className="border-b border-dashed border-[rgba(100,70,40,.12)] hover:bg-[rgba(192,120,24,.04)] transition-colors duration-150">
                    <td className="font-caveat text-[15px] font-bold text-amber2 py-3 px-4">{fmt}</td>
                    <td className="font-patrick text-[13px] text-ink3 py-3 px-4">{inp}</td>
                    <td className="font-patrick text-[13px] text-ink3 py-3 px-4">{out}</td>
                    <td className="font-patrick text-[13px] text-ink4 py-3 px-4">{pg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
