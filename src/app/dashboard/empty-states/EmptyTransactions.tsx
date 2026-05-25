"use client";

export default function EmptyTransactions({ size = 180 }: { size?: number }) {
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
      <rect x="50" y="70" width="100" height="90" rx="6" fill="#0A0E13" />
      <rect
        x="58"
        y="78"
        width="84"
        height="74"
        rx="3"
        fill="#1A1F26"
        stroke="#E84B1F"
        strokeWidth="1.5"
      />
      <circle
        cx="100"
        cy="115"
        r="22"
        fill="#0A0E13"
        stroke="#E84B1F"
        strokeWidth="2.5"
      />
      <circle
        cx="100"
        cy="115"
        r="12"
        fill="none"
        stroke="#E84B1F"
        strokeWidth="1"
        opacity="0.5"
      />
      <line
        x1="100"
        y1="115"
        x2="113"
        y2="108"
        stroke="#E84B1F"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="100" cy="115" r="2.5" fill="#E84B1F" />
      <line x1="100" y1="95" x2="100" y2="98" stroke="#E84B1F" strokeWidth="1.5" />
      <line x1="100" y1="132" x2="100" y2="135" stroke="#E84B1F" strokeWidth="1.5" />
      <line x1="80" y1="115" x2="83" y2="115" stroke="#E84B1F" strokeWidth="1.5" />
      <line x1="117" y1="115" x2="120" y2="115" stroke="#E84B1F" strokeWidth="1.5" />
      <rect x="48" y="85" width="6" height="6" rx="1" fill="#E84B1F" />
      <rect x="48" y="140" width="6" height="6" rx="1" fill="#E84B1F" />
      <circle cx="60" cy="50" r="8" fill="#FCD34D" stroke="#92400E" strokeWidth="1" />
      <text
        x="60"
        y="54"
        textAnchor="middle"
        fontSize="9"
        fontFamily="Fraunces, serif"
        fontWeight="600"
        fill="#92400E"
      >
        $
      </text>
      <circle cx="140" cy="40" r="10" fill="#FCD34D" stroke="#92400E" strokeWidth="1" />
      <text
        x="140"
        y="45"
        textAnchor="middle"
        fontSize="10"
        fontFamily="Fraunces, serif"
        fontWeight="600"
        fill="#92400E"
      >
        $
      </text>
      <circle
        cx="155"
        cy="65"
        r="7"
        fill="#FCD34D"
        stroke="#92400E"
        strokeWidth="1"
        opacity="0.7"
      />
      <path d="M35 95 L37 97 L35 99 L33 97 Z" fill="#E84B1F" opacity="0.6" />
      <path d="M170 110 L172 112 L170 114 L168 112 Z" fill="#E84B1F" opacity="0.6" />
    </svg>
  );
}
