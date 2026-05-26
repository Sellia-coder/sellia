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
  CheckCircle,
} from "@phosphor-icons/react";
import { toggleCouponActiveAction, deleteCouponAction } from "@/app/actions/coupons";
import { useRouter } from "next/navigation";
import CouponEditorModal from "./CouponEditorModal";
import SuccessModal from "@/components/dashboard/SuccessModal";
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
  maxUsesPerCustomer: number | null;
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Nom</th>
                <th>Réduction</th>
                <th>Validité</th>
                <th>Utilisations</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const expired = isExpired(c);
                return (
                  <tr
                    key={c.id}
                    className={
                      !c.isActive || expired ? styles.rowInactive : ""
                    }
                  >
                    <td>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(c.code)}
                        className={styles.cellCode}
                      >
                        <span className={styles.codeMono}>{c.code}</span>
                        {copiedCode === c.code ? (
                          <CheckCircle size={12} weight="fill" color="#15803D" />
                        ) : (
                          <Copy size={11} weight="regular" />
                        )}
                      </button>
                    </td>
                    <td className={styles.cellName}>{c.name}</td>
                    <td className={styles.cellDiscount}>
                      {c.discountType === "PERCENTAGE"
                        ? `${c.discountValue}%`
                        : `${formatPrice(c.discountValue)} ${cur}`}
                    </td>
                    <td className={styles.cellMeta}>{formatDate(c.endsAt)}</td>
                    <td className={styles.cellUses}>
                      {c.currentUses}
                      {c.maxUses ? ` / ${c.maxUses}` : ""}
                    </td>
                    <td>
                      {expired ? (
                        <span
                          className={`${styles.statusBadge} ${styles.statusExpired}`}
                        >
                          Expiré
                        </span>
                      ) : !c.isActive ? (
                        <span
                          className={`${styles.statusBadge} ${styles.statusInactive}`}
                        >
                          Désactivé
                        </span>
                      ) : (
                        <span
                          className={`${styles.statusBadge} ${styles.statusActive}`}
                        >
                          Actif
                        </span>
                      )}
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(c)}
                          disabled={busyId === c.id}
                          className={styles.actionBtn}
                        >
                          {c.isActive ? (
                            <EyeSlash size={13} />
                          ) : (
                            <Eye size={13} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(c)}
                          className={styles.actionBtn}
                        >
                          <PencilSimple size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
                          disabled={busyId === c.id}
                          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        >
                          <Trash size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <CouponEditorModal
          coupon={editing === "new" ? null : editing}
          currency={currency}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setSuccessMessage("Coupon enregistré avec succès");
            router.refresh();
          }}
        />
      )}

      {successMessage && (
        <SuccessModal
          title={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
    </div>
  );
}
