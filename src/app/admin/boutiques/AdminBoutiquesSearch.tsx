"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminBoutiquesSearch({
  initialQ,
  sort,
}: {
  initialQ: string;
  sort: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (sort) params.set("sort", sort);
    router.push(`/admin/boutiques?${params.toString()}`);
  };

  return (
    <form className="admin-toolbar" onSubmit={submit}>
      <input
        type="search"
        className="admin-search"
        placeholder="Rechercher slug, nom, email…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button type="submit" className="admin-btn admin-btn--primary">
        Rechercher
      </button>
      <select
        className="admin-btn"
        value={sort}
        onChange={(e) => {
          const params = new URLSearchParams();
          if (q.trim()) params.set("q", q.trim());
          params.set("sort", e.target.value);
          router.push(`/admin/boutiques?${params.toString()}`);
        }}
        aria-label="Tri"
      >
        <option value="date">Tri : date</option>
        <option value="gmv">Tri : GMV (page)</option>
      </select>
    </form>
  );
}
