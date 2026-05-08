"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

interface Props {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}

export default function StepNav({
  onBack,
  onNext,
  nextLabel = "Continuer",
  nextDisabled,
}: Props) {
  return (
    <div className="perso-step-nav">
      {onBack && (
        <button type="button" onClick={onBack} className="perso-btn perso-btn-secondary perso-btn-icon">
          <ArrowLeft size={16} strokeWidth={2} />
          Retour
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="perso-btn perso-btn-primary perso-btn-icon perso-step-nav-spacer"
      >
        {nextLabel}
        <ArrowRight size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
