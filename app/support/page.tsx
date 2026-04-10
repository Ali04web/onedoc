"use client";

import React, { useState } from "react";
import { Tip, Toast } from "@/app/components/DocLensUI";
import { UIcon } from "@/app/components/Icons";

const faqs = [
  {
    q: "Is OneDocs free to use?",
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
    q: "Does OneDocs work on mobile?",
    a: "Yes. The layout is fully responsive.",
  },
];

const formats = [
  ["PDF", "Analyse & convert", "Text, image, DOCX", "PDF Tools"],
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
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          {/* FAQ */}
          <div className="surface-panel p-5 md:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7c6aff]/10 border border-[#7c6aff]/15 text-[#7c6aff]">
                <UIcon name="HelpCircle" size={15} />
              </div>
              <div className="font-display text-[15px] font-bold text-white">FAQ</div>
              <div className="flex-1 h-px bg-white/[0.04]" />
            </div>

            <div className="grid gap-2">
              {faqs.map((faq, index) => {
                const open = openFaq === index;
                return (
                  <div
                    key={faq.q}
                    className={`rounded-xl border transition-all duration-200 ${
                      open
                        ? "border-white/[0.08] bg-white/[0.03]"
                        : "border-white/[0.04] bg-white/[0.015]"
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaq(open ? null : index)}
                      className="flex w-full items-center gap-3 px-4 py-4 text-left"
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                        open
                          ? "border-[#00d4aa]/20 bg-[#00d4aa]/10 text-[#00d4aa]"
                          : "border-white/[0.06] bg-white/[0.03] text-[#6b6d80]"
                      }`}>
                        <UIcon name={open ? "Check" : "HelpCircle"} size={13} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-white">{faq.q}</div>
                      </div>
                      <UIcon name={open ? "ChevronUp" : "ChevronDown"} size={14} className="text-[#6b6d80]" />
                    </button>

                    {open && (
                      <div className="px-4 pb-4 pt-0 text-[13px] leading-relaxed text-[#9294a5] animate-fade-in ml-11">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Form */}
          <div className="surface-panel p-5 md:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/15 text-[#00d4aa]">
                <UIcon name="Mail" size={15} />
              </div>
              <div className="font-display text-[15px] font-bold text-white">Contact</div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-3">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[13px] text-white outline-none placeholder:text-[#6b6d80] focus:ring-2 focus:ring-[#7c6aff]/20 focus:border-[#7c6aff]/30"
              />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="Email address"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[13px] text-white outline-none placeholder:text-[#6b6d80] focus:ring-2 focus:ring-[#7c6aff]/20 focus:border-[#7c6aff]/30"
              />
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full rounded-xl border border-white/[0.08] bg-[#12121a] px-4 py-2.5 text-[13px] text-white outline-none focus:ring-2 focus:ring-[#7c6aff]/20 focus:border-[#7c6aff]/30"
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
                className="w-full resize-y rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[13px] text-white outline-none placeholder:text-[#6b6d80] focus:ring-2 focus:ring-[#7c6aff]/20 focus:border-[#7c6aff]/30"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#5b4bcf] px-5 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-[#7c6aff]/20 transition-all hover:-translate-y-0.5"
                >
                  <UIcon name="Mail" size={14} />
                  Send
                </button>
                <a
                  href="https://x.com/alivldm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 text-[13px] font-semibold text-white no-underline transition-all hover:-translate-y-0.5 hover:bg-white/[0.06]"
                >
                  <UIcon name="XBrand" size={12} />
                  X
                </a>
              </div>
            </form>
          </div>
        </section>

        {/* Supported Formats */}
        <section className="surface-panel overflow-hidden p-5 md:p-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ffa940]/10 border border-[#ffa940]/15 text-[#ffa940]">
              <UIcon name="FileSpreadsheet" size={15} />
            </div>
            <div className="font-display text-[15px] font-bold text-white">Supported Formats</div>
            <div className="flex-1 h-px bg-white/[0.04]" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-[11px] uppercase tracking-widest text-[#6b6d80]">
                  <th className="pb-3 pr-6 font-semibold">Format</th>
                  <th className="pb-3 pr-6 font-semibold">Input</th>
                  <th className="pb-3 pr-6 font-semibold">Output</th>
                  <th className="pb-3 font-semibold">Area</th>
                </tr>
              </thead>
              <tbody>
                {formats.map(([fmt, input, output, area]) => (
                  <tr key={fmt} className="border-b border-white/[0.04]">
                    <td className="py-3.5 pr-6 font-display text-[15px] font-bold text-white">{fmt}</td>
                    <td className="py-3.5 pr-6 text-[13px] text-[#9294a5]">{input}</td>
                    <td className="py-3.5 pr-6 text-[13px] text-[#9294a5]">{output}</td>
                    <td className="py-3.5 text-[13px] font-medium text-[#6b6d80]">{area}</td>
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
