"use client";

import { useRouter } from "next/navigation";

const OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: "REQUESTED", label: "En attente de validation" },
  { value: "PROCESSING", label: "En cours" },
  { value: "SUCCESS", label: "Réussi" },
  { value: "PAID", label: "Versé" },
  { value: "FAILED", label: "Échoué" },
];

export default function RetraitsFilters({ initialStatus }: { initialStatus: string }) {
  const router = useRouter();

  return (
    <form
      className="admin-toolbar"
      onSubmit={(e) => {
        e.preventDefault();
        const status = String(new FormData(e.currentTarget).get("status") ?? "");
        router.push(
          status ? `/admin/retraits?status=${encodeURIComponent(status)}` : "/admin/retraits"
        );
      }}
    >
      <select
        name="status"
        className="admin-search"
        style={{ maxWidth: 260, flex: "none" }}
        defaultValue={initialStatus}
      >
        {OPTIONS.map((o) => (
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
