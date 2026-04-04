import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  IBM_Plex_Mono,
  Manrope,
} from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const display = Cormorant_Garamond({
  variable: "--font-display-ui",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Manrope({
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
    "Premium-feeling PDF and DOCX tools for analysis, conversion, sharing, and polished exports.",
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
