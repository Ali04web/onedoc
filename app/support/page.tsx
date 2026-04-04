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
      <section className="text-center py-16 md:py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-block animate-slide-down mb-6 bg-paper2 p-4 rounded-2xl shadow-sm border border-paper3"><Emoji symbol="💬" size={48} className="text-amber" /></div>
          <h1 className="text-4xl md:text-5xl font-bold text-ink mb-4 max-w-2xl">
            Help & Support
          </h1>
          <p className="text-base md:text-lg text-ink3 max-w-[500px] leading-relaxed mb-8">
            Find answers, learn tips, or reach out to us. We&apos;re here to help you get the most out of DocLens.
          </p>
          <div className="flex justify-center">
            <Tip tip="Follow us on X (Twitter)" side="bottom">
              <a
                href="https://x.com/alivldm"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-6 bg-paper2 hover:bg-paper3 text-ink2 text-[15px] font-semibold rounded-full border border-paper3 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all duration-200 no-underline flex items-center justify-center gap-2 cursor-pointer"
              >
                <Emoji symbol="𝕏" size={16} /> Connect on X
              </a>
            </Tip>
          </div>
        </div>
      </section>

      <div className="px-6 md:px-10 lg:px-20 pb-16 max-w-5xl mx-auto space-y-16">
        {/* Quick Tips */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-paper2 border border-paper3 shadow-sm"><Emoji symbol="💡" size={20} /></div>
            <div className="text-2xl font-bold text-ink">
              Quick Tips
            </div>
            <div className="flex-1 border-t border-paper3 mt-1" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip, i) => (
              <Tip key={tip.title} tip={tip.desc} side="top">
                <SCard>
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber/5 border border-amber/10 text-amber flex-shrink-0"><Emoji symbol={tip.icon} size={20} /></div>
                    <div>
                      <div className="text-lg font-bold text-ink mb-1">{tip.title}</div>
                      <div className="text-[13px] text-ink4 leading-relaxed">{tip.desc}</div>
                    </div>
                  </div>
                </SCard>
              </Tip>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-paper2 border border-paper3 shadow-sm"><Emoji symbol="❓" size={20} /></div>
            <div className="text-2xl font-bold text-ink">
              Frequently Asked Questions
            </div>
            <div className="flex-1 border-t border-paper3 mt-1" />
          </div>
          <div className="flex flex-col gap-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-paper3 rounded-xl overflow-hidden bg-paper2 transition-all duration-200">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center gap-4 py-4 px-6 bg-transparent border-none cursor-pointer text-left hover:bg-paper3/50 transition-colors"
                >
                  <span className={`text-sm text-amber font-bold transition-transform duration-200 ${openFaq === i ? "rotate-90" : ""}`}>▶</span>
                  <span className="text-lg font-bold text-ink flex-1">{faq.q}</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 pt-0 border-t border-paper3 animate-slide-down">
                    <div className="text-sm text-ink3 leading-relaxed pt-4">{faq.a}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-paper2 border border-paper3 shadow-sm"><Emoji symbol="✉️" size={20} /></div>
            <div className="text-2xl font-bold text-ink">
              Contact Us
            </div>
            <div className="flex-1 border-t border-paper3 mt-1" />
          </div>
          <SCard>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-ink2 mb-2 block">Your Name</label>
                  <Tip tip="How should we address you?" side="top">
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Jane Doe"
                      className="w-full bg-paper border border-paper3 rounded-lg py-3 px-4 text-ink text-sm outline-none focus:border-amber focus:ring-1 focus:ring-amber/50 transition-all duration-200"
                    />
                  </Tip>
                </div>
                <div>
                  <label className="text-sm font-semibold text-ink2 mb-2 block">Email</label>
                  <Tip tip="We'll reply to this address" side="top">
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="jane@example.com"
                      className="w-full bg-paper border border-paper3 rounded-lg py-3 px-4 text-ink text-sm outline-none focus:border-amber focus:ring-1 focus:ring-amber/50 transition-all duration-200"
                    />
                  </Tip>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-ink2 mb-2 block">Type</label>
                <Tip tip="Let us know what this is about" side="right">
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full bg-paper border border-paper3 rounded-lg py-3 px-4 text-ink text-sm outline-none cursor-pointer focus:border-amber focus:ring-1 focus:ring-amber/50 transition-all duration-200"
                  >
                    <option value="question">Question</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="feedback">General Feedback</option>
                  </select>
                </Tip>
              </div>
              <div>
                <label className="text-sm font-semibold text-ink2 mb-2 block">Message</label>
                <Tip tip="Describe your issue or idea in detail" side="top">
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Tell us what's on your mind…"
                    rows={5}
                    className="w-full bg-paper border border-paper3 rounded-lg py-3 px-4 text-ink text-sm outline-none resize-y focus:border-amber focus:ring-1 focus:ring-amber/50 transition-all duration-200"
                  />
                </Tip>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Tip tip="Submit your message" side="top">
                  <button
                    type="submit"
                    className="py-3 px-6 bg-amber hover:bg-amber2 text-white text-[15px] font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Emoji symbol="✉️" size={18} /> Send Message
                  </button>
                </Tip>
                <Tip tip="Contact us on X (Twitter)" side="top">
                  <a
                    href="https://x.com/alivldm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-6 bg-paper hover:bg-paper3 text-ink2 text-[15px] font-semibold rounded-lg border border-paper3 shadow-sm hover:shadow transition-all duration-200 no-underline cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    <Emoji symbol="𝕏" size={18} /> Connect on X
                  </a>
                </Tip>
              </div>
            </form>
          </SCard>
        </section>

        {/* Formats Grid */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-paper2 border border-paper3 shadow-sm"><Emoji symbol="⌨️" size={20} /></div>
            <div className="text-2xl font-bold text-ink">
              Supported Formats
            </div>
            <div className="flex-1 border-t border-paper3 mt-1" />
          </div>
          <div className="overflow-x-auto bg-paper2 rounded-xl border border-paper3 shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-sm font-bold text-ink2 text-left py-4 px-6 border-b border-paper3">Format</th>
                  <th className="text-sm font-bold text-ink2 text-left py-4 px-6 border-b border-paper3">Input</th>
                  <th className="text-sm font-bold text-ink2 text-left py-4 px-6 border-b border-paper3">Output</th>
                  <th className="text-sm font-bold text-ink2 text-left py-4 px-6 border-b border-paper3">Page</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper3">
                {[
                  ["PDF", ["✓", " Analyse, Convert"], ["✓", " From Images, Text"], "PDF Tools"],
                  ["DOCX", ["✓", " Analyse, Convert"], "—", "DOCX Tools"],
                  ["TXT", ["✓", " Convert to PDF"], ["✓", " From PDF, DOCX"], "DOCX Tools"],
                  ["HTML", "—", ["✓", " From DOCX, CSV"], "DOCX Tools"],
                  ["Markdown", "—", ["✓", " From DOCX"], "DOCX Tools"],
                  ["CSV", ["✓", " Convert to HTML"], ["✓", " Word frequency"], "DOCX Tools"],
                  ["PNG/JPG", ["✓", " Bundle to PDF"], ["✓", " From PDF pages"], "PDF Tools"],
                ].map(([fmt, inp, out, pg]) => (
                  <tr key={fmt as string} className="hover:bg-paper3/50 transition-colors duration-150">
                    <td className="text-sm font-bold text-amber py-3 px-6">{fmt}</td>
                    <td className="text-sm text-ink3 py-3 px-6">
                      {Array.isArray(inp) ? <span className="flex items-center gap-1.5"><Emoji symbol={inp[0]} size={14} className="text-teal" />{inp[1]}</span> : inp}
                    </td>
                    <td className="text-sm text-ink3 py-3 px-6">
                      {Array.isArray(out) ? <span className="flex items-center gap-1.5"><Emoji symbol={out[0]} size={14} className="text-teal" />{out[1]}</span> : out}
                    </td>
                    <td className="text-[13px] text-ink4 py-3 px-6 uppercase tracking-wider font-semibold">{pg}</td>
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
