"use client";

export default function EmptyCoupons({ size = 160 }: { size?: number }) {
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
        d="M50 70 L150 70 Q155 70, 155 75 L155 90 Q150 95, 150 100 Q150 105, 155 110 L155 125 Q155 130, 150 130 L50 130 Q45 130, 45 125 L45 110 Q50 105, 50 100 Q50 95, 45 90 L45 75 Q45 70, 50 70 Z"
        fill="#FFFFFF"
        stroke="#0A0E13"
        strokeWidth="2.5"
      />
      <line
        x1="100"
        y1="75"
        x2="100"
        y2="125"
        stroke="#0A0E13"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <text
        x="73"
        y="105"
        textAnchor="middle"
        fontFamily="Fraunces, serif"
        fontSize="22"
        fontWeight="500"
        fill="#E84B1F"
      >
        -20%
      </text>
      <text
        x="127"
        y="103"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="11"
        fontWeight="700"
        fill="#0A0E13"
      >
        PROMO
      </text>
      <text
        x="127"
        y="115"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="8"
        fontWeight="500"
        fill="#6B6E76"
      >
        CODE
      </text>
      <path d="M40 50 L43 53 L40 56 L37 53 Z" fill="#E84B1F" />
      <path
        d="M165 145 L168 148 L165 151 L162 148 Z"
        fill="#E84B1F"
        opacity="0.6"
      />
    </svg>
  );
}
