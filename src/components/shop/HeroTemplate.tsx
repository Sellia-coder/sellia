export type HeroTemplateName =
  | "jewelry"
  | "tech"
  | "beauty"
  | "food"
  | "home"
  | "universal";

interface TemplateConfig {
  name: string;
  description: string;
  gradient: string;
  pattern?: string;
  textColor: string;
  badgeColor: string;
}

export const HERO_TEMPLATES: Record<HeroTemplateName, TemplateConfig> = {
  jewelry: {
    name: "Bijoux & Mode",
    description: "Élégant, doré, raffiné",
    gradient:
      "linear-gradient(135deg, #C9A66B 0%, #8B6839 50%, #5A4225 100%)",
    pattern:
      "radial-gradient(circle at 80% 20%, rgba(255, 215, 130, 0.3) 0%, transparent 50%)",
    textColor: "#FFFFFF",
    badgeColor: "rgba(255, 255, 255, 0.15)",
  },
  tech: {
    name: "Tech & Électronique",
    description: "Moderne, futuriste, technologique",
    gradient:
      "linear-gradient(135deg, #1E3A8A 0%, #0F172A 60%, #020617 100%)",
    pattern:
      "radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.25) 0%, transparent 60%)",
    textColor: "#FFFFFF",
    badgeColor: "rgba(255, 255, 255, 0.1)",
  },
  beauty: {
    name: "Beauté & Cosmétique",
    description: "Doux, féminin, raffiné",
    gradient:
      "linear-gradient(135deg, #F4C2C2 0%, #E89BA5 50%, #C77785 100%)",
    pattern:
      "radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.25) 0%, transparent 60%)",
    textColor: "#FFFFFF",
    badgeColor: "rgba(255, 255, 255, 0.2)",
  },
  food: {
    name: "Food & Restauration",
    description: "Chaleureux, appétissant",
    gradient:
      "linear-gradient(135deg, #EA580C 0%, #C2410C 50%, #7C2D12 100%)",
    pattern:
      "radial-gradient(circle at 75% 25%, rgba(254, 215, 170, 0.3) 0%, transparent 55%)",
    textColor: "#FFFFFF",
    badgeColor: "rgba(255, 255, 255, 0.15)",
  },
  home: {
    name: "Maison & Déco",
    description: "Chaleureux, naturel, terreux",
    gradient:
      "linear-gradient(135deg, #B45309 0%, #92400E 50%, #78350F 100%)",
    pattern:
      "radial-gradient(circle at 20% 80%, rgba(254, 240, 138, 0.2) 0%, transparent 55%)",
    textColor: "#FFFFFF",
    badgeColor: "rgba(255, 255, 255, 0.15)",
  },
  universal: {
    name: "Universel",
    description: "Sombre, élégant, neutre",
    gradient:
      "linear-gradient(135deg, #1F2937 0%, #111827 50%, #0A0E13 100%)",
    pattern:
      "radial-gradient(circle at 70% 30%, rgba(232, 75, 31, 0.2) 0%, transparent 60%)",
    textColor: "#FFFFFF",
    badgeColor: "rgba(255, 255, 255, 0.12)",
  },
};

interface HeroBackgroundProps {
  template?: HeroTemplateName | string | null;
  customImageUrl?: string | null;
  primaryColor?: string;
}

function darkenHex(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  if (Number.isNaN(num)) return hex;
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0xff) - amt);
  const B = Math.max(0, (num & 0xff) - amt);
  return `#${((R << 16) | (G << 8) | B).toString(16).padStart(6, "0")}`;
}

function isHeroTemplateName(v: string): v is HeroTemplateName {
  return v in HERO_TEMPLATES;
}

/** Background CSS pour la section hero (image custom > template > couleur primaire). */
export function getHeroBackground({
  template,
  customImageUrl,
  primaryColor,
}: HeroBackgroundProps): string {
  if (customImageUrl) {
    return `linear-gradient(135deg, rgba(10,14,19,0.55) 0%, rgba(10,14,19,0.25) 100%), url(${customImageUrl}) center/cover no-repeat`;
  }

  if (template && isHeroTemplateName(template)) {
    const t = HERO_TEMPLATES[template];
    return t.pattern ? `${t.pattern}, ${t.gradient}` : t.gradient;
  }

  if (primaryColor) {
    const dark = darkenHex(primaryColor, 30);
    return `linear-gradient(135deg, ${primaryColor} 0%, ${dark} 100%)`;
  }

  return HERO_TEMPLATES.universal.gradient;
}
