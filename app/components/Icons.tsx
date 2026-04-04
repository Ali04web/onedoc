import React from "react";
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
  name?: keyof typeof Lucide | "XBrand";
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
    (mappedName && ((Lucide as any)[mappedName] || customIcon)) || Lucide.Box;

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
