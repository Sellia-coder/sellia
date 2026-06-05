"use client";

import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: "pending", label: "En attente" },
  { value: "paid_escrow", label: "Payé" },
  { value: "paid_offline", label: "Payé hors ligne" },
  { value: "paid_released", label: "Versé" },
  { value: "failed", label: "Échoué" },
  { value: "refunded", label: "Remboursé" },
];

export default function TransactionsFilters({
  initialQ,
  initialStatus,
}: {
  initialQ: string;
  initialStatus: string;
}) {
  const router = useRouter();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = String(fd.get("q") ?? "").trim();
    const status = String(fd.get("status") ?? "");
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    const qs = params.toString();
    router.push(`/admin/transactions${qs ? `?${qs}` : ""}`);
  };

  return (
    <form className="admin-toolbar" onSubmit={submit}>
      <input
        name="q"
        type="search"
        className="admin-search"
        placeholder="N° commande, boutique…"
        defaultValue={initialQ}
      />
      <select
        name="status"
        className="admin-search"
        style={{ maxWidth: 200, flex: "none" }}
        defaultValue={initialStatus}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <button type="submit" className="admin-btn">
        Filtrer
      </button>
    </form>
  );
}
