"use client";

import { useRouter } from "next/navigation";

const ACTION_OPTIONS = [
  { value: "", label: "Toutes les actions" },
  { value: "shop.suspend", label: "Boutique suspendue" },
  { value: "shop.reactivate", label: "Boutique réactivée" },
  { value: "shop.change_plan", label: "Plan modifié" },
  { value: "user.block", label: "Marchand bloqué" },
  { value: "user.unblock", label: "Marchand débloqué" },
  { value: "withdrawal.approve", label: "Retrait validé" },
  { value: "withdrawal.reject", label: "Retrait rejeté" },
  { value: "withdrawal.reconcile", label: "Réconciliation" },
  { value: "review.hide", label: "Avis masqué" },
  { value: "platform.settings", label: "Paramètres" },
  { value: "admin.promote", label: "Promotion admin" },
  { value: "admin.demote", label: "Rétrogradation admin" },
];

const TARGET_OPTIONS = [
  { value: "", label: "Tous types" },
  { value: "user", label: "Utilisateur" },
  { value: "shop", label: "Boutique" },
  { value: "withdrawal_group", label: "Retrait" },
  { value: "review", label: "Avis" },
  { value: "platform_settings", label: "Paramètres" },
];

export default function AuditFilters({
  initialQ,
  initialAction,
  initialTargetType,
  initialAdmin,
  initialFrom,
  initialTo,
}: {
  initialQ: string;
  initialAction: string;
  initialTargetType: string;
  initialAdmin: string;
  initialFrom: string;
  initialTo: string;
}) {
  const router = useRouter();

  return (
    <form
      className="admin-toolbar admin-toolbar--wrap"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const params = new URLSearchParams();
        const q = String(fd.get("q") ?? "").trim();
        const action = String(fd.get("action") ?? "");
        const targetType = String(fd.get("targetType") ?? "");
        const admin = String(fd.get("admin") ?? "").trim();
        const from = String(fd.get("from") ?? "").trim();
        const to = String(fd.get("to") ?? "").trim();
        if (q) params.set("q", q);
        if (action) params.set("action", action);
        if (targetType) params.set("targetType", targetType);
        if (admin) params.set("admin", admin);
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        const qs = params.toString();
        router.push(qs ? `/admin/audit?${qs}` : "/admin/audit");
      }}
    >
      <input
        name="q"
        className="admin-search"
        placeholder="Rechercher…"
        defaultValue={initialQ}
        style={{ maxWidth: 200 }}
      />
      <input
        name="admin"
        className="admin-search"
        placeholder="Email admin"
        defaultValue={initialAdmin}
        style={{ maxWidth: 180 }}
      />
      <select
        name="action"
        className="admin-search"
        defaultValue={initialAction}
        style={{ maxWidth: 200, flex: "none" }}
      >
        {ACTION_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <select
        name="targetType"
        className="admin-search"
        defaultValue={initialTargetType}
        style={{ maxWidth: 160, flex: "none" }}
      >
        {TARGET_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <input
        name="from"
        type="date"
        className="admin-search"
        defaultValue={initialFrom}
        style={{ maxWidth: 150, flex: "none" }}
      />
      <input
        name="to"
        type="date"
        className="admin-search"
        defaultValue={initialTo}
        style={{ maxWidth: 150, flex: "none" }}
      />
      <button type="submit" className="admin-btn">
        Filtrer
      </button>
    </form>
  );
}
