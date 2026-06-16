"use client";

import { useState, useTransition } from "react";
import { formatAdminMoney } from "@/lib/admin/constants";
import {
  adminResetMoneySettingsAction,
  adminUpdateMoneySettingsAction,
} from "@/app/actions/admin-settings";
import { MONEY_DEFAULTS, MAX_COMMISSION_RATE_PERCENT } from "@/lib/admin/money-config";

type MoneyConfig = {
  plans: Array<{
    id: string;
    name: string;
    commissionRate: number;
    defaultCommissionRate: number;
    hasOverride: boolean;
  }>;
  withdrawalValidationThreshold: number;
  codUnlockPrice: number;
  defaultWithdrawalThreshold: number;
  defaultCodUnlockPrice: number;
  moneyHasOverrides: boolean;
};

export default function AdminMoneySettingsClient({
  config,
  isSuperAdmin,
}: {
  config: MoneyConfig;
  isSuperAdmin: boolean;
}) {
  const [form, setForm] = useState({
    commissionRateFree: String(
      config.plans.find((p) => p.id === "free")?.commissionRate ?? MONEY_DEFAULTS.commissionRates.free
    ),
    commissionRatePro: String(
      config.plans.find((p) => p.id === "pro")?.commissionRate ?? MONEY_DEFAULTS.commissionRates.pro
    ),
    commissionRateBusiness: String(
      config.plans.find((p) => p.id === "business")?.commissionRate ??
        MONEY_DEFAULTS.commissionRates.business
    ),
    withdrawalValidationThreshold: String(config.withdrawalValidationThreshold),
    codUnlockPrice: String(config.codUnlockPrice),
  });
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  const parseRate = (raw: string) => parseFloat(raw.replace(",", "."));

  const buildPayload = () => ({
    commissionRateFree: parseRate(form.commissionRateFree),
    commissionRatePro: parseRate(form.commissionRatePro),
    commissionRateBusiness: parseRate(form.commissionRateBusiness),
    withdrawalValidationThreshold: parseInt(form.withdrawalValidationThreshold, 10),
    codUnlockPrice: parseInt(form.codUnlockPrice, 10),
  });

  const save = () => {
    const payload = buildPayload();
    const summary = [
      `Découverte : ${config.plans.find((p) => p.id === "free")?.commissionRate} % → ${payload.commissionRateFree} %`,
      `Pro : ${config.plans.find((p) => p.id === "pro")?.commissionRate} % → ${payload.commissionRatePro} %`,
      `Business : ${config.plans.find((p) => p.id === "business")?.commissionRate} % → ${payload.commissionRateBusiness} %`,
      `Seuil retrait : ${formatAdminMoney(config.withdrawalValidationThreshold)} → ${formatAdminMoney(payload.withdrawalValidationThreshold)}`,
      `Prix COD : ${formatAdminMoney(config.codUnlockPrice)} → ${formatAdminMoney(payload.codUnlockPrice)}`,
      "",
      "Seules les NOUVELLES transactions seront impactées.",
    ].join("\n");

    if (!window.confirm(`Confirmer la modification des réglages money ?\n\n${summary}`)) {
      return;
    }

    startTransition(async () => {
      const res = await adminUpdateMoneySettingsAction(payload);
      if (res.ok) {
        setStatus("ok");
        window.location.reload();
      } else {
        setStatus("error");
        alert(res.error ?? "Erreur");
      }
    });
  };

  const reset = () => {
    if (
      !window.confirm(
        "Réinitialiser tous les réglages money aux constantes par défaut ?\n\nSeules les futures transactions seront impactées."
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await adminResetMoneySettingsAction();
      if (res.ok) window.location.reload();
      else alert(res.error ?? "Erreur");
    });
  };

  return (
    <section
      className={`admin-premium-card ${isSuperAdmin ? "admin-premium-card--accent" : "admin-premium-card--readonly"}`}
    >
      <h2 className="admin-premium-card-title">Réglages money</h2>
      <p className="admin-premium-card-help">
        Commissions Sellia, seuil de validation retrait et prix COD.{" "}
        {isSuperAdmin
          ? "Modification réservée au super administrateur — forward-only (futures transactions uniquement)."
          : "Lecture seule pour les administrateurs."}
        {config.moneyHasOverrides ? (
          <span className="admin-muted-text"> · Overrides actifs en base.</span>
        ) : (
          <span className="admin-muted-text"> · Constantes par défaut.</span>
        )}
      </p>

      <div className="admin-detail-grid">
        <div className="admin-money-block">
          <h3 className="admin-money-block-title">Commissions par plan (%)</h3>
          <div className="admin-field">
            <label>Découverte</label>
            <input
              className="admin-field-input sellia-num"
              type="number"
              min={0}
              max={MAX_COMMISSION_RATE_PERCENT}
              step={0.1}
              disabled={!isSuperAdmin || pending}
              value={form.commissionRateFree}
              onChange={(e) =>
                setForm((f) => ({ ...f, commissionRateFree: e.target.value }))
              }
            />
            <span className="admin-switch-help">
              Défaut : {MONEY_DEFAULTS.commissionRates.free} %
            </span>
          </div>
          <div className="admin-field">
            <label>Pro</label>
            <input
              className="admin-field-input sellia-num"
              type="number"
              min={0}
              max={MAX_COMMISSION_RATE_PERCENT}
              step={0.1}
              disabled={!isSuperAdmin || pending}
              value={form.commissionRatePro}
              onChange={(e) =>
                setForm((f) => ({ ...f, commissionRatePro: e.target.value }))
              }
            />
            <span className="admin-switch-help">
              Défaut : {MONEY_DEFAULTS.commissionRates.pro} %
            </span>
          </div>
          <div className="admin-field">
            <label>Business</label>
            <input
              className="admin-field-input sellia-num"
              type="number"
              min={0}
              max={MAX_COMMISSION_RATE_PERCENT}
              step={0.1}
              disabled={!isSuperAdmin || pending}
              value={form.commissionRateBusiness}
              onChange={(e) =>
                setForm((f) => ({ ...f, commissionRateBusiness: e.target.value }))
              }
            />
            <span className="admin-switch-help">
              Défaut : {MONEY_DEFAULTS.commissionRates.business} %
            </span>
          </div>
        </div>

        <div className="admin-money-block">
          <h3 className="admin-money-block-title">Seuils &amp; options</h3>
          <div className="admin-field">
            <label>Validation retrait manuelle (FCFA)</label>
            <input
              className="admin-field-input sellia-num"
              type="number"
              min={0}
              step={1000}
              disabled={!isSuperAdmin || pending}
              value={form.withdrawalValidationThreshold}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  withdrawalValidationThreshold: e.target.value,
                }))
              }
            />
            <span className="admin-switch-help">
              Au-delà de ce montant → validation agent. Défaut :{" "}
              {formatAdminMoney(MONEY_DEFAULTS.withdrawalValidationThreshold)}
            </span>
          </div>
          <div className="admin-field">
            <label>Déblocage paiement à la livraison (FCFA)</label>
            <input
              className="admin-field-input sellia-num"
              type="number"
              min={0}
              step={100}
              disabled={!isSuperAdmin || pending}
              value={form.codUnlockPrice}
              onChange={(e) =>
                setForm((f) => ({ ...f, codUnlockPrice: e.target.value }))
              }
            />
            <span className="admin-switch-help">
              Défaut : {formatAdminMoney(MONEY_DEFAULTS.codUnlockPrice)}
            </span>
          </div>
        </div>
      </div>

      {isSuperAdmin ? (
        <div className="admin-detail-actions-bar" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={save}
            disabled={pending}
          >
            Enregistrer les réglages money
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={reset}
            disabled={pending}
          >
            Réinitialiser aux valeurs par défaut
          </button>
        </div>
      ) : null}

      {status === "error" ? (
        <p className="admin-feedback admin-feedback--error">Erreur lors de l&apos;enregistrement.</p>
      ) : null}
    </section>
  );
}
