import React, { useId } from "react";

export function BrandSymbol({
  size = 48,
  className = "",
  detailed = false,
}: {
  size?: number;
  className?: string;
  detailed?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const bgId = `od-bg-${uid}`;
  const pageId = `od-page-${uid}`;
  const linkId = `od-link-${uid}`;
  const shadowId = `od-shadow-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={bgId} x1="14" y1="12" x2="78" y2="84" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6E7CFF" />
          <stop offset="0.5" stopColor="#17B897" />
          <stop offset="1" stopColor="#FF8E3D" />
        </linearGradient>
        <linearGradient id={pageId} x1="28" y1="18" x2="67" y2="69" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#EEF3FF" />
        </linearGradient>
        <linearGradient id={linkId} x1="56" y1="47" x2="76" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD056" />
          <stop offset="1" stopColor="#FF6B57" />
        </linearGradient>
        <filter id={shadowId} x="6" y="8" width="84" height="84" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#5D68D6" floodOpacity="0.28" />
        </filter>
      </defs>

      <g filter={`url(#${shadowId})`}>
        <rect x="14" y="12" width="68" height="68" rx="22" fill={`url(#${bgId})`} />
      </g>

      <path
        d="M31 24C31 21.7909 32.7909 20 35 20H55.5L65 29.5V57C65 59.2091 63.2091 61 61 61H35C32.7909 61 31 59.2091 31 57V24Z"
        fill={`url(#${pageId})`}
      />
      <path d="M55 20V27.5C55 29.7091 56.7909 31.5 59 31.5H65" fill="#D9E5FF" />
      <path
        d="M55 20V27.5C55 29.7091 56.7909 31.5 59 31.5H65"
        stroke="#D2DCFF"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      <path d="M39 35H57" stroke="#7180B9" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M39 43H57" stroke="#8A97C7" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M39 51H51" stroke="#A2ADD8" strokeWidth="3.2" strokeLinecap="round" />

      <rect
        x="53"
        y="45"
        width="24"
        height="24"
        rx="12"
        fill="#FFFFFF"
        fillOpacity="0.22"
        stroke="rgba(255,255,255,0.42)"
      />
      <path
        d="M60.2 58.4L64.1 54.5C65.4 53.2 67.5 53.2 68.8 54.5C70.1 55.8 70.1 57.9 68.8 59.2L64.9 63.1C63.6 64.4 61.5 64.4 60.2 63.1C58.9 61.8 58.9 59.7 60.2 58.4Z"
        stroke={`url(#${linkId})`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M53.7 51.9L57.6 48C58.9 46.7 61 46.7 62.3 48C63.6 49.3 63.6 51.4 62.3 52.7L58.4 56.6C57.1 57.9 55 57.9 53.7 56.6C52.4 55.3 52.4 53.2 53.7 51.9Z"
        stroke={`url(#${linkId})`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M70 25L71.8 29.2L76 31L71.8 32.8L70 37L68.2 32.8L64 31L68.2 29.2L70 25Z"
        fill="#FFF1A9"
      />

      {detailed ? (
        <circle cx="77.5" cy="70.5" r="4.5" fill="#FFCF59" fillOpacity="0.9" />
      ) : null}
    </svg>
  );
}
