"use client";

import styles from "./PaymentLogos.module.css";

export type PaymentMethod =
  | "visa"
  | "mastercard"
  | "wave"
  | "mtn_momo"
  | "orange_money"
  | "tmoney"
  | "vodafone_cash"
  | "free_money"
  | "airtel_money"
  | "moov_money"
  | "celtiis_cash"
  | "tigo_cash";

interface Props {
  methods?: PaymentMethod[];
  size?: "sm" | "md" | "lg";
  variant?: "circle" | "rounded";
  className?: string;
}

const DEFAULT_METHODS: PaymentMethod[] = [
  "visa", "mastercard", "wave", "mtn_momo", "orange_money", "tmoney",
  "vodafone_cash", "free_money", "airtel_money", "moov_money", "celtiis_cash", "tigo_cash",
];

export default function PaymentLogos({
  methods = DEFAULT_METHODS,
  size = "md",
  variant = "circle",
  className,
}: Props) {
  return (
    <div className={`${styles.paymentLogos} ${styles[`paymentLogos_${size}`]} ${className ?? ""}`}>
      {methods.map((m) => (
        <PaymentLogo key={m} method={m} size={size} variant={variant} />
      ))}
    </div>
  );
}

interface SingleProps {
  method: PaymentMethod;
  size?: "sm" | "md" | "lg";
  variant?: "circle" | "rounded";
}

