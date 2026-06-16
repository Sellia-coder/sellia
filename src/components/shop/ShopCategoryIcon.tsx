import {
  Storefront,
  TShirt,
  CookingPot,
  PaintBrush,
  Sparkle,
  House,
  Devices,
  BookOpen,
  Plant,
  Heart,
  Camera,
  MusicNotes,
  Basketball,
  GameController,
  type Icon,
} from "@phosphor-icons/react";

/** Icône catégorie boutique — source unique (aperçu, inscription, etc.). */
export function getShopCategoryIcon(category?: string): Icon {
  if (!category) return Storefront;
  const c = category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (/\b(mode|fashion|vetement|pret-a-porter)\b/.test(c)) return TShirt;
  if (/\b(food|restaurant|cuisine|aliment|gastro|epicerie)\b/.test(c)) return CookingPot;
  if (/\b(beaut|cosmet|skincare|soin|maquillage)\b/.test(c)) return PaintBrush;
  if (/\b(jewelry|bijou|luxe|luxury)\b/.test(c)) return Sparkle;
  if (/\b(home|decoration|deco|maison)\b/.test(c)) return House;
  if (/\b(tech|electronique|digital|gsm|smartphone)\b/.test(c)) return Devices;
  if (/\b(book|livre|papeterie)\b/.test(c)) return BookOpen;
  if (/\b(bio|organic|naturel|plant)\b/.test(c)) return Plant;
  if (/\b(wellness|sante|health|santé)\b/.test(c)) return Heart;
  if (/\b(art|photo|camera)\b/.test(c)) return Camera;
  if (/\b(music|musique)\b/.test(c)) return MusicNotes;
  if (/\b(sport|fitness)\b/.test(c)) return Basketball;
  if (/\b(game|gaming|loisir|jeux)\b/.test(c)) return GameController;
  return Storefront;
}

interface Props {
  category?: string;
  size?: number;
  boxSize?: number;
  accentColor?: string;
}

export default function ShopCategoryIcon({
  category,
  size = 28,
  boxSize = 48,
  accentColor = "#E84B1F",
}: Props) {
  const IconComponent = getShopCategoryIcon(category);
  return (
    <div
      style={{
        width: boxSize,
        height: boxSize,
        borderRadius: boxSize >= 48 ? 12 : 10,
        background:
          "linear-gradient(135deg, rgba(232, 75, 31, 0.12), rgba(232, 75, 31, 0.04))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: accentColor,
        flexShrink: 0,
      }}
      aria-hidden
    >
      <IconComponent size={size} weight="duotone" />
    </div>
  );
}
