import { getProfitabilitySnapshots } from "@/lib/admin/insights";
import { formatAdminMoney } from "@/lib/admin/constants";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";

export const dynamic = "force-dynamic";

const PERIOD_LABELS: Record<string, string> = {
  current_month: "Ce mois",
  previous_month: "Mois dernier",
  all_time: "Depuis le début",
};

export default async function AdminRentabilitePage() {
  const snapshots = await getProfitabilitySnapshots();
  const current = snapshots.find((s) => s.period === "current_month") ?? snapshots[0];

  return (
    <div className="admin-rentabilite-simple">
      <header className="admin-page-header-premium">
        <h1 className="admin-page-title">Rentabilité Sellia</h1>
        <p className="admin-page-sub">
          Vue simplifiée — en français clair. Les frais partenaires sont une{" "}
          <strong>estimation indicative</strong> quand ils ne sont pas tous
          tracés en base.
        </p>
      </header>

      {current ? (
        <div className="admin-rentabilite-hero">
          <p className="admin-rentabilite-hero-label">
            {PERIOD_LABELS[current.period] ?? current.label}
          </p>
          {current.isProfitable === true ? (
            <p className="admin-rentabilite-verdict admin-rentabilite-verdict--ok">
              Sellia est rentable ce mois
            </p>
          ) : current.isProfitable === false ? (
            <p className="admin-rentabilite-verdict admin-rentabilite-verdict--loss">
              Sellia est en perte ce mois (estimation)
            </p>
          ) : (
            <p className="admin-rentabilite-verdict">Données insuffisantes</p>
          )}
        </div>
      ) : null}

      <div className="admin-rentabilite-cards">
        {snapshots.map((s) => (
          <section key={s.period} className="admin-premium-card">
            <h2 className="admin-premium-card-title">
              {PERIOD_LABELS[s.period] ?? s.label}
            </h2>

            <div className="admin-rentabilite-metric">
              <span className="admin-rentabilite-metric-label">
                Ce que Sellia a gagné
              </span>
              <span className="admin-rentabilite-metric-value">
                {s.revenueCommissions != null
                  ? formatAdminMoney(s.revenueCommissions)
                  : "—"}
              </span>
              <span className="admin-rentabilite-metric-help">
                Total des commissions encaissées sur les ventes
              </span>
            </div>

            <div className="admin-rentabilite-metric">
              <span className="admin-rentabilite-metric-label">
                Frais partenaires (estimés)
              </span>
              <span className="admin-rentabilite-metric-value admin-rentabilite-metric-value--muted">
                {formatAdminMoney(s.partnerFeesEstimated)}
              </span>
              <span className="admin-rentabilite-metric-help">
                Coûts Cartevo / Afribapay — {s.partnerFeesEstimatedLabel}
              </span>
            </div>

            <div className="admin-rentabilite-metric admin-rentabilite-metric--highlight">
              <span className="admin-rentabilite-metric-label">
                Bénéfice net (estimé)
              </span>
              <span
                className={`admin-rentabilite-metric-value ${
                  s.isProfitable ? "admin-rentabilite-metric-value--ok" : s.isProfitable === false ? "admin-rentabilite-metric-value--loss" : ""
                }`}
              >
                {s.margin != null ? formatAdminMoney(s.margin) : "—"}
              </span>
              <div style={{ marginTop: 8 }}>
                {s.isProfitable === true ? (
                  <AdminStatusBadge label="Rentable" variant="ok" />
                ) : s.isProfitable === false ? (
                  <AdminStatusBadge label="En perte" variant="danger" />
                ) : (
                  <AdminStatusBadge label="—" variant="off" />
                )}
              </div>
            </div>
          </section>
        ))}
      </div>

      <p className="admin-method-note">
        Les commissions sont réelles (somme des lignes payout). Les frais
        partenaires peuvent être partiellement estimés via les taux Cartevo —
        à interpréter avec prudence. Si cette page n&apos;apporte pas assez de
        valeur, on pourra la retirer du menu après validation terrain.
      </p>
    </div>
  );
}
