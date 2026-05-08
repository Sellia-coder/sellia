"use client";

import { Check } from "lucide-react";

function buildSteps(hasPhysicalProducts: boolean) {
  if (hasPhysicalProducts) {
    return [
      { num: 1, label: "Logo" },
      { num: 2, label: "Produits" },
      { num: 3, label: "Contact" },
      { num: 35, label: "Livraison" },
      { num: 4, label: "À propos" },
      { num: 5, label: "Publier" },
    ];
  }
  return [
    { num: 1, label: "Logo" },
    { num: 2, label: "Produits" },
    { num: 3, label: "Contact" },
    { num: 4, label: "À propos" },
    { num: 5, label: "Publier" },
  ];
}

interface Props {
  currentStep: number;
  shopName?: string | null;
  shopLogoUrl?: string | null;
  shopPrimaryColor?: string | null;
  hasPhysicalProducts?: boolean;
}

export default function StepHeader({
  currentStep,
  shopName,
  shopLogoUrl,
  shopPrimaryColor,
  hasPhysicalProducts = false,
}: Props) {
  const STEPS = buildSteps(hasPhysicalProducts);
  const currentIndex = STEPS.findIndex((s) => s.num === currentStep);
  const displayPosition = currentIndex >= 0 ? currentIndex + 1 : 1;

  const displayName = shopName?.trim() || "Ma boutique";
  const initial = displayName[0].toUpperCase();

  return (
    <header className="perso-header">
      <div className="perso-header-inner">
        <div className="perso-header-top">
          <div className="perso-header-brand">
            <div
              className="perso-header-brand-logo"
              style={{ background: shopLogoUrl ? "transparent" : shopPrimaryColor ?? "#E84B1F" }}
            >
              {shopLogoUrl ? <img src={shopLogoUrl} alt="" /> : <span>{initial}</span>}
            </div>
            <div className="perso-header-brand-text">
              <span className="perso-header-brand-title">{displayName}</span>
              <span className="perso-header-brand-subtitle">Personnalisation</span>
            </div>
          </div>
          <span className="perso-header-counter">
            Étape {displayPosition} / {STEPS.length}
          </span>
        </div>

        <div className="perso-steps-desktop">
          {STEPS.map((s, idx) => {
            const done = idx < currentIndex;
            const active = idx === currentIndex;
            return (
              <div
                key={s.num}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  flex: idx === STEPS.length - 1 ? "0 0 auto" : 1,
                }}
              >
                <div className={`perso-step ${done ? "is-done" : ""} ${active ? "is-active" : ""}`}>
                  <div className="perso-step-circle">
                    {done ? <Check size={14} strokeWidth={2.5} /> : s.num}
                  </div>
                  <span className="perso-step-label">{s.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`perso-step-connector ${idx < currentIndex ? "is-done" : ""}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="perso-steps-mobile">
          <div className="perso-progress-bar">
            <div
              className="perso-progress-bar-fill"
              style={{
                width: `${(displayPosition / STEPS.length) * 100}%`,
              }}
            />
          </div>
          <div className="perso-progress-label">
            {STEPS[currentIndex]?.label ?? STEPS[0].label}
          </div>
        </div>
      </div>
    </header>
  );
}
