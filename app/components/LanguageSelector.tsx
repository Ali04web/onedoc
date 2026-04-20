"use client";

import React, { useState, useEffect, useRef } from "react";
import { UIcon } from "./Icons";

const languages = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "hi", label: "Hindi" },
  { code: "ar", label: "Arabic" },
  { code: "zh-CN", label: "Chinese" },
  { code: "ja", label: "Japanese" },
];

export default function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Read the googtrans cookie to find current language
    const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
    if (match && match[1]) {
      setCurrentLang(match[1]);
    }

    // Add Google Translate script if not present
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          { pageLanguage: "en", autoDisplay: false },
          "google_translate_element"
        );
      };
    }

    // click outside to close
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLanguage = (langCode: string) => {
    // Set cookie for google translate
    document.cookie = `googtrans=/en/${langCode}; path=/`;
    document.cookie = `googtrans=/en/${langCode}; domain=${window.location.hostname}; path=/`;
    
    // Reload to apply
    window.location.reload();
  };

  const currentLabel = languages.find(l => l.code === currentLang)?.label || "English";

  return (
    <div className="relative" ref={ref}>
      {/* Hidden google translate element */}
      <div id="google_translate_element" className="hidden"></div>
      
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-[#5f6368] hover:text-[#1a1a2e] hover:bg-black/[0.03] transition-all"
        aria-label="Select Language"
      >
        <UIcon name="Globe" size={16} />
        <span className="hidden sm:inline-block">{currentLabel}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 rounded-xl bg-white p-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-black/[0.06] z-50 animate-fade-in-scale origin-top-right">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={`w-full flex items-center justify-between px-3 py-2 text-[13px] rounded-lg transition-colors ${
                currentLang === lang.code 
                  ? "bg-[#e5322d]/[0.06] text-[#e5322d] font-semibold" 
                  : "text-[#5f6368] hover:bg-black/[0.03] hover:text-[#1a1a2e] font-medium"
              }`}
            >
              {lang.label}
              {currentLang === lang.code && (
                <div className="h-1.5 w-1.5 rounded-full bg-[#e5322d]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