export function PaymentLogo({ method, size = "md", variant = "circle" }: SingleProps) {
  const wrapperClass = `${styles.logo} ${styles[`logo_${size}`]} ${styles[`logo_${variant}`]}`;

  switch (method) {
    case "visa":
      return (
        <div className={wrapperClass} style={{ backgroundColor: "#FFFFFF" }} aria-label="Visa" title="Visa">
          <svg viewBox="0 0 48 16" xmlns="http://www.w3.org/2000/svg" fill="none">
            <path d="M19.9 0.5L17.3 15.5H13.7L16.3 0.5H19.9Z" fill="#1A1F71"/>
            <path d="M32 0.9C31.3 0.6 30.2 0.3 28.9 0.3C25.6 0.3 23.3 2.1 23.3 4.7C23.3 6.6 25 7.7 26.3 8.3C27.6 8.9 28 9.3 28 9.9C28 10.8 26.9 11.2 25.9 11.2C24.5 11.2 23.7 11 22.5 10.5L22 10.3L21.5 13.6C22.4 14 24 14.4 25.7 14.4C29.2 14.4 31.5 12.7 31.5 9.9C31.5 8.4 30.6 7.2 28.5 6.3C27.2 5.7 26.5 5.3 26.5 4.6C26.5 4 27.1 3.5 28.5 3.5C29.6 3.5 30.5 3.7 31.1 4L31.5 4.2L32 0.9Z" fill="#1A1F71"/>
            <path d="M37.8 0.5H40.4C41.2 0.5 41.8 0.7 42.2 1.6L46.7 15.5H43.2L42.5 13.3H37.7L36.9 15.5H33.4L37.8 0.5ZM41.5 10.5L40.2 5.4L38.8 10.5H41.5Z" fill="#1A1F71"/>
            <path d="M10.7 0.5L7.3 10.7L7 9C6.3 6.8 4.4 4.4 2.2 3.2L5.4 15.4H9L14.3 0.5H10.7Z" fill="#1A1F71"/>
          </svg>
        </div>
      );
    case "mastercard":
      return (
        <div className={wrapperClass} style={{ backgroundColor: "#FFFFFF" }} aria-label="Mastercard" title="Mastercard">
          <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="13" cy="12" r="9" fill="#EB001B"/>
            <circle cx="23" cy="12" r="9" fill="#F79E1B"/>
            <path d="M18 5.2C16.2 6.8 15 9.3 15 12C15 14.7 16.2 17.2 18 18.8C19.8 17.2 21 14.7 21 12C21 9.3 19.8 6.8 18 5.2Z" fill="#FF5F00"/>
          </svg>
        </div>
      );
    case "wave":
      return (
        <div className={wrapperClass} style={{ backgroundColor: "#1DC8FF" }} aria-label="Wave" title="Wave">
          <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="20" cy="14" rx="6" ry="4" fill="#FFFFFF"/>
            <circle cx="17" cy="13" r="1.2" fill="#0A0E13"/>
            <circle cx="22" cy="13" r="1.2" fill="#0A0E13"/>
            <path d="M14 16 Q20 19 26 16 L26 20 Q22 23 20 23 Q18 23 14 20 Z" fill="#FFA500"/>
            <ellipse cx="20" cy="28" rx="8" ry="5" fill="#FFFFFF"/>
            <rect x="15" y="26" width="10" height="6" fill="#FFFFFF"/>
          </svg>
        </div>
      );
    case "mtn_momo":
      return (
        <div className={wrapperClass} style={{ backgroundColor: "#FFCC00" }} aria-label="MTN Mobile Money" title="MTN MoMo">
          <svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="30" cy="15" rx="22" ry="11" fill="none" stroke="#0A0E13" strokeWidth="1.5"/>
            <text x="30" y="20" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="11" fontWeight="900" fill="#0A0E13">MTN</text>
          </svg>
        </div>
      );
    case "orange_money":
      return (
        <div className={wrapperClass} style={{ backgroundColor: "#FF6900" }} aria-label="Orange Money" title="Orange Money">
          <svg viewBox="0 0 60 28" xmlns="http://www.w3.org/2000/svg">
            <text x="30" y="19" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="13" fontWeight="900" fill="#FFFFFF">orange</text>
          </svg>
        </div>
      );
    case "tmoney":
      return (
        <div className={wrapperClass} style={{ backgroundColor: "#FFCC00" }} aria-label="T-Money" title="T-Money">
          <svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
            <text x="30" y="14" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="900" fill="#E30613" letterSpacing="-0.5">T</text>
            <text x="30" y="14" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="900" fill="#E30613" dx="5">M</text>
            <text x="30" y="24" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="700" fill="#0A0E13">oney</text>
          </svg>
        </div>
      );
    case "vodafone_cash":
      return (
        <div className={wrapperClass} style={{ backgroundColor: "#E60000" }} aria-label="Vodafone Cash" title="Vodafone Cash">
          <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="14" fill="none" stroke="#FFFFFF" strokeWidth="2.5"/>
            <path d="M20 8 Q24 14 24 20 Q24 26 20 32 Q16 26 16 20 Q16 14 20 8 Z" fill="#FFFFFF"/>
          </svg>
        </div>
      );
    case "free_money":
      return (
        <div className={wrapperClass} style={{ backgroundColor: "#FFFFFF" }} aria-label="Free Money" title="Free Money">
          <svg viewBox="0 0 64 30" xmlns="http://www.w3.org/2000/svg">
            <text x="32" y="14" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="9" fontWeight="900" fill="#E30613" fontStyle="italic">free</text>
            <text x="32" y="24" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="8" fontWeight="900" fill="#0A0E13" letterSpacing="0.5">MONEY</text>
          </svg>
        </div>
      );
    case "airtel_money":
      return (
        <div className={wrapperClass} style={{ backgroundColor: "#E40718" }} aria-label="Airtel Money" title="Airtel Money">
          <svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="15" r="5" fill="#FFFFFF"/>
            <text x="34" y="20" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="11" fontWeight="900" fill="#FFFFFF">airtel</text>
          </svg>
        </div>
      );
    case "moov_money":
      return (
        <div className={wrapperClass} style={{ backgroundColor: "#005DAA" }} aria-label="Moov Money" title="Moov Money">
          <svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
            <rect x="22" y="8" width="16" height="14" fill="#F47920" transform="rotate(45 30 15)"/>
            <text x="30" y="18" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="8" fontWeight="900" fill="#FFFFFF">MOOV</text>
          </svg>
        </div>
      );
    case "celtiis_cash":
      return (
        <div className={wrapperClass} style={{ backgroundColor: "#1F4E79" }} aria-label="Celtiis Cash" title="Celtiis Cash">
          <svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
            <text x="30" y="14" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="900" fill="#FFFFFF">My</text>
            <text x="30" y="22" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="9" fontWeight="900" fill="#7DCD3D">celtiis</text>
          </svg>
        </div>
      );
    case "tigo_cash":
      return (
        <div className={wrapperClass} style={{ backgroundColor: "#4F2D7F" }} aria-label="Tigo Cash" title="Tigo Cash">
          <svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
            <text x="30" y="20" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="13" fontWeight="900" fill="#FFFFFF" fontStyle="italic">tigo</text>
            <circle cx="40" cy="11" r="2" fill="#FFFFFF"/>
          </svg>
        </div>
      );
    default:
      return null;
  }
}
