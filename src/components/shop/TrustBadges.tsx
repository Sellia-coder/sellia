"use client";

import { ShieldCheck, RefreshCw, UserCheck, Truck } from "lucide-react";

interface Props {
  shippingEta?: string | null;
  hasEscrow?: boolean;
}

export default function TrustBadges({
  shippingEta,
  hasEscrow = true,
}: Props) {
  return (
    <div className="shop-trust-badges">
      {hasEscrow && (
        <>
          <div className="shop-trust-badge">
            <div className="shop-trust-badge-icon">
              <ShieldCheck size={18} strokeWidth={1.8} />
            </div>
            <div className="shop-trust-badge-content">
              <div className="shop-trust-badge-title">Paiement 100% sécurisé</div>
              <div className="shop-trust-badge-desc">Fonds protégés par Sellia</div>
            </div>
          </div>

          <div className="shop-trust-badge">
            <div className="shop-trust-badge-icon">
              <RefreshCw size={18} strokeWidth={1.8} />
            </div>
            <div className="shop-trust-badge-content">
              <div className="shop-trust-badge-title">Remboursement automatique</div>
              <div className="shop-trust-badge-desc">Si non livré sous 6 jours</div>
            </div>
          </div>

          <div className="shop-trust-badge">
            <div className="shop-trust-badge-icon">
              <UserCheck size={18} strokeWidth={1.8} />
            </div>
            <div className="shop-trust-badge-content">
              <div className="shop-trust-badge-title">Protection acheteur</div>
              <div className="shop-trust-badge-desc">Garantie Sellia activée</div>
            </div>
          </div>
        </>
      )}

      {shippingEta && (
        <div className="shop-trust-badge">
          <div className="shop-trust-badge-icon">
            <Truck size={18} strokeWidth={1.8} />
          </div>
          <div className="shop-trust-badge-content">
            <div className="shop-trust-badge-title">Livraison sous {shippingEta}</div>
            <div className="shop-trust-badge-desc">Selon ta zone</div>
          </div>
        </div>
      )}
    </div>
  );
}
