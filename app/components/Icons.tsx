import React from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Lucide from "lucide-react";

const emojiToLucide: Record<string, keyof typeof Lucide | "XBrand"> = {
  "🏠": "Home",
  "🔬": "Microscope",
  "📄": "FileText",
  "📝": "FileSignature",
  "💬": "MessageCircleHeart",
  "🔗": "Link",
  "📂": "FolderOpen",
  "📁": "Folder",
  "🖼️": "Image",
  "✂️": "Scissors",
  "↔️": "ArrowLeftRight",
  "🔄": "RefreshCcw",
  "⏳": "Hourglass",
  "✅": "CheckCircle2",
  "❓": "HelpCircle",
  "💡": "Lightbulb",
  "📊": "BarChart3",
  "🔤": "Type",
  "🔍": "Search",
  "🔒": "Lock",
  "📋": "ClipboardList",
  "📎": "Paperclip",
  "📏": "Ruler",
  "📑": "Bookmark",
  "📖": "BookOpen",
  "📜": "ScrollText",
  "✍️": "PenTool",
  "✏️": "Pencil",
  "✓": "Check",
  "✕": "X",
  "⬇": "Download",
  "↗": "ExternalLink",
  "🕐": "Clock",
  "🧰": "Wrench",
  "🏆": "Trophy",
  "🐛": "Bug",
  "💾": "Save",
  "🛡️": "ShieldCheck",
  "⚡": "Zap",
  "🌐": "Globe",
  "𝕏": "XBrand",
  X: "XBrand",
  "✉️": "Mail",
  "✨": "Sparkles",
  "🧩": "LayoutGrid",
  "🖨️": "Printer",
  "🛠️": "Sparkles",
};

interface IconProps extends React.SVGProps<SVGSVGElement> {
  emoji?: string;
  name?: keyof typeof Lucide | "XBrand" | "NavHome" | "NavAnalyze" | "NavPdfTools" | "NavDocxTools" | "NavPdfLink" | "NavSupport";
  size?: number | string;
  color?: string;
  sketchy?: boolean;
}

const XBrandIcon = ({ size = 24, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const customIcons = {
  XBrand: XBrandIcon,
  NavHome: ({ size = 24, ...props }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="3,11.5 12,3 21,11.5"/>
      <path d="M5 10.2V21H19V10.2"/>
      <path d="M10 21V15H14V21"/>
      <path d="M12.5 15L14 16.5"/>
      <rect x="5.5" y="12" width="3" height="3" rx="0.5"/>
      <rect x="15.5" y="12" width="3" height="3" rx="0.5"/>
    </svg>
  ),
  NavAnalyze: ({ size = 24, ...props }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="10" cy="10" r="7"/>
      <line x1="15.5" y1="15.5" x2="22" y2="22"/>
      <rect x="7" y="10.5" width="1.8" height="2.5" rx="0.9" fill="currentColor" stroke="none"/>
      <rect x="9.8" y="7.5" width="1.8" height="5.5" rx="0.9" fill="currentColor" stroke="none"/>
      <rect x="12.6" y="9" width="1.8" height="4" rx="0.9" fill="currentColor" stroke="none"/>
      <line x1="6.5" y1="13" x2="14.5" y2="13"/>
    </svg>
  ),
  NavPdfTools: ({ size = 24, ...props }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4.5 2H14L20 8V22H4.5Z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="7" y1="11" x2="17" y2="11"/>
      <circle cx="10" cy="11" r="1.5" fill="currentColor" stroke="none"/>
      <line x1="7" y1="15" x2="17" y2="15"/>
      <circle cx="13.5" cy="15" r="1.5" fill="currentColor" stroke="none"/>
      <line x1="7" y1="19" x2="17" y2="19"/>
      <circle cx="9" cy="19" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  ),
  NavDocxTools: ({ size = 24, ...props }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 4.5H15.5L21 10V21H6Z" opacity="0.35"/>
      <path d="M3 7H12.5L18 12.5V23H3Z"/>
      <polyline points="12.5,7 12.5,12.5 18,12.5"/>
      <rect x="5.5" y="15" width="9" height="2.5" rx="0.6" fill="currentColor" stroke="none"/>
      <rect x="5.5" y="18.8" width="7" height="1.8" rx="0.5" fill="currentColor" stroke="none"/>
      <rect x="5.5" y="21.5" width="4.5" height="1.5" rx="0.4" fill="currentColor" stroke="none"/>
    </svg>
  ),
  NavPdfLink: ({ size = 24, ...props }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 4H8.5L11.5 7V20H2Z"/>
      <polyline points="8.5,4 8.5,7 11.5,7"/>
      <line x1="11.5" y1="12" x2="13" y2="12"/>
      <rect x="13" y="7" width="5" height="10" rx="2.5"/>
      <rect x="16" y="7" width="5" height="10" rx="2.5"/>
    </svg>
  ),
  NavSupport: ({ size = 24, ...props }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 13A7 7 0 0 1 19 13"/>
      <rect x="3" y="12" width="3.5" height="5.5" rx="1.5"/>
      <rect x="17.5" y="12" width="3.5" height="5.5" rx="1.5"/>
      <path d="M21 16.5Q22 20 20 21H16.5"/>
      <circle cx="16" cy="21" r="1.2" fill="currentColor" stroke="none"/>
    </svg>
  ),
};

export function UIcon({
  emoji,
  name,
  size = 24,
  color = "currentColor",
  className = "",
  ...props
}: IconProps) {
  const mappedName = (emoji && emojiToLucide[emoji]) || name;
  const customIcon = mappedName
    ? (customIcons as Record<string, React.ComponentType<any>>)[mappedName]
    : undefined;
  const SelectedIcon =
    (mappedName && (customIcon || (Lucide as any)[mappedName])) || Lucide.Box;

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size, color }}
    >
      <SelectedIcon size={size} color="currentColor" strokeWidth={1.95} {...props} />
    </div>
  );
}

export function Emoji({
  symbol,
  size = 24,
  className = "",
}: {
  symbol: string;
  size?: number;
  className?: string;
}) {
  return <UIcon emoji={symbol} size={size} className={className} />;
}
