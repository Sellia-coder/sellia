import React from "react";

type OperatorName = "mtn" | "orange" | "wave" | "moov" | "airtel";

const LABELS: Record<OperatorName, string> = {
  mtn: "MTN MoMo",
  orange: "Orange Money",
  wave: "Wave",
  moov: "Moov Money",
  airtel: "Airtel Money",
};

interface MomoLogoProps {
  name: OperatorName;
  size?: number;
  className?: string;
}

export function MomoLogo({ name, size = 40, className }: MomoLogoProps) {
  return (
    <img
      src={`/images/momo/${name}.png`}
      alt={LABELS[name]}
      title={LABELS[name]}
      className={className}
      style={{
        height: size,
        width: "auto",
        objectFit: "contain",
        display: "block",
      }}
    />
  );
}

interface MomoLogosBarProps {
  size?: number;
  gap?: number;
  className?: string;
}

export function MomoLogosBar({
  size = 36,
  gap = 10,
  className,
}: MomoLogosBarProps) {
  const operators: OperatorName[] = [
    "mtn",
    "orange",
    "wave",
    "moov",
    "airtel",
  ];

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap,
        flexWrap: "wrap",
      }}
    >
      {operators.map((op) => (
        <MomoLogo key={op} name={op} size={size} />
      ))}
    </div>
  );
}

export const MtnMomoIcon = ({ size }: { size?: number }) => (
  <MomoLogo name="mtn" size={size} />
);
export const OrangeMoneyIcon = ({ size }: { size?: number }) => (
  <MomoLogo name="orange" size={size} />
);
export const WaveIcon = ({ size }: { size?: number }) => (
  <MomoLogo name="wave" size={size} />
);
export const MoovMoneyIcon = ({ size }: { size?: number }) => (
  <MomoLogo name="moov" size={size} />
);
export const AirtelMoneyIcon = ({ size }: { size?: number }) => (
  <MomoLogo name="airtel" size={size} />
);

export function VisaIcon({ size = 40 }: { size?: number }) {
  return (
    <div
      style={{
        width: size * 1.6,
        height: size,
        background: "#FFFFFF",
        border: "1px solid #ECE9E2",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#1A1F71",
        fontFamily: "Arial, sans-serif",
        fontWeight: 900,
        fontStyle: "italic",
        fontSize: size * 0.42,
        letterSpacing: 1,
      }}
    >
      VISA
    </div>
  );
}

export function MastercardIcon({ size = 40 }: { size?: number }) {
  return (
    <div
      style={{
        width: size * 1.6,
        height: size,
        background: "#FFFFFF",
        border: "1px solid #ECE9E2",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: size * 0.15,
      }}
    >
      <div
        style={{
          width: size * 0.5,
          height: size * 0.5,
          background: "#EB001B",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          width: size * 0.5,
          height: size * 0.5,
          background: "#F79E1B",
          borderRadius: "50%",
          marginLeft: -size * 0.2,
        }}
      />
    </div>
  );
}

export function PaymentMethodsGrid({
  size = 36,
}: {
  size?: number;
  variant?: "compact" | "full";
}) {
  return <MomoLogosBar size={size} />;
}
