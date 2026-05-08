"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface Step {
  id: string;
  label: string;
  detail: string;
  duration: number;
}

const STEPS: Step[] = [
  { id: "analyze", label: "Analyse de votre activité", detail: "Compréhension du marché et de la cible", duration: 1200 },
  { id: "brand", label: "Création de votre identité visuelle", detail: "Palette, typographie, ton de marque", duration: 1400 },
  { id: "structure", label: "Architecture de votre boutique", detail: "Pages, navigation, parcours d'achat", duration: 1100 },
  { id: "products", label: "Génération des fiches produits", detail: "Descriptions optimisées et photos", duration: 1500 },
  { id: "payments", label: "Configuration des paiements", detail: "Mobile Money, cartes, sécurisation", duration: 1000 },
  { id: "delivery", label: "Mise en place de la livraison", detail: "Zones, tarifs, intégrations partenaires", duration: 900 },
  { id: "seo", label: "Optimisation pour Google", detail: "SEO, métadonnées, performances", duration: 800 },
  { id: "finalize", label: "Finalisation et déploiement", detail: "Mise en ligne sécurisée", duration: 700 },
];

function GenerationContent() {
  const searchParams = useSearchParams();
  const draftShopId = searchParams.get("id");
  const fallbackDescription = searchParams.get("description") || "";
  const fallbackName = searchParams.get("name") || "Ma boutique";

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepProgress, setStepProgress] = useState(0);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [aiStatus, setAiStatus] = useState<"pending" | "ready" | "failed" | "expired">("pending");
  const [aiError, setAiError] = useState<string | null>(null);
  const [draftShopName, setDraftShopName] = useState<string | null>(null);
  const totalDuration = useRef(STEPS.reduce((sum, s) => sum + s.duration, 0));

  // Nom saisi sur la landing (disponible tant que le draft API est encore pending)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const cached = localStorage.getItem("sellia_shop_name");
    if (cached) setDraftShopName(cached);
  }, []);

  // Récupérer le vrai shopName depuis le draft (réussi quand la génération est ready)
  useEffect(() => {
    if (!draftShopId) return;

    let isMounted = true;
    const fetchShopName = async () => {
      try {
        const response = await fetch(`/api/shop/draft/${draftShopId}`);
        const result = await response.json();

        if (!isMounted) return;

        if (result.success && result.data?.shopName) {
          setDraftShopName(result.data.shopName);
        }
      } catch (err) {
        console.error("[generation] fetch shopName error:", err);
      }
    };

    fetchShopName();

    return () => {
      isMounted = false;
    };
  }, [draftShopId]);

  // Sans draft ID (anciens liens) : pas de polling, on considère l'IA OK pour la redirection legacy
  useEffect(() => {
    if (!draftShopId) {
      setAiStatus("ready");
    }
  }, [draftShopId]);

  // Simulation progressive
  useEffect(() => {
    if (currentStep >= STEPS.length) {
      setIsComplete(true);
      return;
    }

    const step = STEPS[currentStep];
    const startTime = Date.now();
    let rafId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / step.duration, 1);
      setStepProgress(progress * 100);

      // Calcul du progress global
      const previousDuration = STEPS.slice(0, currentStep).reduce((sum, s) => sum + s.duration, 0);
      const currentDuration = step.duration * progress;
      setGlobalProgress(((previousDuration + currentDuration) / totalDuration.current) * 100);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setCompletedSteps((prev) => new Set(prev).add(currentStep));
        setStepProgress(0);
        setCurrentStep((prev) => prev + 1);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [currentStep]);

  // Polling du statut de la génération IA en parallèle de l'animation
  useEffect(() => {
    if (!draftShopId) {
      return;
    }

    let isMounted = true;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/shop/status/${draftShopId}`);
        const result = await response.json();

        if (!isMounted) return;

        if (!result.success) {
          if (response.status === 410) {
            setAiStatus("expired");
          } else if (response.status === 404) {
            setAiError("Boutique introuvable. Recommencez.");
            setAiStatus("failed");
          } else {
            setAiError(result.error || "Erreur de vérification.");
            setAiStatus("failed");
          }
          return;
        }

        if (result.status === "ready") {
          setAiStatus("ready");
          return;
        }

        if (result.status === "failed") {
          setAiError(result.errorMessage || "Échec de la génération.");
          setAiStatus("failed");
          return;
        }

        pollTimer = setTimeout(pollStatus, 1500);
      } catch (err) {
        console.error("[polling] Error:", err);
        if (isMounted) {
          pollTimer = setTimeout(pollStatus, 3000);
        }
      }
    };

    pollTimer = setTimeout(pollStatus, 1000);

    return () => {
      isMounted = false;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [draftShopId]);

  // Redirection finale : quand l'animation est finie ET que l'IA a fini
  useEffect(() => {
    if (!isComplete) return;

    if (aiStatus === "ready") {
      if (draftShopId) {
        const redirect = setTimeout(() => {
          window.location.href = `/apercu?id=${draftShopId}`;
        }, 600);
        return () => clearTimeout(redirect);
      }
      const redirect = setTimeout(() => {
        const params = new URLSearchParams({
          description: fallbackDescription,
          name: fallbackName,
        });
        window.location.href = `/apercu?${params.toString()}`;
      }, 600);
      return () => clearTimeout(redirect);
    }
  }, [isComplete, aiStatus, draftShopId, fallbackDescription, fallbackName]);

  return (
    <div className="gen-light-page">
      {/* Background subtil */}
      <div className="gen-light-bg">
        <div className="gen-light-glow"></div>
        <div className="gen-light-grid"></div>
      </div>

      {/* Logo */}
      <a href="/" className="gen-light-logo" aria-label="Sellia">
        <svg width="124" height="34" viewBox="0 0 220 60" fill="none">
          <path d="M 8 8 L 38 8 L 54 24 L 54 54 L 8 54 Z" fill="#0E1116"/>
          <circle cx="16" cy="16" r="2.4" fill="#FAFAF7"/>
          <path d="M 38 30 L 24 30 L 24 36 L 38 36 L 38 44 L 24 44" stroke="#E84B1F" strokeWidth="2.6" fill="none" strokeLinecap="square"/>
          <text x="68" y="44" fontFamily="Inter, system-ui, sans-serif" fontSize="32" fontWeight="600" fill="#0E1116" letterSpacing="-1.2">sellia</text>
        </svg>
      </a>

      <div className="gen-light-container">
        {/* Header */}
        <div className="gen-light-header">
          <div className="gen-light-eyebrow">
            <span className="gen-light-eyebrow-pulse"></span>
            <span>Génération en cours</span>
          </div>
          <h1 className="gen-light-title">
            On construit <em>{draftShopName || fallbackName || "votre boutique"}</em>
          </h1>
          <p className="gen-light-subtitle">
            Sellia analyse votre activité et compose votre boutique sur mesure. Cela prend quelques secondes.
          </p>
        </div>

        {/* Progress global */}
        <div className="gen-light-progress">
          <div className="gen-light-progress-track">
            <div
              className="gen-light-progress-fill"
              style={{ width: `${globalProgress}%` }}
            />
          </div>
          <div className="gen-light-progress-meta">
            <span className="gen-light-progress-label">Progression</span>
            <span className="gen-light-progress-value">{Math.round(globalProgress)}%</span>
          </div>
        </div>

        {/* Steps list */}
        <div className="gen-light-steps">
          {STEPS.map((step, index) => {
            const isDone = completedSteps.has(index);
            const isActive = index === currentStep && !isComplete;
            const isPending = index > currentStep;

            return (
              <div
                key={step.id}
                className={`gen-step ${isDone ? "is-done" : ""} ${isActive ? "is-active" : ""} ${isPending ? "is-pending" : ""}`}
              >
                <div className="gen-step-icon">
                  {isDone && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                  {isActive && (
                    <div className="gen-step-spinner"></div>
                  )}
                  {isPending && (
                    <span className="gen-step-num">{String(index + 1).padStart(2, "0")}</span>
                  )}
                </div>

                <div className="gen-step-content">
                  <div className="gen-step-label">{step.label}</div>
                  <div className="gen-step-detail">{step.detail}</div>
                </div>

                {isActive && (
                  <div className="gen-step-progress">
                    <div
                      className="gen-step-progress-fill"
                      style={{ width: `${stepProgress}%` }}
                    />
                  </div>
                )}
                {isDone && (
                  <span className="gen-step-status">Terminé</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="gen-light-footer">
          <div className="gen-light-info-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>~ 8 secondes restantes</span>
          </div>
          <div className="gen-light-info-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Sécurisé · TLS 1.3</span>
          </div>
        </div>
      </div>

      {isComplete && aiStatus === "pending" && (
        <div
          style={{
            position: "fixed",
            bottom: "32px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(14,17,22,0.9)",
            color: "#FAFAF7",
            padding: "12px 20px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 500,
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            zIndex: 1000,
          }}
        >
          <span>✨ Sellia met la dernière touche...</span>
        </div>
      )}

      {aiStatus === "failed" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#FAFAF7",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "400px",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚠️</div>
            <h2 style={{ fontFamily: "Fraunces, serif", fontSize: "24px", marginBottom: "12px", color: "#0E1116" }}>
              Génération échouée
            </h2>
            <p style={{ fontSize: "14px", color: "#404552", marginBottom: "24px", lineHeight: 1.5 }}>
              {aiError || "Une erreur est survenue. Veuillez réessayer."}
            </p>
            <a
              href="/"
              style={{
                display: "inline-block",
                background: "#E84B1F",
                color: "#FFFFFF",
                padding: "12px 24px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Recommencer
            </a>
          </div>
        </div>
      )}

      {aiStatus === "expired" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#FAFAF7",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "400px",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏱️</div>
            <h2 style={{ fontFamily: "Fraunces, serif", fontSize: "24px", marginBottom: "12px", color: "#0E1116" }}>
              Lien expiré
            </h2>
            <p style={{ fontSize: "14px", color: "#404552", marginBottom: "24px", lineHeight: 1.5 }}>
              Cette boutique générée a expiré (24h). Recommencez la génération.
            </p>
            <a
              href="/"
              style={{
                display: "inline-block",
                background: "#E84B1F",
                color: "#FFFFFF",
                padding: "12px 24px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Recommencer
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GenerationPage() {
  return (
    <Suspense fallback={<div className="gen-light-page"><div className="gen-light-spinner-fallback" /></div>}>
      <GenerationContent />
    </Suspense>
  );
}
