import type { Metadata } from "next";
import {
  DM_Sans,
  IBM_Plex_Mono,
  Sora,
} from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const display = Sora({
  variable: "--font-display-ui",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = DM_Sans({
  variable: "--font-body-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
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
        <div className="premium-ambient" aria-hidden="true" />
        <Navbar />
        <div
          className="relative flex min-h-[calc(100dvh-96px)] flex-col overflow-hidden ruled"
        >
          {children}
        </div>
      </body>
    </html>
  );
}
