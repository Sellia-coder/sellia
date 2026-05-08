"use client";

import { useState, useEffect, useRef } from "react";
import { checkSlugAvailabilityAction, suggestSlugsAction } from "@/app/actions/personnalisation";
import { step1Schema, type Step1Input } from "@/lib/validations/personnalisation";
import { Upload, X, Globe, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import StepNav from "./StepNav";

interface Props {
  value: Step1Input;
  onChange: (v: Step1Input) => void;
  shopName: string;
  primaryColor: string;
  onNext: () => void;
}

type SlugStatus = "idle" | "checking" | "available" | "taken" | "format" | "reserved";

export default function Step1Logo({ value, onChange, shopName, primaryColor, onNext }: Props) {
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.slug) {
      setSlugStatus("idle");
      return;
    }
    setSlugStatus("checking");
    debounceRef.current = setTimeout(async () => {
      const r = await checkSlugAvailabilityAction(value.slug);
      if (!r.ok) return;
      if (r.available) {
        setSlugStatus("available");
        setSuggestions([]);
      } else {
        const reason = r.reason;
        if (reason === "taken" || reason === "format" || reason === "reserved") {
          setSlugStatus(reason);
        } else {
          setSlugStatus("idle");
        }
        if (reason === "taken") {
          const sug = await suggestSlugsAction(value.slug);
          if (sug.ok) setSuggestions(sug.suggestions);
        }
      }
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value.slug]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) {
      setError("Le logo doit faire moins de 500 Ko");
      return;
    }
    if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(file.type)) {
      setError("Format accepté : PNG, JPG, WEBP ou SVG");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ ...value, logoUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => onChange({ ...value, logoUrl: null });

  const handleSubmit = () => {
    const parsed = step1Schema.safeParse(value);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Données invalides");
      return;
    }
    if (slugStatus !== "available") {
      setError("Choisis un sous-domaine disponible avant de continuer");
      return;
    }
    setError(null);
    onNext();
  };

  const initial = (shopName?.trim()?.[0] ?? "S").toUpperCase();

  return (
    <section>
      <div className="perso-section-header">
        <h1 className="perso-title">Ton identité visuelle</h1>
        <p className="perso-subtitle">Choisis un logo et l&apos;adresse web de ta boutique.</p>
      </div>

      {/* Logo */}
      <div className="perso-card">
        <label className="perso-card-label">Logo</label>
        <div className="perso-logo-row">
          <div className="perso-logo-preview" style={{ background: value.logoUrl ? "transparent" : primaryColor }}>
            {value.logoUrl ? <img src={value.logoUrl} alt="Logo" /> : <span className="perso-logo-preview-initial">{initial}</span>}
          </div>
          <div className="perso-logo-actions">
            <div className="perso-logo-buttons">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="perso-btn perso-btn-secondary perso-btn-icon"
              >
                <Upload size={14} strokeWidth={2} />
                {value.logoUrl ? "Changer" : "Uploader un logo"}
              </button>
              {value.logoUrl && (
                <button type="button" onClick={removeLogo} className="perso-btn perso-btn-ghost perso-btn-icon">
                  <X size={14} strokeWidth={2} />
                  Retirer
                </button>
              )}
            </div>
            <p className="perso-card-help">PNG, JPG, WEBP ou SVG — max 500 Ko. Sinon, on garde l&apos;initiale colorée.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </div>
        </div>
      </div>

      {/* Slug */}
      <div className="perso-card">
        <label htmlFor="slug" className="perso-card-label perso-form-label-with-icon">
          <Globe size={14} strokeWidth={2} />
          Adresse web de ta boutique
        </label>
        <div className="perso-input-group">
          <input
            id="slug"
            type="text"
            value={value.slug}
            onChange={(e) =>
              onChange({
                ...value,
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30),
              })
            }
            placeholder="masuperboutique"
            className="perso-input"
            autoComplete="off"
          />
          <span className="perso-input-suffix">.getsellia.com</span>
        </div>

        <div className="perso-slug-status">
          {slugStatus === "checking" && (
            <span className="perso-slug-status-checking">
              <span className="perso-spinner" /> Vérification…
            </span>
          )}
          {slugStatus === "available" && (
            <span className="perso-slug-status-available">
              <CheckCircle2 size={14} strokeWidth={2.5} /> Disponible
            </span>
          )}
          {slugStatus === "taken" && (
            <span className="perso-slug-status-error">
              <AlertCircle size={14} strokeWidth={2.5} /> Ce sous-domaine est déjà pris
            </span>
          )}
          {slugStatus === "format" && (
            <span className="perso-slug-status-error">
              <AlertCircle size={14} strokeWidth={2.5} /> Format invalide (lettres minuscules, chiffres et tirets)
            </span>
          )}
          {slugStatus === "reserved" && (
            <span className="perso-slug-status-error">
              <Lock size={14} strokeWidth={2.5} /> Ce nom est réservé
            </span>
          )}
        </div>

        {suggestions.length > 0 && (
          <div className="perso-slug-suggestions">
            {suggestions.map((s) => (
              <button key={s} type="button" onClick={() => onChange({ ...value, slug: s })} className="perso-slug-suggestion">
                {s}
              </button>
            ))}
          </div>
        )}

        <p className="perso-card-help">Tu pourras le modifier plus tard depuis tes paramètres.</p>
      </div>

      {error && <div className="perso-alert-error perso-alert-error-inline">{error}</div>}

      <StepNav onNext={handleSubmit} nextLabel="Continuer" />
    </section>
  );
}
