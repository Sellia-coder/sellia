"use client";

import { useState } from "react";
import {
  Truck,
  Plus,
  X,
  Lightbulb,
  Banknote,
  ShieldCheck,
  QrCode,
} from "lucide-react";
import {
  step35Schema,
  COUNTRY_CITIES,
  type Step35Input,
  type ShippingZone,
} from "@/lib/validations/personnalisation";
import StepNav from "./StepNav";

interface Props {
  value: Step35Input;
  onChange: (v: Step35Input) => void;
  onNext: () => void;
  onBack: () => void;
  countryCode: string;
}

const MAX_ZONES = 10;

export default function Step35Shipping({
  value,
  onChange,
  onNext,
  onBack,
  countryCode,
}: Props) {
  const [error, setError] = useState<string | null>(null);

  const usedNames = new Set(
    value.shippingZones.map((z) => z.name.trim().toLowerCase())
  );
  const suggestions = (COUNTRY_CITIES[countryCode] ?? COUNTRY_CITIES.OTHER ?? []).filter(
    (city) => !usedNames.has(city.toLowerCase())
  );

  const updateZone = (id: string, patch: Partial<ShippingZone>) => {
    onChange({
      ...value,
      shippingZones: value.shippingZones.map((z) =>
        z.id === id ? { ...z, ...patch } : z
      ),
    });
  };

  const addZone = (name = "") => {
    if (value.shippingZones.length >= MAX_ZONES) return;
    onChange({
      ...value,
      shippingZones: [
        ...value.shippingZones,
        {
          id: `zone-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: name.trim(),
          price: 0,
          eta: "",
        },
      ],
    });
  };

  const removeZone = (id: string) => {
    onChange({
      ...value,
      shippingZones: value.shippingZones.filter((z) => z.id !== id),
    });
  };

  const togglePayment = (
    key: "paymentCashOnDelivery" | "paymentOnlineEscrow",
    checked: boolean
  ) => {
    onChange({ ...value, [key]: checked });
  };

  const handleSubmit = () => {
    const parsed = step35Schema.safeParse(value);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Vérifie ta configuration");
      return;
    }
    setError(null);
    onNext();
  };

  return (
    <section>
      <div className="perso-section-header">
        <h1 className="perso-title">Livraison & paiement</h1>
        <p className="perso-subtitle">
          Configure tes zones et choisis comment tes clients paieront leurs
          commandes.
        </p>
      </div>

      <div className="perso-shipping-intro">
        <div className="perso-shipping-intro-icon">
          <Truck size={18} strokeWidth={2} />
        </div>
        <div className="perso-shipping-intro-text">
          Cette étape s&apos;applique uniquement à tes <strong>produits physiques</strong>.
          Tu pourras ajouter d&apos;autres zones et options depuis ton dashboard plus tard.
        </div>
      </div>

      <div className="perso-form-section">
        <h3 className="perso-form-section-title-icon">
          <Truck size={14} strokeWidth={2} />
          Zones de livraison
        </h3>

        <div className="perso-zones-list">
          {value.shippingZones.map((zone, idx) => (
            <div className="perso-zone" key={zone.id}>
              <input
                type="text"
                value={zone.name}
                onChange={(e) => updateZone(zone.id, { name: e.target.value })}
                placeholder={idx === 0 ? "Tout le pays" : "Ex : Douala"}
                className="perso-zone-input perso-zone-name-input"
                maxLength={50}
              />
              <div className="perso-zone-price-group">
                <input
                  type="number"
                  value={zone.price || ""}
                  onChange={(e) =>
                    updateZone(zone.id, { price: parseInt(e.target.value, 10) || 0 })
                  }
                  placeholder="0"
                  className="perso-zone-price-input"
                  min={0}
                  step={100}
                />
                <span className="perso-zone-price-suffix">FCFA</span>
              </div>
              <input
                type="text"
                value={zone.eta ?? ""}
                onChange={(e) => updateZone(zone.id, { eta: e.target.value })}
                placeholder="24-48h"
                className="perso-zone-input perso-zone-eta-input"
                maxLength={40}
              />
              <button
                type="button"
                className="perso-zone-remove"
                onClick={() => removeZone(zone.id)}
                disabled={value.shippingZones.length === 1}
                title={
                  value.shippingZones.length === 1
                    ? "Tu dois garder au moins une zone"
                    : "Supprimer cette zone"
                }
                aria-label="Supprimer la zone"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>

        {value.shippingZones.length < MAX_ZONES && (
          <button
            type="button"
            className="perso-zone-add"
            onClick={() => addZone()}
          >
            <Plus size={14} strokeWidth={2} />
            Ajouter une zone
          </button>
        )}

        {suggestions.length > 0 && value.shippingZones.length < MAX_ZONES && (
          <div className="perso-zone-suggestions">
            <div className="perso-zone-suggestions-label">
              <Lightbulb size={12} strokeWidth={2} />
              Suggestions populaires
            </div>
            <div className="perso-zone-suggestions-list">
              {suggestions.slice(0, 8).map((city) => (
                <button
                  key={city}
                  type="button"
                  className="perso-zone-suggestion"
                  onClick={() => addZone(city)}
                  disabled={value.shippingZones.length >= MAX_ZONES}
                >
                  <Plus size={11} strokeWidth={2.5} />
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="perso-form-section">
        <h3 className="perso-form-section-title-icon">
          <Banknote size={14} strokeWidth={2} />
          Options de paiement
        </h3>

        <div className="perso-payment-options">
          <label
            className={`perso-payment-option ${
              value.paymentCashOnDelivery ? "is-active" : ""
            }`}
          >
            <div className="perso-payment-option-icon">
              <Banknote size={20} strokeWidth={1.8} />
            </div>
            <div className="perso-payment-option-body">
              <div className="perso-payment-option-title">
                Paiement à la livraison
              </div>
              <p className="perso-payment-option-desc">
                Le client paie en <strong>espèces ou Mobile Money</strong>{" "}
                directement à votre livreur quand il reçoit son colis. Simple
                et rassurant pour les nouveaux clients.
              </p>
            </div>
            <span className="perso-payment-option-toggle">
              <input
                type="checkbox"
                checked={value.paymentCashOnDelivery}
                onChange={(e) =>
                  togglePayment("paymentCashOnDelivery", e.target.checked)
                }
              />
              <span className="perso-payment-option-toggle-slider" />
            </span>
          </label>

          <label
            className={`perso-payment-option ${
              value.paymentOnlineEscrow ? "is-active" : ""
            }`}
          >
            <div className="perso-payment-option-icon">
              <ShieldCheck size={20} strokeWidth={1.8} />
            </div>
            <div className="perso-payment-option-body">
              <div className="perso-payment-option-title">
                Paiement en ligne sécurisé
                <span className="perso-payment-option-badge perso-payment-option-badge-secure">
                  Recommandé
                </span>
              </div>
              <p className="perso-payment-option-desc">
                Le client paie en avance sur ta boutique. Les fonds sont{" "}
                <strong>sécurisés par Sellia</strong>. À la livraison,{" "}
                <strong>tu scannes le QR que le client te présente</strong> pour
                libérer les fonds sur ton solde. Si le client n&apos;est pas livré
                dans 6 jours, il est automatiquement remboursé.
              </p>

              {value.paymentOnlineEscrow && (
                <div className="perso-escrow-info">
                  <div className="perso-escrow-info-title">
                    <QrCode size={12} strokeWidth={2} />
                    Comment ça marche
                  </div>
                  <ul className="perso-escrow-info-steps">
                    <li className="perso-escrow-info-step">
                      <span className="perso-escrow-info-step-num">1</span>
                      <span>
                        Le client paie sur ta boutique (Mobile Money / carte).
                        Les fonds sont sécurisés par Sellia.
                      </span>
                    </li>
                    <li className="perso-escrow-info-step">
                      <span className="perso-escrow-info-step-num">2</span>
                      <span>
                        Le client reçoit un <strong>QR code de validation</strong>{" "}
                        par email/SMS — c&apos;est sa preuve de commande.
                      </span>
                    </li>
                    <li className="perso-escrow-info-step">
                      <span className="perso-escrow-info-step-num">3</span>
                      <span>
                        À la livraison, <strong>tu scannes le QR que le client
                        te présente</strong> → fonds crédités sur ton solde
                        Sellia instantanément.
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <span className="perso-payment-option-toggle">
              <input
                type="checkbox"
                checked={value.paymentOnlineEscrow}
                onChange={(e) =>
                  togglePayment("paymentOnlineEscrow", e.target.checked)
                }
              />
              <span className="perso-payment-option-toggle-slider" />
            </span>
          </label>
        </div>

        {!value.paymentCashOnDelivery && !value.paymentOnlineEscrow && (
          <div
            className="perso-alert-error perso-alert-error-inline"
            style={{ marginTop: 14 }}
          >
            Active au moins une option de paiement pour que tes clients
            puissent commander.
          </div>
        )}
      </div>

      {error && (
        <div className="perso-alert-error perso-alert-error-inline">{error}</div>
      )}

      <StepNav onBack={onBack} onNext={handleSubmit} nextLabel="Continuer" />
    </section>
  );
}
