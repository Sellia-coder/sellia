"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  MagnifyingGlass,
  Copy,
  PencilSimple,
  Trash,
  Eye,
  EyeSlash,
  CaretLeft,
  Percent,
  CurrencyDollar,
  CheckCircle,
} from "@phosphor-icons/react";
import { toggleCouponActiveAction, deleteCouponAction } from "@/app/actions/coupons";
import { useRouter } from "next/navigation";
import CouponEditorModal from "./CouponEditorModal";
import EmptyCoupons from "../empty-states/EmptyCoupons";
import styles from "./coupons.module.css";

interface CouponRow {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  startsAt: string;
  endsAt: string | null;
  maxUses: number | null;
  maxUsesPerCustomer: number;
  currentUses: number;
  isActive: boolean;
  firstOrderOnly: boolean;
  createdAt: string;
}

interface Props {
  currency: string;
  coupons: CouponRow[];
}

type FilterTab = "all" | "active" | "expired" | "inactive";

function displayCurrency(currency: string) {
  return currency === "XAF" ? "FCFA" : currency;
}

export default function CouponsClient({ currency, coupons }: Props) {
  const router = useRouter();
  const cur = displayCurrency(currency);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<CouponRow | null | "new">(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const formatPrice = (n: number) => n.toLocaleString("fr-FR");

  const filtered = useMemo(() => {
    let list = coupons;
    const now = new Date();
    if (filter === "active") {
      list = list.filter(
        (c) => c.isActive && (!c.endsAt || new Date(c.endsAt) > now)
      );
    } else if (filter === "expired") {
      list = list.filter((c) => c.endsAt && new Date(c.endsAt) <= now);
    } else if (filter === "inactive") {
      list = list.filter((c) => !c.isActive);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [coupons, filter, search]);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1500);
    } catch {
      /* ignore */
    }
  };

  const handleToggleActive = async (c: CouponRow) => {
    setBusyId(c.id);
    await toggleCouponActiveAction(c.id, !c.isActive);
    router.refresh();
    setBusyId(null);
  };

  const handleDelete = async (c: CouponRow) => {
    if (!confirm(`Supprimer le coupon ${c.code} ?`)) return;
    setBusyId(c.id);
    await deleteCouponAction(c.id);
    router.refresh();
    setBusyId(null);
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "Pas d'expiration";
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isExpired = (c: CouponRow) =>
    !!(c.endsAt && new Date(c.endsAt) < new Date());

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <Link href="/dashboard/promotions" className={styles.backLink}>
          <CaretLeft size={14} weight="bold" /> Promotions
        </Link>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className={styles.btnPrimary}
        >
          <Plus size={15} weight="bold" /> Nouveau coupon
        </button>
      </div>

      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>— PROMOTIONS / COUPONS</span>
          <h1 className={styles.title}>Coupons de réduction</h1>
          <p className={styles.subtitle}>
            Créez des codes promo pour attirer de nouveaux clients ou récompenser
            vos clients fidèles.
          </p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {[
            { key: "all", label: "Tous", count: coupons.length },
            {
              key: "active",
              label: "Actifs",
              count: coupons.filter(
                (c) =>
                  c.isActive &&
                  (!c.endsAt || new Date(c.endsAt) > new Date())
              ).length,
            },
            {
              key: "inactive",
              label: "Désactivés",
              count: coupons.filter((c) => !c.isActive).length,
            },
            {
              key: "expired",
              label: "Expirés",
              count: coupons.filter(
                (c) => c.endsAt && new Date(c.endsAt) < new Date()
              ).length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`${styles.tab} ${filter === tab.key ? styles.tabActive : ""}`}
              onClick={() => setFilter(tab.key as FilterTab)}
            >
              {tab.label}
              <span className={styles.tabCount}>{tab.count}</span>
            </button>
          ))}
        </div>
        <div className={styles.searchWrap}>
          <MagnifyingGlass size={14} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Code ou nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <EmptyCoupons size={160} />
          <h3>Aucun coupon</h3>
          <p>
            {filter === "all"
              ? "Créez votre premier coupon pour booster vos ventes."
              : "Essayez un autre filtre."}
          </p>
          {filter === "all" && (
            <button
              type="button"
              onClick={() => setEditing("new")}
              className={styles.btnPrimary}
              style={{ marginTop: 16 }}
            >
              <Plus size={15} weight="bold" /> Créer un coupon
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((c) => {
            const expired = isExpired(c);
            return (
              <div
                key={c.id}
                className={`${styles.couponCard} ${!c.isActive || expired ? styles.couponInactive : ""}`}
              >
                <div className={styles.couponHeader}>
                  <div className={styles.couponIconBox}>
                    {c.discountType === "PERCENTAGE" ? (
                      <Percent size={20} weight="duotone" color="#E84B1F" />
                    ) : (
                      <CurrencyDollar size={20} weight="duotone" color="#E84B1F" />
                    )}
                  </div>
                  <div className={styles.couponMainInfo}>
                    <div className={styles.couponName}>{c.name}</div>
                    <div className={styles.couponDiscount}>
                      {c.discountType === "PERCENTAGE"
                        ? `${c.discountValue}% de réduction`
                        : `${formatPrice(c.discountValue)} ${cur} de réduction`}
                    </div>
                  </div>
                  <div className={styles.couponStatus}>
                    {expired ? (
                      <span className={`${styles.statusBadge} ${styles.statusExpired}`}>
                        Expiré
                      </span>
                    ) : !c.isActive ? (
                      <span className={`${styles.statusBadge} ${styles.statusInactive}`}>
                        Désactivé
                      </span>
                    ) : (
                      <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                        Actif
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyCode(c.code)}
                  className={styles.couponCode}
                >
                  <span className={styles.couponCodeLabel}>Code</span>
                  <span className={styles.couponCodeValue}>{c.code}</span>
                  {copiedCode === c.code ? (
                    <CheckCircle size={14} weight="fill" color="#15803D" />
                  ) : (
                    <Copy size={13} weight="regular" />
                  )}
                </button>

                <div className={styles.couponDetails}>
                  {c.minOrderAmount != null && c.minOrderAmount > 0 && (
                    <div className={styles.couponDetail}>
                      <span className={styles.detailLabel}>Commande min</span>
                      <span className={styles.detailValue}>
                        {formatPrice(c.minOrderAmount)} {cur}
                      </span>
                    </div>
                  )}
                  <div className={styles.couponDetail}>
                    <span className={styles.detailLabel}>Validité</span>
                    <span className={styles.detailValue}>
                      {formatDate(c.endsAt)}
                    </span>
                  </div>
                  <div className={styles.couponDetail}>
                    <span className={styles.detailLabel}>Utilisations</span>
                    <span className={styles.detailValue}>
                      {c.currentUses}
                      {c.maxUses ? ` / ${c.maxUses}` : ""}
                    </span>
                  </div>
                </div>

                <div className={styles.couponActions}>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(c)}
                    disabled={busyId === c.id}
                    className={styles.actionBtn}
                    title={c.isActive ? "Désactiver" : "Activer"}
                  >
                    {c.isActive ? (
                      <EyeSlash size={14} weight="regular" />
                    ) : (
                      <Eye size={14} weight="regular" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(c)}
                    className={styles.actionBtn}
                  >
                    <PencilSimple size={14} weight="regular" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c)}
                    disabled={busyId === c.id}
                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                  >
                    <Trash size={14} weight="regular" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <CouponEditorModal
          coupon={editing === "new" ? null : editing}
          currency={currency}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
