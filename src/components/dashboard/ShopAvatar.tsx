"use client";

interface Props {
  shopName?: string;
  size?: number;
  className?: string;
}

/**
 * Sac shopping line-art minimaliste — icône universelle Sellia.
 */
export default function ShopAvatar({ size = 40, className = "" }: Props) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
        background: "var(--sellia-ivory, #FAFAF7)",
        border: "1px solid var(--sellia-border, #ECE9E2)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: "var(--sellia-ink, #0A0E13)",
      }}
    >
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M8 8 V6.5 A3.5 3.5 0 0 1 11.5 3 H12.5 A3.5 3.5 0 0 1 16 6.5 V8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M6 8 L18 8 L19 20 A1 1 0 0 1 18 21 L6 21 A1 1 0 0 1 5 20 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="9" cy="13" r="1" fill="var(--sellia-ember, #E84B1F)" />
      </svg>
    </div>
  );
}
