"use client";

import type { JSX } from "react";

export type ShopCategory = "mode" | "beaute" | "alimentation" | "tech" | "artisanat" | "formation" | "default";

interface Props {
  category: ShopCategory;
}

export default function ShopHeroPattern({ category }: Props) {
  const stroke = "rgba(14, 17, 22, 0.07)";
  const sw = 1.4;

  const ICONS_BY_CATEGORY: Record<string, JSX.Element[]> = {
    mode: [
      <path key="dress" d="M-5 0 L0 -8 L5 0 L4 12 L-4 12 Z" stroke={stroke} strokeWidth={sw} fill="none" strokeLinejoin="round" />,
      <g key="hanger" stroke={stroke} strokeWidth={sw} fill="none">
        <path d="M-7 4 L0 -4 L7 4 M-7 4 L7 4" strokeLinecap="round" />
        <circle cx="0" cy="-6" r="1.5" />
      </g>,
      <g key="bag" stroke={stroke} strokeWidth={sw} fill="none">
        <rect x="-5" y="-3" width="10" height="9" rx="1" />
        <path d="M-3 -3 Q-3 -7 0 -7 Q3 -7 3 -3" strokeLinecap="round" />
      </g>,
      <g key="heel" stroke={stroke} strokeWidth={sw} fill="none">
        <path d="M-6 4 L4 4 L6 0 Q6 -3 3 -3 L-6 -3 Z" strokeLinejoin="round" />
        <line x1="4" y1="4" x2="6" y2="10" strokeLinecap="round" />
      </g>,
      <polygon key="star" points="0,-7 2,-2 7,-2 3,1 5,6 0,3 -5,6 -3,1 -7,-2 -2,-2" stroke={stroke} strokeWidth={sw} fill="none" strokeLinejoin="round" />,
      <path key="heart" d="M0 6 C-7 0 -5 -7 0 -3 C5 -7 7 0 0 6 Z" stroke={stroke} strokeWidth={sw} fill="none" strokeLinejoin="round" />,
    ],
    beaute: [
      <g key="flower" stroke={stroke} strokeWidth={sw} fill="none">
        <circle cx="0" cy="-4" r="2.5" />
        <circle cx="4" cy="0" r="2.5" />
        <circle cx="0" cy="4" r="2.5" />
        <circle cx="-4" cy="0" r="2.5" />
        <circle cx="0" cy="0" r="1.5" />
      </g>,
      <g key="petals" stroke={stroke} strokeWidth={sw} fill="none">
        <ellipse cx="0" cy="-3" rx="2" ry="4" />
        <ellipse cx="3" cy="1" rx="4" ry="2" />
        <ellipse cx="-3" cy="1" rx="4" ry="2" />
      </g>,
      <g key="lipstick" stroke={stroke} strokeWidth={sw} fill="none">
        <rect x="-2" y="-3" width="4" height="9" />
        <path d="M-2 -3 L0 -7 L2 -3" strokeLinejoin="round" />
      </g>,
      <g key="bottle" stroke={stroke} strokeWidth={sw} fill="none">
        <rect x="-3" y="-2" width="6" height="8" rx="1" />
        <rect x="-2" y="-5" width="4" height="3" />
      </g>,
      <g key="lavender" stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round">
        <line x1="0" y1="-7" x2="0" y2="7" />
        <line x1="0" y1="-4" x2="-3" y2="-6" />
        <line x1="0" y1="-4" x2="3" y2="-6" />
        <line x1="0" y1="0" x2="-3" y2="-2" />
        <line x1="0" y1="0" x2="3" y2="-2" />
        <line x1="0" y1="4" x2="-3" y2="2" />
        <line x1="0" y1="4" x2="3" y2="2" />
      </g>,
      <polygon key="sparkle" points="0,-6 1.5,-1.5 6,0 1.5,1.5 0,6 -1.5,1.5 -6,0 -1.5,-1.5" stroke={stroke} strokeWidth={sw} fill="none" strokeLinejoin="round" />,
    ],
    alimentation: [
      <g key="cup" stroke={stroke} strokeWidth={sw} fill="none">
        <path d="M-4 -3 L-4 4 Q-4 6 -2 6 L2 6 Q4 6 4 4 L4 -3 Z" strokeLinejoin="round" />
        <path d="M4 -1 L6 -1 Q7 -1 7 0 L7 2 Q7 3 6 3 L4 3" />
      </g>,
      <path key="croissant" d="M-6 0 Q-6 -6 0 -6 Q6 -6 6 0 Q3 -3 0 -3 Q-3 -3 -6 0 Z" stroke={stroke} strokeWidth={sw} fill="none" strokeLinejoin="round" />,
      <g key="spoon" stroke={stroke} strokeWidth={sw} fill="none">
        <ellipse cx="0" cy="-4" rx="3" ry="4" />
        <line x1="0" y1="0" x2="0" y2="7" strokeLinecap="round" />
      </g>,
      <g key="food-bottle" stroke={stroke} strokeWidth={sw} fill="none">
        <path d="M-2 -7 L-2 -3 Q-2 -2 -3 -1 L-3 5 Q-3 6 -2 6 L2 6 Q3 6 3 5 L3 -1 Q2 -2 2 -3 L2 -7 Z" strokeLinejoin="round" />
      </g>,
      <polygon key="food-star" points="0,-6 1.5,-1.5 6,0 1.5,1.5 0,6 -1.5,1.5 -6,0 -1.5,-1.5" stroke={stroke} strokeWidth={sw} fill="none" strokeLinejoin="round" />,
      <g key="cherry" stroke={stroke} strokeWidth={sw} fill="none">
        <circle cx="-2" cy="4" r="2.5" />
        <circle cx="3" cy="4" r="2.5" />
        <path d="M-2 4 Q-2 -4 0 -6 Q2 -4 3 4" strokeLinecap="round" />
      </g>,
    ],
    tech: [
      <rect key="phone" x="-3" y="-6" width="6" height="12" rx="1.2" stroke={stroke} strokeWidth={sw} fill="none" />,
      <g key="laptop" stroke={stroke} strokeWidth={sw} fill="none">
        <rect x="-5" y="-4" width="10" height="6" rx="0.5" />
        <line x1="-7" y1="3" x2="7" y2="3" strokeLinecap="round" />
      </g>,
      <g key="pixels" stroke={stroke} strokeWidth={sw} fill="none">
        <rect x="-5" y="-5" width="3" height="3" />
        <rect x="2" y="-5" width="3" height="3" />
        <rect x="-5" y="2" width="3" height="3" />
        <rect x="2" y="2" width="3" height="3" />
      </g>,
      <g key="code" stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="-5,-4 -8,0 -5,4" />
        <polyline points="5,-4 8,0 5,4" />
        <line x1="-1" y1="-5" x2="1" y2="5" />
      </g>,
      <g key="wifi" stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round">
        <path d="M-6 -2 Q0 -7 6 -2" />
        <path d="M-4 1 Q0 -2 4 1" />
        <circle cx="0" cy="4" r="0.8" fill={stroke} stroke="none" />
      </g>,
      <polygon key="tech-star" points="0,-5 1.5,-1.5 5,0 1.5,1.5 0,5 -1.5,1.5 -5,0 -1.5,-1.5" stroke={stroke} strokeWidth={sw} fill="none" strokeLinejoin="round" />,
    ],
    formation: [
      <g key="book" stroke={stroke} strokeWidth={sw} fill="none">
        <path d="M-6 -5 Q-6 -6 -5 -6 L-1 -6 Q0 -6 0 -5 L0 6 Q0 7 -1 7 L-5 7 Q-6 7 -6 6 Z" strokeLinejoin="round" />
        <path d="M6 -5 Q6 -6 5 -6 L1 -6 Q0 -6 0 -5 L0 6 Q0 7 1 7 L5 7 Q6 7 6 6 Z" strokeLinejoin="round" />
      </g>,
      <g key="cap" stroke={stroke} strokeWidth={sw} fill="none">
        <polygon points="0,-5 7,-1 0,3 -7,-1" strokeLinejoin="round" />
        <path d="M-4 0 L-4 4 Q-4 6 0 6 Q4 6 4 4 L4 0" strokeLinejoin="round" />
      </g>,
      <g key="bulb" stroke={stroke} strokeWidth={sw} fill="none">
        <path d="M-4 -2 Q-4 -7 0 -7 Q4 -7 4 -2 Q4 1 2 3 L2 5 L-2 5 L-2 3 Q-4 1 -4 -2 Z" strokeLinejoin="round" />
        <line x1="-2" y1="6" x2="2" y2="6" strokeLinecap="round" />
      </g>,
      <polygon key="play" points="-3,-5 -3,5 5,0" stroke={stroke} strokeWidth={sw} fill="none" strokeLinejoin="round" />,
      <g key="pencil" stroke={stroke} strokeWidth={sw} fill="none" strokeLinejoin="round">
        <path d="M-6 5 L-6 7 L-4 7 L6 -3 L4 -5 Z" />
      </g>,
      <polygon key="form-star" points="0,-5 1.5,-1.5 5,0 1.5,1.5 0,5 -1.5,1.5 -5,0 -1.5,-1.5" stroke={stroke} strokeWidth={sw} fill="none" strokeLinejoin="round" />,
    ],
    artisanat: [
      <g key="needle" stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round">
        <line x1="-7" y1="-6" x2="7" y2="6" />
        <ellipse cx="-6" cy="-5" rx="1.5" ry="0.8" />
      </g>,
      <g key="button" stroke={stroke} strokeWidth={sw} fill="none">
        <circle cx="0" cy="0" r="5" />
        <circle cx="-1.5" cy="-1.5" r="0.5" fill={stroke} stroke="none" />
        <circle cx="1.5" cy="-1.5" r="0.5" fill={stroke} stroke="none" />
        <circle cx="-1.5" cy="1.5" r="0.5" fill={stroke} stroke="none" />
        <circle cx="1.5" cy="1.5" r="0.5" fill={stroke} stroke="none" />
      </g>,
      <g key="scissors" stroke={stroke} strokeWidth={sw} fill="none">
        <circle cx="-4" cy="-3" r="2" />
        <circle cx="-4" cy="3" r="2" />
        <line x1="-2" y1="-2" x2="6" y2="2" strokeLinecap="round" />
        <line x1="-2" y1="2" x2="6" y2="-2" strokeLinecap="round" />
      </g>,
      <g key="thread" stroke={stroke} strokeWidth={sw} fill="none">
        <rect x="-3" y="-5" width="6" height="10" rx="1" />
        <line x1="-3" y1="-2" x2="3" y2="-2" strokeLinecap="round" />
        <line x1="-3" y1="2" x2="3" y2="2" strokeLinecap="round" />
      </g>,
      <polygon key="craft-star" points="0,-5 1.5,-1.5 5,0 1.5,1.5 0,5 -1.5,1.5 -5,0 -1.5,-1.5" stroke={stroke} strokeWidth={sw} fill="none" strokeLinejoin="round" />,
      <g key="yarn" stroke={stroke} strokeWidth={sw} fill="none">
        <circle cx="0" cy="0" r="5" />
        <path d="M-4 -3 Q0 -2 4 -3 M-4 0 Q0 1 4 0 M-4 3 Q0 4 4 3" />
      </g>,
    ],
    default: [
      <polygon key="s1" points="0,-6 1.5,-1.5 6,0 1.5,1.5 0,6 -1.5,1.5 -6,0 -1.5,-1.5" stroke={stroke} strokeWidth={sw} fill="none" strokeLinejoin="round" />,
      <circle key="c1" cx="0" cy="0" r="5" stroke={stroke} strokeWidth={sw} fill="none" />,
      <polygon key="d1" points="0,-6 5,0 0,6 -5,0" stroke={stroke} strokeWidth={sw} fill="none" strokeLinejoin="round" />,
      <g key="p1" stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round">
        <line x1="-5" y1="0" x2="5" y2="0" />
        <line x1="0" y1="-5" x2="0" y2="5" />
      </g>,
      <path key="w1" d="M-7 0 Q-3 -4 0 0 Q3 4 7 0" stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round" />,
      <polygon key="t1" points="0,-6 6,4 -6,4" stroke={stroke} strokeWidth={sw} fill="none" strokeLinejoin="round" />,
    ],
  };

  const icons = ICONS_BY_CATEGORY[category] ?? ICONS_BY_CATEGORY.default;

  const POSITIONS: Array<[number, number, number, number]> = [
    [80, 60, 1, 15],
    [180, 110, 1.1, -10],
    [320, 75, 0.9, 25],
    [480, 130, 1, -20],
    [640, 85, 1.1, 5],
    [780, 140, 0.95, 30],
    [920, 65, 1, -15],
    [50, 240, 1, 45],
    [110, 380, 1.1, -25],
    [70, 520, 0.9, 10],
    [130, 660, 1, -40],
    [60, 800, 1.05, 20],
    [950, 240, 1, -45],
    [890, 380, 1.1, 25],
    [930, 520, 0.95, -10],
    [870, 660, 1, 40],
    [940, 800, 1.05, -20],
    [120, 880, 1, 20],
    [280, 920, 0.9, -30],
    [440, 880, 1.1, 10],
    [600, 920, 1, -15],
    [760, 880, 0.95, 25],
    [880, 920, 1, -5],
  ];

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        pointerEvents: "none",
      }}
    >
      {POSITIONS.map(([x, y, scale, rotation], i) => (
        <g
          key={i}
          transform={`translate(${x} ${y}) scale(${scale}) rotate(${rotation})`}
        >
          {icons[i % icons.length]}
        </g>
      ))}
    </svg>
  );
}
