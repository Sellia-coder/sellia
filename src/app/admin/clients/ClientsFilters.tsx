"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ClientsFilters({
  shops,
  initialShop,
  initialQ,
  sort,
}: {
  shops: { id: string; name: string }[];
  initialShop: string;
  initialQ: string;
  sort: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);

  const push = (opts: { shop?: string; sort?: string }) => {
    const params = new URLSearchParams();
    const shop = opts.shop ?? initialShop;
    const s = opts.sort ?? sort;
    if (shop) params.set("shop", shop);
    if (q.trim()) params.set("q", q.trim());
    if (s) params.set("sort", s);
    router.push(`/admin/clients?${params.toString()}`);
  };

  return (
    <form
      className="admin-toolbar"
      onSubmit={(e) => {
        e.preventDefault();
        push({});
      }}
    >
      <select
        className="admin-search"
        style={{ maxWidth: 200, flex: "none" }}
        value={initialShop}
        onChange={(e) => push({ shop: e.target.value })}
      >
        <option value="">Toutes les boutiques</option>
        {shops.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <input
        type="search"
        className="admin-search"
        placeholder="Nom, téléphone, email…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <select
        className="admin-btn"
        value={sort}
        onChange={(e) => push({ sort: e.target.value })}
      >
        <option value="spent">Tri : dépense</option>
        <option value="orders">Tri : commandes</option>
        <option value="recent">Tri : récent</option>
      </select>
      <button type="submit" className="admin-btn">
        Rechercher
      </button>
    </form>
  );
}
