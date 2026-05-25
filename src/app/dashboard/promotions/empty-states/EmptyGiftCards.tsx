"use client";

export default function EmptyGiftCards({ size = 160 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden
    >
      <circle cx="100" cy="100" r="90" fill="#FAFAF7" />
      <rect
        x="55"
        y="85"
        width="90"
        height="65"
        rx="4"
        fill="#FFFFFF"
        stroke="#0A0E13"
        strokeWidth="2.5"
      />
      <rect x="92" y="85" width="16" height="65" fill="#E84B1F" />
      <rect x="55" y="105" width="90" height="14" fill="#E84B1F" />
      <rect
        x="50"
        y="75"
        width="100"
        height="14"
        rx="3"
        fill="#FFFFFF"
        stroke="#0A0E13"
        strokeWidth="2.5"
      />
      <rect x="92" y="75" width="16" height="14" fill="#E84B1F" />
      <ellipse
        cx="83"
        cy="68"
        rx="11"
        ry="9"
        fill="#E84B1F"
        stroke="#0A0E13"
        strokeWidth="2"
      />
      <ellipse
        cx="117"
        cy="68"
        rx="11"
        ry="9"
        fill="#E84B1F"
        stroke="#0A0E13"
        strokeWidth="2"
      />
      <circle cx="100" cy="68" r="5" fill="#0A0E13" />
      <path d="M40 50 L43 53 L40 56 L37 53 Z" fill="#E84B1F" />
      <path
        d="M165 95 L168 98 L165 101 L162 98 Z"
        fill="#0A0E13"
        opacity="0.4"
      />
    </svg>
  );
}
