"use client";

export default function EmptyLoyalty({ size = 160 }: { size?: number }) {
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
        d="M75 30 L75 100 L100 80 L125 100 L125 30 Z"
        fill="#E84B1F"
        stroke="#0A0E13"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle
        cx="100"
        cy="125"
        r="38"
        fill="#FCD34D"
        stroke="#0A0E13"
        strokeWidth="3"
      />
      <circle
        cx="100"
        cy="125"
        r="28"
        fill="none"
        stroke="#92400E"
        strokeWidth="1.5"
        strokeDasharray="2 2"
      />
      <path
        d="M100 110 L104 121 L116 121 L106 128 L110 139 L100 132 L90 139 L94 128 L84 121 L96 121 Z"
        fill="#92400E"
      />
      <path d="M50 60 L53 63 L50 66 L47 63 Z" fill="#E84B1F" />
      <path
        d="M155 145 L158 148 L155 151 L152 148 Z"
        fill="#E84B1F"
        opacity="0.6"
      />
    </svg>
  );
}
