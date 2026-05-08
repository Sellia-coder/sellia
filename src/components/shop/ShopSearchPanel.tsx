"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function ShopSearchPanel({
  slug,
  initialQuery,
}: {
  slug: string;
  initialQuery: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/shop/${slug}/recherche?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="shop-search-form">
      <Search size={18} strokeWidth={2} className="shop-search-icon" aria-hidden />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="shop-input shop-search-input"
        placeholder="Rechercher un produit…"
        aria-label="Rechercher un produit"
      />
      <button type="submit" className="shop-btn shop-btn-primary">
        Rechercher
      </button>
    </form>
  );
}
