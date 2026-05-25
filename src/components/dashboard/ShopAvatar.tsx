"use client";

interface Props {
  shopName: string;
  size?: number;
  className?: string;
}

export default function ShopAvatar({
  shopName,
  size = 40,
  className = "",
}: Props) {
  const hash = shopName.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const variant = hash % 4;

  const fg = "#FFFFFF";
  const bg = "#0A0E13";
  const accent = "#E84B1F";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={shopName}
    >
      <rect width="40" height="40" rx="10" fill={bg} />

      {variant === 0 && (
        <>
          <path d="M10 18 L20 10 L30 18 Z" fill={accent} />
          <rect x="12" y="18" width="16" height="12" fill={fg} rx="1" />
          <rect x="18" y="22" width="4" height="8" fill={bg} />
        </>
      )}

      {variant === 1 && (
        <>
          <circle cx="20" cy="13" r="3" fill={accent} />
          <circle cx="14" cy="24" r="3" fill={fg} />
          <circle cx="26" cy="24" r="3" fill={fg} />
          <path
            d="M20 13 L14 24 L26 24 Z"
            stroke={fg}
            strokeOpacity="0.3"
            strokeWidth="0.5"
            fill="none"
          />
        </>
      )}

      {variant === 2 && (
        <>
          <path
            d="M14 14 Q14 12, 16 12 L24 12 Q26 12, 26 14 Q26 16, 24 16 L16 16 Q14 16, 14 18 Q14 20, 16 20 L24 20 Q26 20, 26 22 Q26 24, 24 24 L16 24 Q14 24, 14 26 Q14 28, 16 28 L24 28 Q26 28, 26 26"
            stroke={fg}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="30" cy="13" r="2" fill={accent} />
        </>
      )}

      {variant === 3 && (
        <>
          <rect x="10" y="10" width="14" height="14" rx="2" fill={accent} />
          <rect x="16" y="16" width="14" height="14" rx="2" fill={fg} />
        </>
      )}
    </svg>
  );
}
