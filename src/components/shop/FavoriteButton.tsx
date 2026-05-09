"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { isFavorite, toggleFavorite } from "@/lib/cart";

interface Props {
  shopSlug: string;
  productId: string;
  variant?: "card" | "detail";
}

export default function FavoriteButton({
  shopSlug,
  productId,
  variant = "card",
}: Props) {
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setActive(isFavorite(shopSlug, productId));
  }, [shopSlug, productId]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleFavorite(shopSlug, productId);
    setActive(next);
  };

  if (!mounted) return null;

  return (
    <button
      type="button"
      className={`shop-fav-btn shop-fav-btn-${variant} ${active ? "is-active" : ""}`}
      onClick={handleClick}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={active}
    >
      <Heart
        size={variant === "detail" ? 18 : 14}
        strokeWidth={2}
        fill={active ? "currentColor" : "none"}
      />
    </button>
  );
}
