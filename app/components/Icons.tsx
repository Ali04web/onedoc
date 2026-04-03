import React from "react";
import * as Lucide from "lucide-react";

const emojiToLucide: Record<string, keyof typeof Lucide> = {
  "🏠": "Home",
  "🔬": "Microscope",
  "📄": "FileText",
  "📝": "FileSignature", // Better than FileEdit
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
  "✗": "X",
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
  "𝕏": "Twitter",
  "X": "Twitter",
  "✉️": "Mail",
};

interface IconProps extends React.SVGProps<SVGSVGElement> {
  emoji?: string;
  name?: keyof typeof Lucide;
  size?: number | string;
  color?: string;
  sketchy?: boolean;
}

export function UIcon({ emoji, name, size = 24, color = "currentColor", sketchy = false, className = "", ...props }: IconProps) {
  let mappedName = name;
  if (emoji && emojiToLucide[emoji]) {
    mappedName = emojiToLucide[emoji];
  }

  // Fallback to a generic box if unknown symbol
  const SelectedIcon = (mappedName ? (Lucide as any)[mappedName] : null) || Lucide.Box;

  return (
    <div className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size, color }}>
      <SelectedIcon
        size={size}
        color="currentColor"
        strokeWidth={2.5}
        className="transition-transform duration-200"
        style={sketchy ? { filter: 'url(#handdrawn-filter)', transform: 'rotate(-2deg)' } : undefined}
        {...props}
      />
      {sketchy && (
        <svg width="0" height="0" className="absolute pointer-events-none">
          <filter id="handdrawn-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}
    </div>
  );
}

// Dedicated wrapper for replacing string emojis exactly where they lived
export function Emoji({ symbol, size = 24, className = "" }: { symbol: string, size?: number, className?: string }) {
  return <UIcon emoji={symbol} size={size} sketchy={true} className={className} />;
}
