import type { Metadata } from "next";
import {
  Space_Grotesk,
  Inter,
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
  title: "OneDocs | Document Conversion Suite",
  description:
    "Fast PDF and DOCX tools for convert, analyze, and share workflows.",
  icons: {
    icon: "/onedocs-symbol.svg",
    shortcut: "/onedocs-symbol.svg",
    apple: "/onedocs-symbol.svg",
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
      <body className="min-h-full">
        <Navbar />
        <main className="relative flex flex-col min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/[0.04] bg-[rgba(6,6,11,0.5)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-5">
            <div className="text-[12px] text-[#6b6d80] font-medium">
              © 2026 OneDocs · All tools free
            </div>
            <div className="flex items-center gap-4 text-[12px] text-[#6b6d80]">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
                In-browser processing
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
