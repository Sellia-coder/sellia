"use client";

import { useRouter } from "next/navigation";

const OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: "REQUESTED", label: "En attente de validation" },
  { value: "PROCESSING", label: "En cours" },
  { value: "SUCCESS", label: "Réussi" },
  { value: "PAID", label: "Versé" },
  { value: "FAILED", label: "Échec" },
];

export default function RetraitsFilters({
  initialStatus,
  initialFilter,
}: {
  initialStatus: string;
  initialFilter?: string;
}) {
  const router = useRouter();

  return (
    <form
      className="admin-toolbar"
      onSubmit={(e) => {
        e.preventDefault();
        const status = String(new FormData(e.currentTarget).get("status") ?? "");
        const filter = String(new FormData(e.currentTarget).get("filter") ?? "");
        const params = new URLSearchParams();
        if (filter === "manual") params.set("filter", "manual");
        else if (status) params.set("status", status);
        const q = params.toString();
        router.push(q ? `/admin/retraits?${q}` : "/admin/retraits");
      }}
    >
      <select
        name="filter"
        className="admin-search"
        style={{ maxWidth: 220, flex: "none" }}
        defaultValue={initialFilter === "manual" ? "manual" : ""}
        onChange={(e) => {
          if (e.target.value === "manual") {
            router.push("/admin/retraits?filter=manual");
          }
        }}
      >
        <option value="">Filtre spécial</option>
        <option value="manual">À vérifier manuellement</option>
      </select>
      <select
        name="status"
        className="admin-search"
        style={{ maxWidth: 260, flex: "none" }}
        defaultValue={initialFilter === "manual" ? "" : initialStatus}
        disabled={initialFilter === "manual"}
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
