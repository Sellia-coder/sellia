"use client";

import { useState } from "react";
import { step4Schema, type Step4Input } from "@/lib/validations/personnalisation";
import { FileText } from "lucide-react";
import StepNav from "./StepNav";

interface Props {
  value: Step4Input;
  onChange: (v: Step4Input) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step4Description({ value, onChange, onNext, onBack }: Props) {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const parsed = step4Schema.safeParse(value);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Description invalide");
      return;
    }
    setError(null);
    onNext();
  };

  const charCount = value.description.length;

  return (
    <section>
      <div className="perso-section-header">
        <h1 className="perso-title">Présente ta boutique</h1>
        <p className="perso-subtitle">On a écrit une première version pour toi. Ajuste-la à ta voix.</p>
      </div>

      <div className="perso-card">
        <label htmlFor="description" className="perso-card-label perso-form-label-with-icon">
          <FileText size={14} strokeWidth={2} />
          À propos de ta boutique
        </label>
        <textarea
          id="description"
          value={value.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={10}
          maxLength={2000}
          className="perso-textarea"
        />
        <div className="perso-textarea-meta">
          <span>Visible sur la page d&apos;accueil de ta boutique</span>
          <span className={charCount > 1900 ? "perso-textarea-meta-warn" : ""}>{charCount} / 2000</span>
        </div>
      </div>

      {error && <div className="perso-alert-error perso-alert-error-inline">{error}</div>}

      <StepNav onBack={onBack} onNext={handleSubmit} nextLabel="Continuer" />
    </section>
  );
}
