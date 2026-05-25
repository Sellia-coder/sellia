"use client";

export default function EmptyFlash({ size = 160 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden
    >
      <circle cx="100" cy="100" r="90" fill="#FAFAF7" />
      <path
        d="M115 40 L75 105 L100 105 L85 160 L130 95 L100 95 Z"
        fill="#FCD34D"
        stroke="#0A0E13"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <line
        x1="50"
        y1="60"
        x2="60"
        y2="65"
        stroke="#E84B1F"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="150"
        y1="60"
        x2="140"
        y2="65"
        stroke="#E84B1F"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="40"
        y1="100"
        x2="55"
        y2="100"
        stroke="#E84B1F"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="160"
        y1="100"
        x2="145"
        y2="100"
        stroke="#E84B1F"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
