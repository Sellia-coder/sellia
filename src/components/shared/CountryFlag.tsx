"use client";

import styles from "./CountryFlag.module.css";

export type CountryCode =
  | "CM" | "CI" | "SN" | "CD" | "BJ" | "TG" | "BF" | "ML"
  | "GA" | "CG" | "NE" | "GN" | "RW" | "MA" | "ZA" | "FR" | "OTHER";

interface Props {
  code: string;
  size?: "sm" | "md" | "lg";
  rounded?: boolean;
  className?: string;
}

export const COUNTRY_NAMES: Record<string, string> = {
  CM: "Cameroun", CI: "Côte d'Ivoire", SN: "Sénégal", CD: "RDC",
  BJ: "Bénin", TG: "Togo", BF: "Burkina Faso", ML: "Mali",
  GA: "Gabon", CG: "Congo", NE: "Niger", GN: "Guinée",
  RW: "Rwanda", MA: "Maroc", ZA: "Afrique du Sud", FR: "France",
  OTHER: "Autre",
};

export default function CountryFlag({ code, size = "md", rounded = true, className }: Props) {
  return (
    <span
      className={`${styles.flag} ${styles[`flag_${size}`]} ${rounded ? styles.flagRounded : ""} ${className ?? ""}`}
      role="img"
      aria-label={`Drapeau ${COUNTRY_NAMES[code] ?? code}`}
    >
      {renderFlag(code)}
    </span>
  );
}

