"use client";

import { useState } from "react";
import { step3Schema, COUNTRIES, type Step3Input } from "@/lib/validations/personnalisation";
import {
  MapPin,
  Phone,
  Mail,
  Building,
  Instagram,
  Facebook,
  Plus,
  Globe,
} from "lucide-react";
import StepNav from "./StepNav";

interface Props {
  value: Step3Input;
  onChange: (v: Step3Input) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step3Contact({ value, onChange, onNext, onBack }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [showSocial, setShowSocial] = useState(!!(value.instagramUrl || value.facebookUrl || value.address));

  const country = COUNTRIES.find((c) => c.code === value.country) ?? COUNTRIES[0];

  const handleSubmit = () => {
    const parsed = step3Schema.safeParse(value);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Vérifie tes coordonnées");
      return;
    }
    setError(null);
    onNext();
  };

  return (
    <section>
      <div className="perso-section-header">
        <h1 className="perso-title">Comment te contacter ?</h1>
        <p className="perso-subtitle">Ces informations seront affichées sur ta boutique publique.</p>
      </div>

      <div className="perso-card">
        <label className="perso-card-label perso-form-label-with-icon">
          <Globe size={14} strokeWidth={2} />
          Pays *
        </label>
        <select
          value={value.country}
          onChange={(e) => onChange({ ...value, country: e.target.value as Step3Input["country"] })}
          className="perso-select"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="perso-card">
        <label className="perso-card-label perso-form-label-with-icon">
          <Phone size={14} strokeWidth={2} />
          Numéro WhatsApp *
        </label>
        <div className="perso-input-group">
          <span className="perso-input-prefix">{country.dialCode}</span>
          <input
            type="tel"
            value={value.whatsappNumber.replace(country.dialCode, "")}
            onChange={(e) => {
              const digits = e.target.value.replace(/[^0-9]/g, "");
              onChange({ ...value, whatsappNumber: `${country.dialCode}${digits}` });
            }}
            placeholder="6XX XXX XXX"
            className="perso-input"
          />
        </div>
        <p className="perso-card-help">C&apos;est le numéro que tes clients utiliseront pour te contacter.</p>
      </div>

      <div className="perso-card">
        <label className="perso-card-label perso-form-label-with-icon">
          <Mail size={14} strokeWidth={2} />
          Email de contact *
        </label>
        <input
          type="email"
          value={value.contactEmail}
          onChange={(e) => onChange({ ...value, contactEmail: e.target.value })}
          placeholder="contact@maboutique.com"
          className="perso-input"
        />
      </div>

      <div className="perso-card">
        <label className="perso-card-label">Ville *</label>
        <input
          type="text"
          value={value.city}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
          placeholder="Douala"
          className="perso-input"
        />
      </div>

      {!showSocial && (
        <button type="button" onClick={() => setShowSocial(true)} className="perso-btn-add">
          <Plus size={14} strokeWidth={2} style={{ marginRight: 6, verticalAlign: -2 }} />
          Ajouter adresse, Instagram, Facebook
        </button>
      )}

      {showSocial && (
        <>
          <div className="perso-card">
            <label className="perso-card-label perso-form-label-with-icon">
              <Building size={14} strokeWidth={2} />
              Adresse <span className="perso-card-label-optional">(optionnel)</span>
            </label>
            <input
              type="text"
              value={value.address ?? ""}
              onChange={(e) => onChange({ ...value, address: e.target.value })}
              placeholder="Akwa, en face de l'hôtel..."
              className="perso-input"
            />
          </div>
          <div className="perso-card">
            <label className="perso-card-label perso-form-label-with-icon">
              <Instagram size={14} strokeWidth={2} />
              Instagram <span className="perso-card-label-optional">(optionnel)</span>
            </label>
            <input
              type="url"
              value={value.instagramUrl ?? ""}
              onChange={(e) => onChange({ ...value, instagramUrl: e.target.value })}
              placeholder="https://instagram.com/maboutique"
              className="perso-input"
            />
          </div>
          <div className="perso-card">
            <label className="perso-card-label perso-form-label-with-icon">
              <Facebook size={14} strokeWidth={2} />
              Facebook <span className="perso-card-label-optional">(optionnel)</span>
            </label>
            <input
              type="url"
              value={value.facebookUrl ?? ""}
              onChange={(e) => onChange({ ...value, facebookUrl: e.target.value })}
              placeholder="https://facebook.com/maboutique"
              className="perso-input"
            />
          </div>
        </>
      )}

      {error && <div className="perso-alert-error perso-alert-error-inline">{error}</div>}

      <StepNav onBack={onBack} onNext={handleSubmit} nextLabel="Continuer" />
    </section>
  );
}
