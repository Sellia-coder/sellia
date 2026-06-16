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
  initialMinAmount,
  initialMaxAmount,
  initialFrom,
  initialTo,
}: {
  initialStatus: string;
  initialFilter?: string;
  initialMinAmount?: string;
  initialMaxAmount?: string;
  initialFrom?: string;
  initialTo?: string;
}) {
  const router = useRouter();
  const manualOnly = initialFilter === "manual";

  return (
    <form
      className="admin-toolbar admin-toolbar--wrap"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const params = new URLSearchParams();
        const filter = String(fd.get("filter") ?? "");
        const status = String(fd.get("status") ?? "");
        const minAmount = String(fd.get("minAmount") ?? "").trim();
        const maxAmount = String(fd.get("maxAmount") ?? "").trim();
        const from = String(fd.get("from") ?? "").trim();
        const to = String(fd.get("to") ?? "").trim();

        if (filter === "manual") params.set("filter", "manual");
        else if (status) params.set("status", status);
        if (minAmount) params.set("minAmount", minAmount);
        if (maxAmount) params.set("maxAmount", maxAmount);
        if (from) params.set("from", from);
        if (to) params.set("to", to);

        const q = params.toString();
        router.push(q ? `/admin/retraits?${q}` : "/admin/retraits");
      }}
    >
      <select
        name="filter"
        className="admin-search"
        style={{ maxWidth: 220, flex: "none" }}
        defaultValue={manualOnly ? "manual" : ""}
      >
        <option value="">Filtre spécial</option>
        <option value="manual">À vérifier manuellement</option>
      </select>
      <select
        name="status"
        className="admin-search"
        style={{ maxWidth: 260, flex: "none" }}
        defaultValue={manualOnly ? "" : initialStatus}
        disabled={manualOnly}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <input
        name="minAmount"
        type="number"
        className="admin-search"
        placeholder="Montant min"
        style={{ maxWidth: 130, flex: "none" }}
        defaultValue={initialMinAmount ?? ""}
        min={0}
      />
      <input
        name="maxAmount"
        type="number"
        className="admin-search"
        placeholder="Montant max"
        style={{ maxWidth: 130, flex: "none" }}
        defaultValue={initialMaxAmount ?? ""}
        min={0}
      />
      <input
        name="from"
        type="date"
        className="admin-search"
        style={{ maxWidth: 150, flex: "none" }}
        defaultValue={initialFrom ?? ""}
        title="Date début"
      />
      <input
        name="to"
        type="date"
        className="admin-search"
        style={{ maxWidth: 150, flex: "none" }}
        defaultValue={initialTo ?? ""}
        title="Date fin"
      />
      <button type="submit" className="admin-btn">
        Filtrer
      </button>
    </form>
  );
}
