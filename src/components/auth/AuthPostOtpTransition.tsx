"use client";

import { useEffect, useState } from "react";
import { Check } from "@phosphor-icons/react";
import styles from "./auth-post-otp-transition.module.css";

const STEPS = [
  "Validation de votre compte",
  "Initialisation de votre boutique",
  "Préparation de la personnalisation",
] as const;

export default function AuthPostOtpTransition() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const t1 = window.setTimeout(() => setActiveStep(1), 180);
    const t2 = window.setTimeout(() => setActiveStep(2), 380);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  return (
    <div className={styles.overlay} role="status" aria-live="polite">
      <div className={styles.inner}>
        <div className={styles.visual} aria-hidden>
          <div className={styles.glow} />
          <svg className={styles.ring} viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="rgba(14,17,22,0.06)"
              strokeWidth="4"
            />
            <circle
              className={styles.ringArc}
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#E84B1F"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="220 110"
            />
          </svg>
          <div className={styles.logoMark}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 4 L14 4 L18 8 L18 20 L4 20 Z" fill="#0E1116" />
              <path
                d="M14 11 L9 11 L9 14 L14 14 L14 17 L9 17"
                stroke="#E84B1F"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="square"
              />
            </svg>
          </div>
        </div>

        <h1 className={styles.title}>On finalise votre espace</h1>
        <p className={styles.subtitle}>Encore quelques instants…</p>

        <ol className={styles.steps}>
          {STEPS.map((label, i) => {
            const done = i < activeStep;
            const active = i === activeStep;
            return (
              <li
                key={label}
                className={`${styles.step} ${done ? styles.stepDone : ""} ${
                  active ? styles.stepActive : ""
                }`}
              >
                <span className={styles.stepIcon}>
                  {done ? (
                    <Check size={14} weight="bold" />
                  ) : active ? (
                    <span className={styles.stepPulse} />
                  ) : (
                    <span className={styles.stepDot} />
                  )}
                </span>
                <span className={styles.stepLabel}>{label}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
