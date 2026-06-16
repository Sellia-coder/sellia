"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SoldesFilters({
  initialQ,
  sort,
}: {
  initialQ: string;
  sort: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);

  return (
    <form
      className="admin-toolbar"
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        if (sort) params.set("sort", sort);
        router.push(`/admin/soldes?${params.toString()}`);
      }}
    >
      <input
        type="search"
        className="admin-search"
        placeholder="Rechercher boutique, email…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <select
        className="admin-btn"
        value={sort}
        onChange={(e) => {
          const params = new URLSearchParams();
          if (q.trim()) params.set("q", q.trim());
          params.set("sort", e.target.value);
          router.push(`/admin/soldes?${params.toString()}`);
        }}
      >
        <option value="available">Tri : disponible</option>
        <option value="paidTotal">Tri : total versé</option>
        <option value="pendingEscrow">Tri : séquestre</option>
        <option value="inProgress">Tri : en cours</option>
        <option value="name">Tri : nom</option>
      </select>
      <button type="submit" className="admin-btn admin-btn--primary">
        Filtrer
      </button>
    </form>
  );
}
