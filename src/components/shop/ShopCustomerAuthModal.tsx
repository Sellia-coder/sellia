"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Package, LogOut, ShieldCheck } from "lucide-react";
import {
  DISPUTE_REASONS,
  DISPUTE_STATUS_LABELS,
  type DisputeReason,
  type DisputeStatus,
} from "@/lib/disputes/constants";
import styles from "./ShopCustomerAuth.module.css";

type Step = "email" | "code" | "orders";

interface OrderRow {
  id: string;
  orderNumber: string;
  total: number;
  paymentStatus: string;
  status: string;
  createdAt: string;
  dispute: {
    id: string;
    status: string;
    reason: string;
    merchantResponse: string | null;
    adminResolution: string | null;
    resolvedAt: string | null;
  } | null;
}

interface Props {
  shopSlug: string;
  shopName: string;
  primaryColor?: string;
  onClose: () => void;
}

export default function ShopCustomerAuthModal({
  shopSlug,
  shopName,
  primaryColor = "#E84B1F",
  onClose,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [currency, setCurrency] = useState("XAF");
  const [disputeOrderId, setDisputeOrderId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState<DisputeReason>("NOT_RECEIVED");
  const [disputeDesc, setDisputeDesc] = useState("");

  const loadOrders = useCallback(async () => {
    const res = await fetch(`/api/shop/${shopSlug}/customer/orders`);
    if (!res.ok) {
      setStep("email");
      return;
    }
    const data = await res.json();
    if (data.ok) {
      setOrders(data.orders);
      setCurrency(data.currency ?? "XAF");
      setStep("orders");
    }
  }, [shopSlug]);

  useEffect(() => {
    fetch(`/api/shop/${shopSlug}/customer-auth/me`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.authenticated) {
          setEmail(d.email);
          loadOrders();
        }
      })
      .catch(() => {});
  }, [shopSlug, loadOrders]);

  const requestOtp = async () => {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/shop/${shopSlug}/customer-auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
        return;
      }
      setInfo(
        data.message ??
          "Si cet email correspond à un achat, vous recevrez un code."
      );
      setStep("code");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/shop/${shopSlug}/customer-auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Code invalide");
        return;
      }
      await loadOrders();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch(`/api/shop/${shopSlug}/customer-auth/logout`, { method: "POST" });
    setOrders([]);
    setStep("email");
    setCode("");
  };

  const openDispute = async () => {
    if (!disputeOrderId) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/shop/${shopSlug}/customer/disputes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: disputeOrderId,
          reason: disputeReason,
          description: disputeDesc,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
        return;
      }
      setDisputeOrderId(null);
      setDisputeDesc("");
      await loadOrders();
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (n: number) =>
    `${n.toLocaleString("fr-FR")} ${currency === "XAF" ? "FCFA" : currency}`;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.head}>
          <div>
            <span className={styles.eyebrow}>— MES ACHATS</span>
            <h2 className={styles.title}>{shopName}</h2>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Fermer">
            <X size={20} />
          </button>
        </div>

        <div className={styles.trust}>
          <ShieldCheck size={16} />
          <span>Connexion sécurisée par code email — vous ne voyez que vos achats.</span>
        </div>

        {step === "email" && (
          <div className={styles.body}>
            <p className={styles.lead}>
              Entrez l&apos;email utilisé lors de votre commande pour accéder à vos achats et
              litiges.
            </p>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              autoComplete="email"
            />
            {error && <p className={styles.error}>{error}</p>}
            {info && <p className={styles.info}>{info}</p>}
            <button
              type="button"
              className={styles.primaryBtn}
              style={{ background: primaryColor }}
              disabled={loading || !email}
              onClick={requestOtp}
            >
              {loading ? "Envoi…" : "Recevoir un code"}
            </button>
          </div>
        )}

        {step === "code" && (
          <div className={styles.body}>
            <p className={styles.lead}>Saisissez le code reçu par email.</p>
            <label className={styles.label}>Code à 6 chiffres</label>
            <input
              type="text"
              inputMode="numeric"
              className={styles.input}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
            />
            {error && <p className={styles.error}>{error}</p>}
            {info && <p className={styles.info}>{info}</p>}
            <button
              type="button"
              className={styles.primaryBtn}
              style={{ background: primaryColor }}
              disabled={loading || code.length !== 6}
              onClick={verifyOtp}
            >
              {loading ? "Vérification…" : "Se connecter"}
            </button>
            <button type="button" className={styles.linkBtn} onClick={() => setStep("email")}>
              Changer d&apos;email
            </button>
          </div>
        )}

        {step === "orders" && (
          <div className={styles.body}>
            <div className={styles.sessionBar}>
              <span>{email}</span>
              <button type="button" className={styles.linkBtn} onClick={logout}>
                <LogOut size={14} /> Déconnexion
              </button>
            </div>

            {orders.length === 0 ? (
              <p className={styles.lead}>Aucun achat trouvé pour cet email.</p>
            ) : (
              <ul className={styles.orderList}>
                {orders.map((o) => (
                  <li key={o.id} className={styles.orderCard}>
                    <div className={styles.orderTop}>
                      <Package size={16} />
                      <span className={styles.orderNum}>#{o.orderNumber}</span>
                      <span className={styles.orderDate}>
                        {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <p className={styles.orderTotal}>{formatPrice(o.total)}</p>
                    {o.dispute ? (
                      <div className={styles.disputeBox}>
                        <strong>
                          Litige :{" "}
                          {DISPUTE_STATUS_LABELS[o.dispute.status as DisputeStatus] ??
                            o.dispute.status}
                        </strong>
                        <span>{o.dispute.reason}</span>
                        {o.dispute.merchantResponse && (
                          <p>
                            <em>Réponse du vendeur :</em> {o.dispute.merchantResponse}
                          </p>
                        )}
                        {o.dispute.adminResolution && (
                          <p>
                            <em>Décision Sellia :</em> {o.dispute.adminResolution}
                          </p>
                        )}
                      </div>
                    ) : disputeOrderId === o.id ? (
                      <div className={styles.disputeForm}>
                        <select
                          className={styles.input}
                          value={disputeReason}
                          onChange={(e) =>
                            setDisputeReason(e.target.value as DisputeReason)
                          }
                        >
                          {DISPUTE_REASONS.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                        <textarea
                          className={styles.textarea}
                          rows={3}
                          placeholder="Décrivez le problème…"
                          value={disputeDesc}
                          onChange={(e) => setDisputeDesc(e.target.value)}
                        />
                        <div className={styles.disputeActions}>
                          <button
                            type="button"
                            className={styles.primaryBtn}
                            style={{ background: primaryColor }}
                            disabled={loading}
                            onClick={openDispute}
                          >
                            Envoyer le litige
                          </button>
                          <button
                            type="button"
                            className={styles.secondaryBtn}
                            onClick={() => setDisputeOrderId(null)}
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={() => setDisputeOrderId(o.id)}
                      >
                        Ouvrir un litige
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {error && <p className={styles.error}>{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
