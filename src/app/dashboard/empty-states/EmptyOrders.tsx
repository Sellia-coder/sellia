"use client";

export default function EmptyOrders({ size = 180 }: { size?: number }) {
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
      <rect
        x="55"
        y="80"
        width="90"
        height="80"
        rx="4"
        fill="#FFFFFF"
        stroke="#0A0E13"
        strokeWidth="2"
      />
      <path
        d="M48 80 L100 50 L152 80 Z"
        fill="#E84B1F"
        stroke="#0A0E13"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect
        x="55"
        y="80"
        width="90"
        height="14"
        fill="#FFEDD5"
        stroke="#0A0E13"
        strokeWidth="2"
      />
      <line x1="65" y1="80" x2="65" y2="94" stroke="#E84B1F" strokeWidth="2" />
      <line x1="75" y1="80" x2="75" y2="94" stroke="#E84B1F" strokeWidth="2" />
      <line x1="85" y1="80" x2="85" y2="94" stroke="#E84B1F" strokeWidth="2" />
      <line x1="95" y1="80" x2="95" y2="94" stroke="#E84B1F" strokeWidth="2" />
      <line x1="105" y1="80" x2="105" y2="94" stroke="#E84B1F" strokeWidth="2" />
      <line x1="115" y1="80" x2="115" y2="94" stroke="#E84B1F" strokeWidth="2" />
      <line x1="125" y1="80" x2="125" y2="94" stroke="#E84B1F" strokeWidth="2" />
      <line x1="135" y1="80" x2="135" y2="94" stroke="#E84B1F" strokeWidth="2" />
      <rect
        x="62"
        y="105"
        width="32"
        height="35"
        rx="2"
        fill="#F5F2EC"
        stroke="#0A0E13"
        strokeWidth="1.5"
      />
      <rect
        x="106"
        y="105"
        width="32"
        height="35"
        rx="2"
        fill="#F5F2EC"
        stroke="#0A0E13"
        strokeWidth="1.5"
      />
      <circle cx="78" cy="122" r="6" fill="#E84B1F" opacity="0.5" />
      <circle cx="122" cy="122" r="6" fill="#0A0E13" opacity="0.4" />
      <rect x="88" y="140" width="24" height="20" rx="1" fill="#0A0E13" />
      <circle cx="106" cy="151" r="1.5" fill="#E84B1F" />
      <rect
        x="115"
        y="62"
        width="28"
        height="14"
        rx="3"
        fill="#FFFFFF"
        stroke="#E84B1F"
        strokeWidth="1.5"
        transform="rotate(-8 129 69)"
      />
      <text
        x="129"
        y="73"
        textAnchor="middle"
        fontFamily="Manrope, sans-serif"
        fontSize="8"
        fill="#E84B1F"
        fontWeight="500"
        transform="rotate(-8 129 69)"
      >
        OUVERT
      </text>
      <path d="M40 60 L42 62 L40 64 L38 62 Z" fill="#E84B1F" opacity="0.6" />
      <path d="M165 70 L167 72 L165 74 L163 72 Z" fill="#E84B1F" opacity="0.6" />
      <path d="M30 130 L32 132 L30 134 L28 132 Z" fill="#0A0E13" opacity="0.3" />
    </svg>
  );
}
