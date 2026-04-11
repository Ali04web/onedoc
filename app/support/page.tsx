"use client";

import React, { useState } from "react";
import { Tip, Toast } from "@/app/components/DocLensUI";
import { UIcon } from "@/app/components/Icons";

const faqs = [
  {
    q: "Is OneDoc free to use?",
    a: "Yes. All tools are free with no sign-up required.",
  },
  {
    q: "Are my documents uploaded anywhere?",
    a: "Conversions and analysis run entirely in the browser. Your files never leave your device.",
  },
  {
    q: "Which PDF to DOCX option should I use?",
    a: "Use accuracy mode when visual fidelity matters. Use editable mode when you need to edit the text.",
  },
  {
    q: "Does OneDoc work on mobile?",
    a: "Yes. The layout is fully responsive.",
  },
];

const formats = [
  ["PDF", "Analyse & convert", "Text, image, DOCX, link", "PDF Tools"],
  ["DOCX", "Analyse & convert", "HTML, text, MD, PDF", "DOCX Tools"],
  ["TXT / MD", "Convert", "PDF", "DOCX Tools"],
  ["CSV", "Convert", "HTML table", "DOCX Tools"],
  ["JPG / PNG", "Convert", "PDF", "PDF Tools"],
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "question",
    message: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setToast("Please complete all fields.");
      return;
    }
    setToast("Message prepared. Connect this form to your inbox.");
    setForm({ name: "", email: "", type: "question", message: "" });
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="page-shell">
        {/* Page Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#00d4aa]/8 via-transparent to-[#7c6aff]/5 border border-white/[0.06] p-8 md:p-10 animate-fade-in">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#00d4aa]/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#7c6aff]/5 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex items-start gap-5">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00d4aa] to-[#00b894] shadow-xl shadow-[#00d4aa]/25">
              <UIcon name="NavSupport" size={26} className="text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">Support</h1>
              <p className="mt-1.5 text-[14px] text-[#9294a5] font-medium max-w-[500px] leading-relaxed">Find answers, check supported formats, or send us a message.</p>
            </div>
          </div>
        </div>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px] animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {/* FAQ */}
          <div className="surface-panel p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7c6aff]/10 border border-[#7c6aff]/15 text-[#7c6aff]">
                <UIcon name="HelpCircle" size={17} />
              </div>
              <div className="font-display text-[16px] font-bold text-white">Frequently Asked</div>
              <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
            </div>

            <div className="grid gap-2.5">
              {faqs.map((faq, index) => {
                const open = openFaq === index;
                return (
                  <div
                    key={faq.q}
                    className={`rounded-2xl border transition-all duration-300 ${
                      open
                        ? "border-white/[0.1] bg-white/[0.04] shadow-lg shadow-black/10"
                        : "border-white/[0.04] bg-white/[0.015] hover:border-white/[0.06] hover:bg-white/[0.025]"
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaq(open ? null : index)}
                      className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition-all"
                    >
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300 ${
                        open
                          ? "border-[#00d4aa]/25 bg-[#00d4aa]/12 text-[#00d4aa] shadow-md shadow-[#00d4aa]/10"
                          : "border-white/[0.06] bg-white/[0.03] text-[#6b6d80]"
                      }`}>
                        <UIcon name={open ? "Check" : "HelpCircle"} size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-white">{faq.q}</div>
                      </div>
                      <div className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
                        <UIcon name="ChevronDown" size={14} className="text-[#6b6d80]" />
                      </div>
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="px-5 pb-4 pt-0 text-[13px] leading-relaxed text-[#9294a5] ml-[52px]">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Form */}
          <div className="surface-panel p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00d4aa]/10 border border-[#00d4aa]/15 text-[#00d4aa]">
                <UIcon name="Mail" size={17} />
              </div>
              <div className="font-display text-[16px] font-bold text-white">Contact</div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-3.5">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] text-white outline-none placeholder:text-[#6b6d80] focus:ring-2 focus:ring-[#7c6aff]/25 focus:border-[#7c6aff]/35 hover:border-white/[0.12] transition-all duration-300"
              />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="Email address"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] text-white outline-none placeholder:text-[#6b6d80] focus:ring-2 focus:ring-[#7c6aff]/25 focus:border-[#7c6aff]/35 hover:border-white/[0.12] transition-all duration-300"
              />
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0e0e18] px-4 py-3 text-[13px] text-white outline-none focus:ring-2 focus:ring-[#7c6aff]/25 focus:border-[#7c6aff]/35 hover:border-white/[0.12] transition-all duration-300"
              >
                <option value="question">Question</option>
                <option value="bug">Bug report</option>
                <option value="feature">Feature request</option>
                <option value="feedback">General feedback</option>
              </select>
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Your message..."
                className="w-full resize-y rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] text-white outline-none placeholder:text-[#6b6d80] focus:ring-2 focus:ring-[#7c6aff]/25 focus:border-[#7c6aff]/35 hover:border-white/[0.12] transition-all duration-300"
              />

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="submit"
                  className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#5b4bcf] px-6 py-3 text-[13px] font-bold text-white shadow-lg shadow-[#7c6aff]/20 transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <UIcon name="Mail" size={14} />
                  <span className="relative">Send</span>
                </button>
                <a
                  href="https://x.com/alivldm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-3 text-[13px] font-semibold text-white no-underline transition-all hover:-translate-y-0.5 hover:bg-white/[0.06] hover:border-white/[0.12] active:scale-[0.98]"
                >
                  <UIcon name="XBrand" size={12} />
                  X
                </a>
              </div>
            </form>
          </div>
        </section>

        {/* Supported Formats */}
        <section className="surface-panel overflow-hidden p-6 md:p-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ffa940]/10 border border-[#ffa940]/15 text-[#ffa940]">
              <UIcon name="FileSpreadsheet" size={17} />
            </div>
            <div className="font-display text-[16px] font-bold text-white">Supported Formats</div>
            <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-[11px] uppercase tracking-widest text-[#6b6d80]">
                  <th className="pb-3.5 pr-6 font-semibold">Format</th>
                  <th className="pb-3.5 pr-6 font-semibold">Input</th>
                  <th className="pb-3.5 pr-6 font-semibold">Output</th>
                  <th className="pb-3.5 font-semibold">Area</th>
                </tr>
              </thead>
              <tbody>
                {formats.map(([fmt, input, output, area]) => (
                  <tr key={fmt} className="border-b border-white/[0.04] group hover:bg-white/[0.015] transition-colors duration-200">
                    <td className="py-4 pr-6 font-display text-[15px] font-bold text-white group-hover:text-[#7c6aff] transition-colors">{fmt}</td>
                    <td className="py-4 pr-6 text-[13px] text-[#9294a5]">{input}</td>
                    <td className="py-4 pr-6 text-[13px] text-[#9294a5]">{output}</td>
                    <td className="py-4 text-[13px] font-medium text-[#6b6d80]">{area}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {toast ? <Toast msg={toast} onDone={() => setToast(null)} /> : null}
    </div>
  );
}
