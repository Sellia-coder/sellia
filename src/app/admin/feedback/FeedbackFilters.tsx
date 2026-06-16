"use client";

import { useRouter } from "next/navigation";

const TYPE_OPTIONS = [
  { value: "", label: "Tous les types" },
  { value: "SUGGESTION", label: "Suggestion" },
  { value: "REMARQUE", label: "Remarque" },
  { value: "BUG", label: "Bug" },
  { value: "AUTRE", label: "Autre" },
] as const;

const STATUS_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: "NEW", label: "Nouveaux" },
  { value: "READ", label: "Lu" },
  { value: "HANDLED", label: "Traités" },
] as const;

export default function FeedbackFilters({
  initialQ,
  initialType,
  initialStatus,
  initialFrom,
  initialTo,
}: {
  initialQ: string;
  initialType: string;
  initialStatus: string;
  initialFrom: string;
  initialTo: string;
}) {
  const router = useRouter();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const q = String(fd.get("q") ?? "").trim();
    const type = String(fd.get("type") ?? "");
    const status = String(fd.get("status") ?? "");
    const from = String(fd.get("from") ?? "");
    const to = String(fd.get("to") ?? "");

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    const qs = params.toString();
    router.push(`/admin/feedback${qs ? `?${qs}` : ""}`);
  };

  return (
    <form className="admin-toolbar" onSubmit={submit}>
      <input
        name="q"
        type="search"
        className="admin-search"
        placeholder="Recherche : email, boutique, message…"
        defaultValue={initialQ}
      />
      <select
        name="type"
        className="admin-search"
        style={{ maxWidth: 200, flex: "none" }}
        defaultValue={initialType}
      >
        {TYPE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
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
      <input
        type="date"
        name="from"
        className="admin-search"
        defaultValue={initialFrom}
        style={{ maxWidth: 150, flex: "none" }}
      />
      <input
        type="date"
        name="to"
        className="admin-search"
        defaultValue={initialTo}
        style={{ maxWidth: 150, flex: "none" }}
      />
      <button type="submit" className="admin-btn admin-btn--primary">
        Filtrer
      </button>
    </form>
  );
}

