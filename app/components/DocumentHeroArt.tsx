import React, { useId } from "react";

export type HeroArtMode =
  | "home"
  | "analyze"
  | "pdf"
  | "docx"
  | "link"
  | "support"
  | "viewer";

const ART_CONFIG: Record<
  HeroArtMode,
  {
    title: string;
    subtitle: string;
    badgeA: string;
    badgeB: string;
    badgeC: string;
    start: string;
    mid: string;
    end: string;
    accent: string;
  }
> = {
  home: {
    title: "Document studio",
    subtitle: "PDF . DOCX . Share",
    badgeA: "Convert",
    badgeB: "Analyze",
    badgeC: "Share",
    start: "#6E7CFF",
    mid: "#17B897",
    end: "#FF8E3D",
    accent: "#FFD35C",
  },
  analyze: {
    title: "Search and insights",
    subtitle: "Read . Find . Export",
    badgeA: "Read",
    badgeB: "Search",
    badgeC: "Stats",
    start: "#627BFF",
    mid: "#20C6A6",
    end: "#55C7F7",
    accent: "#FFE17F",
  },
  pdf: {
    title: "PDF accuracy",
    subtitle: "DOCX . PNG . Merge",
    badgeA: "DOCX",
    badgeB: "PNG",
    badgeC: "Split",
    start: "#FF6D7A",
    mid: "#FF9C4A",
    end: "#FFD45E",
    accent: "#6E7CFF",
  },
  docx: {
    title: "Word outputs",
    subtitle: "HTML . MD . PDF",
    badgeA: "HTML",
    badgeB: "Markdown",
    badgeC: "Preview",
    start: "#6E7CFF",
    mid: "#8F7BFF",
    end: "#FF8E3D",
    accent: "#1BC3A2",
  },
  link: {
    title: "Viewer links",
    subtitle: "Upload . Generate . Share",
    badgeA: "Upload",
    badgeB: "Viewer",
    badgeC: "Copy",
    start: "#16C7A1",
    mid: "#61D5F7",
    end: "#6E7CFF",
    accent: "#FFD05C",
  },
  support: {
    title: "Helpful and clear",
    subtitle: "FAQ . Contact . Formats",
    badgeA: "FAQ",
    badgeB: "Inbox",
    badgeC: "Guides",
    start: "#FF8E3D",
    mid: "#FF6474",
    end: "#6E7CFF",
    accent: "#16C7A1",
  },
  viewer: {
    title: "Clean viewer",
    subtitle: "Open . Review . Download",
    badgeA: "Hosted",
    badgeB: "Readable",
    badgeC: "PDF",
    start: "#6E7CFF",
    mid: "#55C7F7",
    end: "#16C7A1",
    accent: "#FFD35C",
  },
};

