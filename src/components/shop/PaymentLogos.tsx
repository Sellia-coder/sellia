"use client";

interface Props {
  showCashOnDelivery?: boolean;
  size?: "sm" | "md";
}

export default function PaymentLogos({
  showCashOnDelivery = false,
  size = "md",
}: Props) {
  const sizeClass = size === "sm" ? "shop-pay-logo-sm" : "";

  return (
    <div className={`shop-pay-logos ${sizeClass}`}>
      <div className="shop-pay-logo" aria-label="Visa">
        <svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="32" rx="4" fill="#FFFFFF" stroke="#E5E2DA" />
          <text
            x="24"
            y="21"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontSize="13"
            fontWeight="900"
            fill="#1A1F71"
            letterSpacing="-0.5"
          >
            VISA
          </text>
        </svg>
      </div>

      <div className="shop-pay-logo" aria-label="Mastercard">
        <svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="32" rx="4" fill="#FFFFFF" stroke="#E5E2DA" />
          <circle cx="20" cy="16" r="7" fill="#EB001B" />
          <circle cx="28" cy="16" r="7" fill="#F79E1B" />
          <path
            d="M24 10.4c1.6 1.4 2.6 3.4 2.6 5.6s-1 4.2-2.6 5.6c-1.6-1.4-2.6-3.4-2.6-5.6s1-4.2 2.6-5.6z"
            fill="#FF5F00"
          />
        </svg>
      </div>

      <div className="shop-pay-logo" aria-label="MTN Mobile Money">
        <svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="32" rx="4" fill="#FFCC00" />
          <text
            x="24"
            y="14"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontSize="9"
            fontWeight="900"
            fill="#0066B3"
            letterSpacing="-0.3"
          >
            MTN
          </text>
          <text
            x="24"
            y="24"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontSize="7"
            fontWeight="700"
            fill="#0066B3"
          >
            MoMo
          </text>
        </svg>
      </div>

      <div className="shop-pay-logo" aria-label="Orange Money">
        <svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="32" rx="4" fill="#FFFFFF" stroke="#E5E2DA" />
          <rect x="4" y="6" width="40" height="20" rx="2" fill="#FF7900" />
          <text
            x="24"
            y="19"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontSize="8"
            fontWeight="900"
            fill="#FFFFFF"
            letterSpacing="0.5"
          >
            ORANGE
          </text>
        </svg>
      </div>

      <div className="shop-pay-logo" aria-label="Wave">
        <svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="32" rx="4" fill="#1DCFFF" />
          <path
            d="M8 18 Q12 10, 16 18 T24 18 T32 18 T40 18"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <text
            x="24"
            y="26"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontSize="6"
            fontWeight="900"
            fill="#FFFFFF"
            letterSpacing="1"
          >
            WAVE
          </text>
        </svg>
      </div>

      <div className="shop-pay-logo" aria-label="Airtel Money">
        <svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="32" rx="4" fill="#ED1C24" />
          <text
            x="24"
            y="14"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontSize="8"
            fontWeight="900"
            fill="#FFFFFF"
            letterSpacing="0.5"
          >
            AIRTEL
          </text>
          <text
            x="24"
            y="24"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontSize="7"
            fontWeight="700"
            fill="#FFFFFF"
          >
            Money
          </text>
        </svg>
      </div>

      {showCashOnDelivery && (
        <div className="shop-pay-logo shop-pay-logo-cash" aria-label="Paiement à la livraison">
          <svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="32" rx="4" fill="#16A34A" />
            <text
              x="24"
              y="20"
              textAnchor="middle"
              fontFamily="Arial, sans-serif"
              fontSize="8"
              fontWeight="900"
              fill="#FFFFFF"
              letterSpacing="0.3"
            >
              CASH
            </text>
          </svg>
        </div>
      )}
    </div>
  );
}
