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
          <div className="mx-auto max-w-[1200px] px-6 py-8 md:py-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              {/* Left Side */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <img src="/onedoc-symbol.svg" alt="FixPDF" className="h-6 w-6" />
                  <span className="font-display text-[16px] font-bold text-[#1a1a2e] tracking-tight">FixPDF</span>
                  <span className="text-black/[0.1] hidden sm:inline">|</span>
                  <div className="text-[12px] text-[#9aa0a6] font-medium flex items-center">
                    © 2026 FixPDF
                  </div>
                  <span className="text-black/[0.1] hidden sm:inline">|</span>
                  <div className="text-[12px] text-[#9aa0a6] font-medium flex items-center">
                    <a href="https://x.com/ali04web" target="_blank" rel="noopener noreferrer" className="hover:text-[#e5322d] transition-colors text-[#5f6368] font-semibold underline underline-offset-2">
                      Made By Ali
                    </a>
                  </div>
                </div>
                <p className="text-[13px] text-[#5f6368] max-w-[400px] leading-relaxed">
                  Every document tool you need, entirely in your browser. All tools free, no sign-up required.
                </p>
              </div>

              {/* Right Side */}
              <div className="flex flex-col md:items-end gap-3">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
                  <a href="/pdf-tools" className="hover:text-[#e5322d] transition-colors text-[#5f6368]">PDF Tools</a>
                  <a href="/docx-tools" className="hover:text-[#e5322d] transition-colors text-[#5f6368]">Word Tools</a>
                  <a href="/analyze" className="hover:text-[#e5322d] transition-colors text-[#5f6368]">Analyze</a>
                  <a href="/pdf-link" className="hover:text-[#e5322d] transition-colors text-[#5f6368]">PDF Link</a>
                  <a href="/support" className="hover:text-[#e5322d] transition-colors text-[#5f6368]">Support</a>
                </div>
                <div className="flex items-center md:justify-end gap-1.5 text-[12px] text-[#9aa0a6] font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
                  In-browser processing
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
