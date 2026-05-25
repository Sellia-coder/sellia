"use client";

export default function EmptyCustomers({ size = 180 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="100" cy="100" r="90" fill="#FAFAF7" />
      <line
        x1="70"
        y1="105"
        x2="100"
        y2="65"
        stroke="#E84B1F"
        strokeWidth="1.5"
        strokeDasharray="3 3"
        opacity="0.5"
      />
      <line
        x1="100"
        y1="65"
        x2="130"
        y2="105"
        stroke="#E84B1F"
        strokeWidth="1.5"
        strokeDasharray="3 3"
        opacity="0.5"
      />
      <line
        x1="70"
        y1="105"
        x2="130"
        y2="105"
        stroke="#E84B1F"
        strokeWidth="1.5"
        strokeDasharray="3 3"
        opacity="0.5"
      />
      <circle cx="100" cy="65" r="22" fill="#FFFFFF" stroke="#0A0E13" strokeWidth="2" />
      <circle cx="100" cy="58" r="7" fill="#E84B1F" />
      <path
        d="M86 75 Q100 70, 114 75 L114 82 Q100 85, 86 82 Z"
        fill="#0A0E13"
      />
      <circle cx="70" cy="105" r="22" fill="#FFFFFF" stroke="#0A0E13" strokeWidth="2" />
      <circle cx="70" cy="98" r="7" fill="#0A0E13" />
      <path
        d="M56 115 Q70 110, 84 115 L84 122 Q70 125, 56 122 Z"
        fill="#E84B1F"
      />
      <circle cx="130" cy="105" r="22" fill="#FFFFFF" stroke="#0A0E13" strokeWidth="2" />
      <circle cx="130" cy="98" r="7" fill="#0A0E13" />
      <path
        d="M116 115 Q130 110, 144 115 L144 122 Q130 125, 116 122 Z"
        fill="#E84B1F"
      />
      <circle cx="100" cy="155" r="22" fill="#FFFFFF" stroke="#0A0E13" strokeWidth="2" />
      <circle cx="100" cy="148" r="7" fill="#E84B1F" />
      <path
        d="M86 165 Q100 160, 114 165 L114 172 Q100 175, 86 172 Z"
        fill="#0A0E13"
      />
      <circle cx="42" cy="70" r="2" fill="#E84B1F" opacity="0.7" />
      <circle cx="158" cy="70" r="2" fill="#E84B1F" opacity="0.7" />
      <circle cx="42" cy="140" r="2" fill="#0A0E13" opacity="0.4" />
      <circle cx="158" cy="140" r="2" fill="#0A0E13" opacity="0.4" />
    </svg>
  );
}
