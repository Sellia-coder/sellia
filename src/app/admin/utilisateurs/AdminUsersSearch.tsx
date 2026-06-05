"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminUsersSearch({ initialQ }: { initialQ: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/admin/utilisateurs?${params.toString()}`);
  };

  return (
    <form className="admin-toolbar" onSubmit={submit}>
      <input
        type="search"
        className="admin-search"
        placeholder="Rechercher par email…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button type="submit" className="admin-btn admin-btn--primary">
        Rechercher
      </button>
    </form>
  );
}
