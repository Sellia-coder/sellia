"use client";

import { useState } from "react";
import Link from "next/link";
import { CaretLeft } from "@phosphor-icons/react";
import {
  updateLoyaltyConfigAction,
  type ConfigLoyaltyInput,
} from "@/app/actions/loyalty";
import { useRouter } from "next/navigation";
import EmptyLoyalty from "../empty-states/EmptyLoyalty";
import styles from "./loyalty.module.css";

interface LoyaltyConfigData {
  isEnabled: boolean;
  pointsPerCurrency: number;
  currencyPerPoint: number;
  redemptionPointsRequired: number;
  redemptionDiscountAmount: number;
  silverThreshold: number;
  goldThreshold: number;
  platinumThreshold: number;
  welcomeBonusPoints: number;
}

interface AccountRow {
  id: string;
  customerName: string;
  customerPhone: string;
  points: number;
  lifetimePoints: number;
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  createdAt: string;
}

interface Props {
  config: LoyaltyConfigData | null;
  stats: {
    accountsCount: number;
    totalPoints: number;
    totalLifetime: number;
  };
  accounts: AccountRow[];
}

const defaults: LoyaltyConfigData = {
  isEnabled: false,
  pointsPerCurrency: 1,
  currencyPerPoint: 100,
  redemptionPointsRequired: 100,
  redemptionDiscountAmount: 500,
  silverThreshold: 500,
  goldThreshold: 2000,
  platinumThreshold: 5000,
  welcomeBonusPoints: 0,
};

const tierLabels: Record<AccountRow["tier"], string> = {
  BRONZE: "Bronze",
  SILVER: "Argent",
  GOLD: "Or",
  PLATINUM: "Platine",
};

export default function LoyaltyClient({ config, stats, accounts }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<LoyaltyConfigData>(config || defaults);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof LoyaltyConfigData, value: number | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    const payload: ConfigLoyaltyInput = { ...form };
    const res = await updateLoyaltyConfigAction(payload);
    setSaving(false);
    if (res.ok) {
      setSuccess(true);
      router.refresh();
    } else setError(res.error || "Erreur");
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <Link href="/dashboard/promotions" className={styles.backLink}>
          <CaretLeft size={14} weight="bold" /> Promotions
        </Link>
      </div>

      <div className={styles.header}>
        <span className={styles.eyebrow}>— PROMOTIONS / FIDÉLITÉ</span>
        <h1 className={styles.title}>Programme fidélité</h1>
        <p className={styles.subtitle}>
          Récompensez vos clients avec des points convertibles en réductions.
        </p>
      </div>

      <div className={styles.configCard}>
        <h2 className={styles.configTitle}>Configuration</h2>
        <div className={styles.toggleRow}>
          <div>
            <div className={styles.toggleLabel}>Programme actif</div>
            <div className={styles.toggleHint}>
              Les clients gagnent des points à chaque commande payée.
            </div>
          </div>
          <button
            type="button"
            className={`${styles.toggle} ${form.isEnabled ? styles.toggleOn : styles.toggleOff}`}
            onClick={() => update("isEnabled", !form.isEnabled)}
            aria-pressed={form.isEnabled}
          >
            <span
              className={styles.toggleKnob}
              style={{ left: form.isEnabled ? 23 : 3 }}
            />
          </button>
        </div>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label>Points par unité</label>
            <input
              type="number"
              value={form.pointsPerCurrency}
              onChange={(e) =>
                update("pointsPerCurrency", parseInt(e.target.value, 10) || 0)
              }
            />
          </div>
          <div className={styles.field}>
            <label>FCFA par point gagné</label>
            <input
              type="number"
              value={form.currencyPerPoint}
              onChange={(e) =>
                update("currencyPerPoint", parseInt(e.target.value, 10) || 0)
              }
            />
          </div>
        </div>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label>Points pour échanger</label>
            <input
              type="number"
              value={form.redemptionPointsRequired}
              onChange={(e) =>
                update(
                  "redemptionPointsRequired",
                  parseInt(e.target.value, 10) || 0
                )
              }
            />
          </div>
          <div className={styles.field}>
            <label>Réduction (FCFA)</label>
            <input
              type="number"
              value={form.redemptionDiscountAmount}
              onChange={(e) =>
                update(
                  "redemptionDiscountAmount",
                  parseInt(e.target.value, 10) || 0
                )
              }
            />
          </div>
        </div>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label>Seuil Argent (pts)</label>
            <input
              type="number"
              value={form.silverThreshold}
              onChange={(e) =>
                update("silverThreshold", parseInt(e.target.value, 10) || 0)
              }
            />
          </div>
          <div className={styles.field}>
            <label>Seuil Or</label>
            <input
              type="number"
              value={form.goldThreshold}
              onChange={(e) =>
                update("goldThreshold", parseInt(e.target.value, 10) || 0)
              }
            />
          </div>
        </div>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label>Seuil Platine</label>
            <input
              type="number"
              value={form.platinumThreshold}
              onChange={(e) =>
                update("platinumThreshold", parseInt(e.target.value, 10) || 0)
              }
            />
          </div>
          <div className={styles.field}>
            <label>Bonus bienvenue (pts)</label>
            <input
              type="number"
              value={form.welcomeBonusPoints}
              onChange={(e) =>
                update("welcomeBonusPoints", parseInt(e.target.value, 10) || 0)
              }
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={styles.btnSave}
        >
          {saving ? "Enregistrement..." : "Enregistrer la configuration"}
        </button>
        {success && (
          <div className={styles.successMsg}>Configuration enregistrée.</div>
        )}
        {error && <div className={styles.errorMsg}>{error}</div>}
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Clients inscrits</div>
          <div className={styles.statValue}>{stats.accountsCount}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Points actifs</div>
          <div className={styles.statValue}>
            {stats.totalPoints.toLocaleString("fr-FR")}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Points cumulés (vie)</div>
          <div className={styles.statValue}>
            {stats.totalLifetime.toLocaleString("fr-FR")}
          </div>
        </div>
      </div>

      <div className={styles.tableWrap}>
        {accounts.length === 0 ? (
          <div className={styles.emptyState}>
            <EmptyLoyalty size={140} />
            <h3>Aucun client fidélité</h3>
            <p>
              Les comptes apparaîtront lorsque des clients commanderont avec le
              programme activé.
            </p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Client</th>
                <th>Téléphone</th>
                <th>Niveau</th>
                <th>Points</th>
                <th>Cumul</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id}>
                  <td>{a.customerName}</td>
                  <td>{a.customerPhone}</td>
                  <td>
                    <span
                      className={`${styles.tierBadge} ${styles[`tier${a.tier}`]}`}
                    >
                      {tierLabels[a.tier]}
                    </span>
                  </td>
                  <td>{a.points.toLocaleString("fr-FR")}</td>
                  <td>{a.lifetimePoints.toLocaleString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
