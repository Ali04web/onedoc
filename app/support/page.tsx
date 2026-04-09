"use client";

import React, { useState } from "react";
import { Tip, Toast } from "@/app/components/DocLensUI";
import { UIcon } from "@/app/components/Icons";

const faqs = [
  {
    q: "Is OneDocs free to use?",
    a: "Yes. OneDocs remains free while focusing on a more premium product experience. The goal is to make the tool feel trustworthy without hiding features behind a paywall.",
  },
  {
    q: "Are my documents uploaded anywhere?",
    a: "The main conversions and analysis flows run in the browser. Your files stay on your device unless you explicitly use the PDF Link feature, which is the one feature designed for sharing.",
  },
  {
    q: "Which PDF to DOCX option should I use?",
    a: "Choose the accuracy-first option when visual fidelity matters most. Choose the editable option when the document needs post-conversion editing and some layout shift is acceptable.",
  },
  {
    q: "Does OneDocs work well on mobile?",
    a: "Yes. The layout stays compact on smaller screens, with direct actions and simpler sections instead of large hero blocks.",
  },
  {
    q: "Why does the app feel different now?",
    a: "The interface was refreshed to feel clearer and more tool-focused, while still keeping a stronger visual identity on the homepage.",
  },
];

const formats = [
  ["PDF", "Analyse and convert", "Text, image, DOCX, sharing", "PDF Tools"],
  ["DOCX", "Analyse and convert", "HTML, text, Markdown, print", "DOCX Tools"],
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
      setToast("Please complete every field before sending your message.");
      return;
    }

    setToast("Message prepared. Wire this form to your preferred support inbox next.");
    setForm({ name: "", email: "", type: "question", message: "" });
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="page-shell">
        <section className="mt-1 grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="surface-panel p-5 md:p-8">
            <div className="mb-5 flex items-center gap-4">
              <div className="page-kicker">Frequently Asked Questions</div>
              <div className="premium-divider flex-1" />
            </div>

            <div className="grid gap-3">
              {faqs.map((faq, index) => {
                const open = openFaq === index;
                return (
                  <div
                    key={faq.q}
                    className={`rounded-[24px] border transition-all duration-200 ${
                      open
                        ? "border-black/5 bg-white"
                        : "border-black/5 bg-white/72"
                    }`}
                  >
                    <Tip tip={open ? "Hide this answer." : "Open this answer."} side="top">
                      <button
                        onClick={() => setOpenFaq(open ? null : index)}
                        title={open ? "Hide this answer." : "Open this answer."}
                        className="flex w-full items-center gap-4 px-5 py-5 text-left"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-white/80 text-[var(--color-violet)]">
                          <UIcon name={open ? "Check" : "HelpCircle"} size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[15px] font-semibold text-ink2">{faq.q}</div>
                        </div>
                        <div className="text-[12px] uppercase tracking-[0.18em] text-ink4">
                          {open ? "Hide" : "Open"}
                        </div>
                      </button>
                    </Tip>

                    {open ? (
                      <div className="px-5 pb-5 pt-0 text-[14px] leading-relaxed text-ink3 animate-fade-up">
                        {faq.a}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="surface-panel p-5 md:p-8">
            <div className="mb-5 page-kicker">Contact Studio</div>
            <div className="font-caveat text-[32px] font-semibold leading-none text-ink2">
              Contact support
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-ink3">
              Send a message and wire this form to your inbox later.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
                title="Enter the name support should reply to."
                className="w-full rounded-[18px] border border-black/5 bg-white/82 px-4 py-3 text-[14px] text-ink outline-none placeholder:text-ink4 focus:border-black/5 focus:bg-white focus:shadow-[0_0_0_4px_rgba(110,124,255,.12)]"
              />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="Email address"
                title="Enter the email address for the reply."
                className="w-full rounded-[18px] border border-black/5 bg-white/82 px-4 py-3 text-[14px] text-ink outline-none placeholder:text-ink4 focus:border-black/5 focus:bg-white focus:shadow-[0_0_0_4px_rgba(110,124,255,.12)]"
              />
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                title="Choose the kind of message you want to send."
                className="w-full rounded-[18px] border border-black/5 bg-white/82 px-4 py-3 text-[14px] text-ink outline-none focus:border-black/5 focus:bg-white focus:shadow-[0_0_0_4px_rgba(110,124,255,.12)]"
              >
                <option value="question">Question</option>
                <option value="bug">Bug report</option>
                <option value="feature">Feature request</option>
                <option value="feedback">General feedback</option>
              </select>
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Tell us what your users need, what feels off, or what you want improved."
                title="Describe your question, problem, or requested improvement."
                className="w-full resize-y rounded-[18px] border border-black/5 bg-white/82 px-4 py-3 text-[14px] text-ink outline-none placeholder:text-ink4 focus:border-black/5 focus:bg-white focus:shadow-[0_0_0_4px_rgba(110,124,255,.12)]"
              />

              <div className="flex flex-wrap gap-3">
                <Tip tip="Prepare this support message." side="top">
                  <button
                    type="submit"
                    title="Prepare this support message."
                    className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-5 py-3 text-[14px] font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <UIcon name="Mail" size={16} />
                    Send message
                  </button>
                </Tip>
                <Tip tip="Open the current public contact profile." side="top">
                  <a
                    href="https://x.com/alivldm"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open the current public contact profile."
                    className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/80 px-5 py-3 text-[14px] font-semibold text-ink2 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
                  >
                    <UIcon name="XBrand" size={14} />
                    Connect on X
                  </a>
                </Tip>
              </div>
            </form>
          </div>
        </section>

        <section className="mt-5 surface-panel overflow-hidden">
          <div className="p-5 md:p-8">
            <div className="mb-5 flex items-center gap-4">
              <div className="page-kicker">Supported Formats</div>
              <div className="premium-divider flex-1" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse">
                <thead>
                  <tr className="border-b border-black/5 text-left text-[12px] uppercase tracking-[0.18em] text-ink4">
                    <th className="pb-4 pr-6 font-semibold">Format</th>
                    <th className="pb-4 pr-6 font-semibold">Input</th>
                    <th className="pb-4 pr-6 font-semibold">Output</th>
                    <th className="pb-4 font-semibold">Area</th>
                  </tr>
                </thead>
                <tbody>
                  {formats.map(([fmt, input, output, area]) => (
                    <tr key={fmt} className="border-b border-black/5">
                      <td className="py-5 pr-6 font-caveat text-[24px] font-semibold text-ink2">
                        {fmt}
                      </td>
                      <td className="py-5 pr-6 text-[14px] text-ink3">{input}</td>
                      <td className="py-5 pr-6 text-[14px] text-ink3">{output}</td>
                      <td className="py-5 text-[14px] font-semibold text-ink4">{area}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {toast ? <Toast msg={toast} onDone={() => setToast(null)} /> : null}
    </div>
  );
}
