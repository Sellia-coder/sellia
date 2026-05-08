"use client";

import { useState } from "react";
import { Sparkles, Loader2, Check, RotateCcw, AlertCircle } from "lucide-react";
import {
  AI_DESCRIPTION_TONES,
  type AiDescriptionTone,
} from "@/lib/validations/personnalisation";

interface Props {
  productName: string;
  productCategory?: string;
  productType: "physical" | "digital" | "service";
  shopName?: string | null;
  shopCategory?: string | null;
  onApply: (html: string) => void;
}

type Versions = Record<AiDescriptionTone, string>;

export default function AiDescriptionGenerator({
  productName,
  productCategory,
  productType,
  shopName,
  shopCategory,
  onApply,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<Versions | null>(null);
  const [selectedTone, setSelectedTone] = useState<AiDescriptionTone | null>(null);

  const canGenerate = productName.trim().length >= 1;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    setVersions(null);
    setSelectedTone(null);

    try {
      const res = await fetch("/api/ai/generate-product-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          productCategory,
          productType,
          shopName,
          shopCategory,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Erreur lors de la génération");
        return;
      }
      setVersions(data.versions as Versions);
      setSelectedTone("commerce");
    } catch (e) {
      console.error("[AiDescriptionGenerator]", e);
      setError("Connexion impossible. Réessaye.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!versions || !selectedTone) return;
    onApply(versions[selectedTone]);
    setVersions(null);
    setSelectedTone(null);
  };

  const handleDiscard = () => {
    setVersions(null);
    setSelectedTone(null);
  };

  return (
    <div className="perso-ai-block">
      <div className="perso-ai-header">
        <div>
          <div className="perso-ai-title">
            <Sparkles size={14} strokeWidth={2.2} />
            Rédige avec l&apos;IA
          </div>
          <div className="perso-ai-subtitle">
            On utilise le nom et la catégorie pour générer 3 styles distincts.
          </div>
        </div>
        <button
          type="button"
          className="perso-ai-btn"
          onClick={handleGenerate}
          disabled={loading || !canGenerate}
          title={!canGenerate ? "Renseigne d'abord le nom du produit" : undefined}
        >
          {loading ? (
            <>
              <Loader2
                size={14}
                strokeWidth={2.2}
                style={{ animation: "persoSpin 0.7s linear infinite" }}
              />
              Génération…
            </>
          ) : versions ? (
            <>
              <RotateCcw size={14} strokeWidth={2.2} />
              Régénérer
            </>
          ) : (
            <>
              <Sparkles size={14} strokeWidth={2.2} />
              Générer
            </>
          )}
        </button>
      </div>

      {!canGenerate && !loading && !versions && !error && (
        <div className="perso-ai-error" style={{ color: "#8B8E94" }}>
          <AlertCircle size={12} strokeWidth={2} />
          Renseigne d&apos;abord le nom du produit pour activer la génération.
        </div>
      )}

      {error && (
        <div className="perso-ai-error">
          <AlertCircle size={12} strokeWidth={2} />
          {error}
        </div>
      )}

      {loading && !versions && (
        <div className="perso-ai-loading">
          <Loader2
            size={16}
            strokeWidth={2}
            style={{
              animation: "persoSpin 0.7s linear infinite",
              color: "#E84B1F",
            }}
          />
          L&apos;IA prépare 3 versions… (5–15 secondes)
        </div>
      )}

      {versions && (
        <>
          <div className="perso-ai-versions">
            {AI_DESCRIPTION_TONES.map((t) => {
              const isSelected = selectedTone === t.code;
              return (
                <button
                  key={t.code}
                  type="button"
                  className={`perso-ai-version ${isSelected ? "is-selected" : ""}`}
                  onClick={() => setSelectedTone(t.code)}
                >
                  <div className="perso-ai-version-header">
                    <span className="perso-ai-version-emoji">{t.emoji}</span>
                    <div>
                      <div className="perso-ai-version-title">{t.label}</div>
                      <div className="perso-ai-version-desc-meta">{t.description}</div>
                    </div>
                    <div className="perso-ai-version-check">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  </div>
                  <div
                    className="perso-ai-version-text"
                    dangerouslySetInnerHTML={{ __html: versions[t.code] }}
                  />
                </button>
              );
            })}
          </div>

          {selectedTone && (
            <div className="perso-ai-version-actions">
              <button type="button" className="perso-ai-apply-btn" onClick={handleApply}>
                <Check size={12} strokeWidth={2.5} />
                Utiliser cette version
              </button>
              <button type="button" className="perso-ai-discard-btn" onClick={handleDiscard}>
                Ignorer
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
