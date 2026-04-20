import type { Metadata } from "next";
import {
  Inter,
  Space_Grotesk,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const display = Space_Grotesk({
  variable: "--font-display-ui",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Inter({
  variable: "--font-body-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-code-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "FixPDF | Document Conversion Suite",
  description:
    "Fast PDF and DOCX tools for convert, analyze, and share workflows.",
  icons: {
    icon: "/onedoc-symbol.svg",
    shortcut: "/onedoc-symbol.svg",
    apple: "/onedoc-symbol.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white">
        <Navbar />
        <main className="relative flex flex-col min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-black/[0.06] bg-[#f7f8fc]">
          <div className="mx-auto max-w-[1200px] px-6 py-10 md:py-14">
            {/* Top row */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <img src="/onedoc-symbol.svg" alt="FixPDF" className="h-8 w-8" />
                  <span className="font-display text-[18px] font-bold text-[#1a1a2e] tracking-tight">FixPDF</span>
                </div>
                <p className="text-[13px] text-[#5f6368] max-w-[320px] leading-relaxed">
                  Every document tool you need, entirely in your browser. No uploads, no sign-ups, completely free.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-4 text-[13px]">
                <div>
                  <div className="font-semibold text-[#1a1a2e] mb-2">Tools</div>
                  <div className="flex flex-col gap-1.5 text-[#5f6368]">
                    <a href="/pdf-tools" className="hover:text-[#e5322d] transition-colors no-underline text-[#5f6368]">PDF Tools</a>
                    <a href="/docx-tools" className="hover:text-[#e5322d] transition-colors no-underline text-[#5f6368]">Word Tools</a>
                    <a href="/analyze" className="hover:text-[#e5322d] transition-colors no-underline text-[#5f6368]">Analyze</a>
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-[#1a1a2e] mb-2">More</div>
                  <div className="flex flex-col gap-1.5 text-[#5f6368]">
                    <a href="/pdf-link" className="hover:text-[#e5322d] transition-colors no-underline text-[#5f6368]">PDF Link</a>
                    <a href="/support" className="hover:text-[#e5322d] transition-colors no-underline text-[#5f6368]">Support</a>
                  </div>
                </div>
              </div>
            </div>
            {/* Bottom row */}
            <div className="pt-6 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[12px] text-[#9aa0a6] font-medium">
                © 2026 FixPDF · All tools free · No sign-up required
              </div>
              <div className="flex items-center gap-4 text-[12px] text-[#9aa0a6] font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
                  In-browser processing
                </span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
