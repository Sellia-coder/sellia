"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PartyPopper,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  Share2,
  MessageCircle,
  Facebook,
} from "lucide-react";
import "@/app/personnaliser-ma-boutique/personnalisation.css";

interface Props {
  shop: {
    id: string;
    slug: string;
    name: string;
    primaryColor: string | null;
    logoUrl: string | null;
  };
}

export default function CelebrationView({ shop }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const publicUrl = `https://${shop.slug}.getsellia.com`;
  const initial = (shop.name?.[0] ?? "S").toUpperCase();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="perso-celebration">
      <div className="perso-celebration-inner">
        <div
          className="perso-celebration-emoji"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#E84B1F",
          }}
        >
          <PartyPopper size={56} strokeWidth={1.5} />
        </div>

        <h1 className="perso-celebration-title">Ta boutique est en ligne</h1>
        <p className="perso-celebration-subtitle">
          Partage ce lien avec tes clients pour commencer à vendre dès maintenant.
        </p>

        <div className="perso-celebration-card">
          <div className="perso-celebration-shop">
            <div
              className="perso-celebration-shop-logo"
              style={{
                background: shop.logoUrl ? "transparent" : shop.primaryColor ?? "#E84B1F",
              }}
            >
              {shop.logoUrl ? (
                <img src={shop.logoUrl} alt="" />
              ) : (
                <span className="perso-celebration-shop-initial">{initial}</span>
              )}
            </div>
            <div>
              <div className="perso-celebration-shop-name">{shop.name}</div>
              <div className="perso-celebration-shop-url">{publicUrl}</div>
            </div>
          </div>

          <div className="perso-celebration-copy-row">
            <input
              readOnly
              value={publicUrl}
              className="perso-celebration-copy-input"
              onFocus={(e) => e.currentTarget.select()}
            />
            <button type="button" onClick={copy} className="perso-celebration-copy-btn">
              {copied ? (
                <>
                  <Check size={14} strokeWidth={2.5} /> Copié
                </>
              ) : (
                <>
                  <Copy size={14} strokeWidth={2} /> Copier
                </>
              )}
            </button>
          </div>
        </div>

        <div className="perso-celebration-actions">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="perso-btn perso-btn-secondary perso-btn-secondary-large perso-btn-icon"
          >
            <ExternalLink size={16} strokeWidth={2} />
            Voir ma boutique
          </a>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="perso-btn perso-btn-primary perso-btn-primary-large perso-btn-icon"
          >
            Aller au dashboard
            <ArrowRight size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="perso-celebration-share">
          <p
            className="perso-celebration-share-label"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Share2 size={11} strokeWidth={2} />
            Partage rapide
          </p>
          <div className="perso-celebration-share-buttons">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Découvre ma boutique en ligne : ${publicUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="perso-celebration-share-btn perso-celebration-share-btn-wa"
            >
              <MessageCircle size={14} strokeWidth={2} />
              WhatsApp
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="perso-celebration-share-btn perso-celebration-share-btn-fb"
            >
              <Facebook size={14} strokeWidth={2} />
              Facebook
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