function renderFlag(code: string) {
  switch (code) {
    case "CM":
      return (
        <svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <rect x="0" y="0" width="20" height="40" fill="#007A5E"/>
          <rect x="20" y="0" width="20" height="40" fill="#CE1126"/>
          <rect x="40" y="0" width="20" height="40" fill="#FCD116"/>
          <polygon points="30,16 31.6,19.5 35.5,19.5 32.4,21.8 33.5,25.5 30,23.3 26.5,25.5 27.6,21.8 24.5,19.5 28.4,19.5" fill="#FCD116"/>
        </svg>
      );
    case "CI":
      return (
        <svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <rect x="0" y="0" width="20" height="40" fill="#F77F00"/>
          <rect x="20" y="0" width="20" height="40" fill="#FFFFFF"/>
          <rect x="40" y="0" width="20" height="40" fill="#009E60"/>
        </svg>
      );
    case "SN":
      return (
        <svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <rect x="0" y="0" width="20" height="40" fill="#00853F"/>
          <rect x="20" y="0" width="20" height="40" fill="#FCD116"/>
          <rect x="40" y="0" width="20" height="40" fill="#E31B23"/>
          <polygon points="30,16 31.6,19.5 35.5,19.5 32.4,21.8 33.5,25.5 30,23.3 26.5,25.5 27.6,21.8 24.5,19.5 28.4,19.5" fill="#00853F"/>
        </svg>
      );
    case "CD":
      return (
        <svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <rect x="0" y="0" width="60" height="40" fill="#007FFF"/>
          <polygon points="0,0 60,40 60,32 0,0" fill="#CE1021"/>
          <polygon points="0,8 60,40 0,40" fill="#CE1021"/>
          <rect x="0" y="0" width="60" height="3" fill="#F7D618"/>
          <polygon points="0,0 60,37 60,40 0,3" fill="none" stroke="#F7D618" strokeWidth="3"/>
          <polygon points="8,4 9.6,8.8 14.5,8.8 10.5,11.8 12,16.5 8,13.3 4,16.5 5.5,11.8 1.5,8.8 6.4,8.8" fill="#F7D618"/>
        </svg>
      );
    case "BJ":
      return (
        <svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <rect x="0" y="0" width="22" height="40" fill="#008751"/>
          <rect x="22" y="0" width="38" height="20" fill="#FCD116"/>
          <rect x="22" y="20" width="38" height="20" fill="#E8112D"/>
        </svg>
      );
    case "TG":
      return (
        <svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <rect x="0" y="0" width="60" height="8" fill="#006A4E"/>
          <rect x="0" y="8" width="60" height="8" fill="#FFCE00"/>
          <rect x="0" y="16" width="60" height="8" fill="#006A4E"/>
          <rect x="0" y="24" width="60" height="8" fill="#FFCE00"/>
          <rect x="0" y="32" width="60" height="8" fill="#006A4E"/>
          <rect x="0" y="0" width="24" height="24" fill="#D21034"/>
          <polygon points="12,6 13.6,10 18,10 14.5,12.5 15.8,16.5 12,14 8.2,16.5 9.5,12.5 6,10 10.4,10" fill="#FFFFFF"/>
        </svg>
      );
    case "BF":
      return (
        <svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <rect x="0" y="0" width="60" height="20" fill="#EF2B2D"/>
          <rect x="0" y="20" width="60" height="20" fill="#009E49"/>
          <polygon points="30,14 32.4,19.3 38.2,19.3 33.5,22.7 35.3,28 30,24.6 24.7,28 26.5,22.7 21.8,19.3 27.6,19.3" fill="#FCD116"/>
        </svg>
      );
    case "ML":
      return (
        <svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <rect x="0" y="0" width="20" height="40" fill="#14B53A"/>
          <rect x="20" y="0" width="20" height="40" fill="#FCD116"/>
          <rect x="40" y="0" width="20" height="40" fill="#CE1126"/>
        </svg>
      );
    case "GA":
      return (
        <svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <rect x="0" y="0" width="60" height="13.3" fill="#009E60"/>
          <rect x="0" y="13.3" width="60" height="13.3" fill="#FCD116"/>
          <rect x="0" y="26.6" width="60" height="13.4" fill="#3A75C4"/>
        </svg>
      );
    case "CG":
      return (
        <svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <rect x="0" y="0" width="60" height="40" fill="#FBDE4A"/>
          <polygon points="0,0 60,0 0,40" fill="#009543"/>
          <polygon points="60,0 60,40 0,40" fill="#DC241F"/>
        </svg>
      );
    case "NE":
      return (
        <svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <rect x="0" y="0" width="60" height="13.3" fill="#E05206"/>
          <rect x="0" y="13.3" width="60" height="13.3" fill="#FFFFFF"/>
          <rect x="0" y="26.6" width="60" height="13.4" fill="#0DB02B"/>
          <circle cx="30" cy="20" r="4.5" fill="#E05206"/>
        </svg>
      );
    case "GN":
      return (
        <svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <rect x="0" y="0" width="20" height="40" fill="#CE1126"/>
          <rect x="20" y="0" width="20" height="40" fill="#FCD116"/>
          <rect x="40" y="0" width="20" height="40" fill="#009460"/>
        </svg>
      );
    case "RW":
      return (
        <svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <rect x="0" y="0" width="60" height="20" fill="#00A1DE"/>
          <rect x="0" y="20" width="60" height="10" fill="#FAD201"/>
          <rect x="0" y="30" width="60" height="10" fill="#20603D"/>
          <circle cx="48" cy="10" r="4.5" fill="#E5BE01"/>
        </svg>
      );
    case "MA":
      return (
        <svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <rect x="0" y="0" width="60" height="40" fill="#C1272D"/>
          <polygon points="30,12 32.1,18.8 39,18.8 33.5,22.9 35.5,29.7 30,25.6 24.5,29.7 26.5,22.9 21,18.8 27.9,18.8" fill="none" stroke="#006233" strokeWidth="1.5"/>
        </svg>
      );
    case "ZA":
      return (
        <svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <rect x="0" y="0" width="60" height="40" fill="#DE3831"/>
          <polygon points="0,40 60,40 60,21 25,21" fill="#002395"/>
          <polygon points="0,0 60,0 60,19 25,19" fill="#DE3831"/>
          <polygon points="0,0 25,20 0,40" fill="#000000"/>
          <polygon points="0,2 22,20 0,38" fill="#FFB81C"/>
          <polygon points="0,7 18,20 0,33" fill="#007749"/>
          <rect x="0" y="17" width="60" height="6" fill="#FFFFFF"/>
          <polygon points="0,18 60,18 60,22 24,22" fill="#007749"/>
        </svg>
      );
    case "FR":
      return (
        <svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <rect x="0" y="0" width="20" height="40" fill="#0055A4"/>
          <rect x="20" y="0" width="20" height="40" fill="#FFFFFF"/>
          <rect x="40" y="0" width="20" height="40" fill="#EF4135"/>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <rect x="0" y="0" width="60" height="40" fill="#E5E2DA" rx="2"/>
          <circle cx="30" cy="20" r="10" fill="#C5C2BA"/>
        </svg>
      );
  }
}