export function DocumentHeroArt({
  mode = "home",
  className = "",
}: {
  mode?: HeroArtMode;
  className?: string;
}) {
  const config = ART_CONFIG[mode];
  const uid = useId().replace(/:/g, "");
  const bgId = `hero-bg-${uid}`;
  const panelId = `hero-panel-${uid}`;
  const paperId = `hero-paper-${uid}`;
  const chipId = `hero-chip-${uid}`;
  const glowId = `hero-glow-${uid}`;
  const shadowId = `hero-shadow-${uid}`;
  const softShadowId = `hero-soft-shadow-${uid}`;
  const gridId = `hero-grid-${uid}`;

  return (
    <svg
      viewBox="0 0 520 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={bgId} x1="48" y1="26" x2="432" y2="366" gradientUnits="userSpaceOnUse">
          <stop stopColor={config.start} />
          <stop offset="0.52" stopColor={config.mid} />
          <stop offset="1" stopColor={config.end} />
        </linearGradient>
        <linearGradient
          id={panelId}
          x1="106"
          y1="74"
          x2="408"
          y2="314"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFFFFF" stopOpacity="0.96" />
          <stop offset="1" stopColor="#F5F8FF" stopOpacity="0.98" />
        </linearGradient>
        <linearGradient id={paperId} x1="110" y1="88" x2="272" y2="318" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#EEF4FF" />
        </linearGradient>
        <linearGradient id={chipId} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FFFFFF" stopOpacity="0.84" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.26" />
        </linearGradient>
        <filter id={glowId} x="-40" y="-20" width="580" height="460" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="34" />
        </filter>
        <filter id={shadowId} x="40" y="44" width="360" height="320" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="24" stdDeviation="18" floodColor="#34427A" floodOpacity="0.18" />
        </filter>
        <filter id={softShadowId} x="256" y="84" width="180" height="170" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="18" stdDeviation="12" floodColor="#32406F" floodOpacity="0.12" />
        </filter>
        <pattern id={gridId} width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M22 0H0V22" stroke="white" strokeOpacity="0.09" />
        </pattern>
      </defs>

      <g filter={`url(#${glowId})`} opacity="0.5">
        <ellipse cx="146" cy="104" rx="108" ry="88" fill={config.accent} />
        <ellipse cx="416" cy="320" rx="118" ry="92" fill={config.mid} />
      </g>

      <rect x="24" y="24" width="472" height="372" rx="40" fill={`url(#${bgId})`} />
      <rect x="24" y="24" width="472" height="372" rx="40" fill={`url(#${gridId})`} />
      <rect
        x="24.5"
        y="24.5"
        width="471"
        height="371"
        rx="39.5"
        stroke="white"
        strokeOpacity="0.28"
      />

      <path
        d="M74 66C74 57.1634 81.1634 50 90 50H430C438.837 50 446 57.1634 446 66V84H74V66Z"
        fill="white"
        fillOpacity="0.22"
      />
      <circle cx="98" cy="67" r="6" fill="white" fillOpacity="0.74" />
      <circle cx="118" cy="67" r="6" fill="white" fillOpacity="0.38" />
      <circle cx="138" cy="67" r="6" fill="white" fillOpacity="0.26" />

      <g filter={`url(#${shadowId})`}>
        <rect x="74" y="84" width="306" height="254" rx="30" fill={`url(#${panelId})`} />
      </g>

      <g transform="rotate(-6 192 212)">
        <rect x="104" y="92" width="166" height="226" rx="24" fill={`url(#${paperId})`} />
        <path d="M215 92H244L270 118V140H215V92Z" fill="#DCE7FF" />
        <path d="M215 92V118C215 130.15 224.85 140 237 140H270" fill="#D6E3FF" />
        <path
          d="M215 92V118C215 130.15 224.85 140 237 140H270"
          stroke="#CAD8FE"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <rect x="126" y="132" width="122" height="14" rx="7" fill={config.start} fillOpacity="0.16" />
        <rect x="126" y="162" width="100" height="11" rx="5.5" fill="#7B89AB" fillOpacity="0.9" />
        <rect x="126" y="186" width="118" height="11" rx="5.5" fill="#97A3C4" />
        <rect x="126" y="210" width="84" height="11" rx="5.5" fill="#B8C2DE" />
        <rect x="126" y="242" width="102" height="44" rx="16" fill="#EFF4FF" />
        <rect x="138" y="258" width="18" height="14" rx="7" fill={config.mid} fillOpacity="0.22" />
        <rect x="164" y="250" width="18" height="22" rx="9" fill={config.start} fillOpacity="0.25" />
        <rect x="190" y="236" width="18" height="36" rx="9" fill={config.end} fillOpacity="0.28" />
        <path
          d="M138 283C149.943 267.12 161.234 258.086 171.873 255.899C182.513 253.711 194.555 257.078 208 266"
          stroke={config.start}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>

      <g filter={`url(#${softShadowId})`}>
        <rect x="296" y="108" width="122" height="118" rx="26" fill="white" fillOpacity="0.9" />
      </g>
      <rect x="296" y="108" width="122" height="118" rx="26" stroke="white" strokeOpacity="0.46" />
      <rect x="316" y="132" width="82" height="10" rx="5" fill="#7E8AB2" />
      <rect x="316" y="154" width="58" height="8" rx="4" fill="#B0BCD8" />
      <rect x="316" y="177" width="18" height="20" rx="9" fill={config.start} fillOpacity="0.26" />
      <rect x="342" y="166" width="18" height="31" rx="9" fill={config.mid} fillOpacity="0.28" />
      <rect x="368" y="145" width="18" height="52" rx="9" fill={config.end} fillOpacity="0.26" />
      <path
        d="M316 195C329.443 180.855 341.038 174.308 350.785 175.36C360.531 176.411 372.269 183.291 386 196"
        stroke={config.accent}
        strokeWidth="4"
        strokeLinecap="round"
      />

      <g transform="translate(296 252)">
        <rect width="78" height="34" rx="17" fill={`url(#${chipId})`} />
        <rect x="0.5" y="0.5" width="77" height="33" rx="16.5" stroke="white" strokeOpacity="0.34" />
        <text
          x="39"
          y="21"
          fill="#1C2747"
          fontSize="13"
          fontWeight="700"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
        >
          {config.badgeA}
        </text>
      </g>
      <g transform="translate(380 252)">
        <rect width="90" height="34" rx="17" fill={`url(#${chipId})`} />
        <rect x="0.5" y="0.5" width="89" height="33" rx="16.5" stroke="white" strokeOpacity="0.34" />
        <text
          x="45"
          y="21"
          fill="#1C2747"
          fontSize="13"
          fontWeight="700"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
        >
          {config.badgeB}
        </text>
      </g>
      <g transform="translate(330 298)">
        <rect width="96" height="34" rx="17" fill="rgba(255,255,255,0.2)" />
        <rect x="0.5" y="0.5" width="95" height="33" rx="16.5" stroke="white" strokeOpacity="0.34" />
        <text
          x="48"
          y="21"
          fill="white"
          fontSize="13"
          fontWeight="700"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
        >
          {config.badgeC}
        </text>
      </g>

      <g>
        <circle cx="422" cy="116" r="28" fill="white" fillOpacity="0.18" />
        <path
          d="M413 123L422 114C425 111 429.8 111 432.8 114C435.8 117 435.8 121.8 432.8 124.8L423.8 133.8C420.8 136.8 416 136.8 413 133.8C410 130.8 410 126 413 123Z"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M399.2 109.2L408.2 100.2C411.2 97.2 416 97.2 419 100.2C422 103.2 422 108 419 111L410 120C407 123 402.2 123 399.2 120C396.2 117 396.2 112.2 399.2 109.2Z"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      <text
        x="86"
        y="382"
        fill="white"
        fontSize="29"
        fontWeight="700"
        letterSpacing="-0.04em"
        fontFamily="system-ui, sans-serif"
      >
        {config.title}
      </text>
      <text
        x="86"
        y="404"
        fill="white"
        fillOpacity="0.76"
        fontSize="14"
        fontWeight="600"
        letterSpacing="0.16em"
        fontFamily="system-ui, sans-serif"
      >
        {config.subtitle.toUpperCase()}
      </text>
    </svg>
  );
}
