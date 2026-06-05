import { getAdminPlatformConfig } from "@/lib/admin/platform-config";
import { formatAdminMoney } from "@/lib/admin/constants";

export const dynamic = "force-dynamic";

export default function AdminParametresPage() {
  const config = getAdminPlatformConfig();

  return (
    <div>
      <h1 className="admin-page-title">Paramètres plateforme</h1>
      <p className="admin-page-sub">
        Configuration actuelle en lecture seule. L&apos;édition des paramètres financiers
        sera disponible prochainement.
      </p>

      <div className="admin-detail-grid">
        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Commissions par plan</h2>
          <dl>
            {config.plans.map((p) => (
              <div key={p.id} className="admin-detail-row">
                <dt>{p.name}</dt>
                <dd>{p.commissionRate} %</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Seuils &amp; options</h2>
          <dl>
            <div className="admin-detail-row">
              <dt>Validation retrait manuelle</dt>
              <dd>
                Au-delà de {formatAdminMoney(config.withdrawalValidationThreshold)}
              </dd>
            </div>
            <div className="admin-detail-row">
              <dt>Déblocage paiement à la livraison</dt>
              <dd>{formatAdminMoney(config.codUnlockPrice)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="admin-section">
        <h2 className="admin-section-title">Frais opérateurs par pays</h2>
        <div className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pays</th>
                  <th>Devise</th>
                  <th>Encaissement</th>
                  <th>Retrait</th>
                  <th>Frais retrait marchand</th>
                  <th>Opérateurs</th>
                </tr>
              </thead>
              <tbody>
                {config.countries.map((c) => (
                  <tr key={c.code}>
                    <td>{c.code}</td>
                    <td>{c.currency}</td>
                    <td>{c.payinRate} %</td>
                    <td>{c.payoutRate} %</td>
                    <td>{c.withdrawalFeeRate} %</td>
                    <td>{c.operators.length ? c.operators.join(", ") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <p className="admin-method-note">Édition à venir.</p>
    </div>
  );
}
