import type { Metadata } from "next";
import {
  Space_Grotesk,
  Outfit,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const display = Space_Grotesk({
  variable: "--font-display-ui",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Outfit({
  variable: "--font-body-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
        <Navbar />
        <main className="relative flex flex-col min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
