"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  UploadSimple,
  MagnifyingGlass,
  SquaresFour,
  ListBullets,
  PencilSimple,
  Trash,
  Copy,
  ArrowSquareOut,
  WarningOctagon,
  Eye,
  EyeSlash,
  Truck,
} from "@phosphor-icons/react";
import {
  toggleProductActiveAction,
  deleteProductAction,
  duplicateProductAction,
} from "@/app/actions/product";
import ProductImagePlaceholder from "@/components/shop/ProductImagePlaceholder";
import ImportCsvModal from "@/components/dashboard/ImportCsvModal";
import styles from "./products-list.module.css";

interface Shop {
  id: string;
  slug: string;
  name: string;
  primaryColor: string | null;
  defaultCurrency: string | null;
}

interface ProductItem {
  id: string;
  name: string;
  slug: string | null;
  sku: string | null;
  emoji: string | null;
  imageUrl: string | null;
  galleryUrls: string[];
  price: number;
  comparePrice: number | null;
  currency: string;
  category: string | null;
  customCategory: string | null;
  stock: number | null;
  unlimitedStock: boolean;
  type: string;
  isActive: boolean;
  variantsCount: number;
  salesCount: number;
  salesRevenue?: number;
  createdAt: string;
}

interface Props {
  shop: Shop;
  products: ProductItem[];
  stats: {
    total: number;
    active: number;
    lowStock: number;
    drafts: number;
  };
}

type FilterTab = "all" | "active" | "lowStock" | "drafts";
type ViewMode = "grid" | "table";

export default function ProductsListClient({ shop, products, stats }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [view, setView] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [duplicateToast, setDuplicateToast] = useState<{
    productId: string;
    name: string;
  } | null>(null);

  const currency = shop.defaultCurrency || "FCFA";

  const filtered = useMemo(() => {
    let list = products;

    if (filter === "active") list = list.filter((p) => p.isActive);
    else if (filter === "lowStock")
      list = list.filter(
        (p) =>
          p.isActive &&
          !p.unlimitedStock &&
          p.stock !== null &&
          p.stock <= 5
      );
    else if (filter === "drafts") list = list.filter((p) => !p.isActive);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku || "").toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [products, filter, search]);

  const formatPrice = (n: number | null) =>
    n === null ? "—" : n.toLocaleString("fr-FR");

  const handleToggleActive = async (p: ProductItem) => {
    setBusyId(p.id);
    const res = await toggleProductActiveAction(p.id, !p.isActive);
    if (res.ok) router.refresh();
    setBusyId(null);
  };

  const handleDelete = async (p: ProductItem) => {
    if (!confirm(`Supprimer "${p.name}" ? Cette action est définitive.`)) return;
    setBusyId(p.id);
    const res = await deleteProductAction(p.id);
    if (res.ok) router.refresh();
    setBusyId(null);
  };

  const handleDuplicate = async (p: ProductItem) => {
    setBusyId(p.id);
    setDuplicateToast(null);
    const res = await duplicateProductAction(p.id);
    if (res.ok) {
      setDuplicateToast({ productId: res.productId, name: res.name });
      router.refresh();
    } else {
      alert(res.error || "Impossible de dupliquer le produit.");
    }
    setBusyId(null);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>— CATALOGUE</span>
          <h1 className={styles.title}>Produits</h1>
          <p className={styles.subtitle}>
            Gérez votre catalogue, suivez les stocks et organisez vos
            collections.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link
            href="/dashboard/produits/livraisons"
            className={styles.btnSecondary}
          >
            <Truck size={15} weight="bold" /> Configurer les livraisons
          </Link>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => setShowImportModal(true)}
          >
            <UploadSimple size={15} weight="bold" /> Importer CSV
          </button>
          <Link href="/dashboard/produits/nouveau" className={styles.btnPrimary}>
            <Plus size={15} weight="bold" /> Nouveau produit
          </Link>
        </div>
      </div>

      {duplicateToast && (
        <div className={styles.duplicateToast}>
          <span>Produit dupliqué — {duplicateToast.name}</span>
          <div className={styles.duplicateToastActions}>
            <Link
              href={`/dashboard/produits/${duplicateToast.productId}`}
              className={styles.duplicateToastLink}
            >
              Éditer la copie
            </Link>
            <button
              type="button"
              className={styles.duplicateToastClose}
              onClick={() => setDuplicateToast(null)}
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>TOTAL PRODUITS</div>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statPill}>Tous statuts</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>ACTIFS</div>
          <div className={styles.statValue} style={{ color: "#15803D" }}>
            {stats.active}
          </div>
          <div
            className={styles.statPill}
            style={{ background: "#DCFCE7", color: "#15803D" }}
          >
            Disponibles
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>STOCK FAIBLE</div>
          <div className={styles.statValue} style={{ color: "#C2410C" }}>
            {stats.lowStock}
          </div>
          <div
            className={styles.statPill}
            style={{ background: "#FFEDD5", color: "#C2410C" }}
          >
            <WarningOctagon size={12} weight="duotone" /> Action requise
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>BROUILLONS</div>
          <div className={styles.statValue} style={{ color: "#6B6E76" }}>
            {stats.drafts}
          </div>
          <div className={styles.statPill}>Non publié</div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {(
            [
              { key: "all", label: "Tous", count: stats.total },
              { key: "active", label: "Actifs", count: stats.active },
              { key: "lowStock", label: "Stock faible", count: stats.lowStock },
              { key: "drafts", label: "Brouillons", count: stats.drafts },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`${styles.tab} ${filter === tab.key ? styles.tabActive : ""}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
              <span className={styles.tabCount}>{tab.count}</span>
            </button>
          ))}
        </div>

        <div className={styles.toolbarRight}>
          <div className={styles.searchWrap}>
            <MagnifyingGlass size={14} weight="regular" className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.viewToggle}>
            <button
              type="button"
              className={`${styles.viewBtn} ${view === "grid" ? styles.viewBtnActive : ""}`}
              onClick={() => setView("grid")}
              title="Vue grille"
            >
              <SquaresFour size={15} weight="regular" />
            </button>
            <button
              type="button"
              className={`${styles.viewBtn} ${view === "table" ? styles.viewBtnActive : ""}`}
              onClick={() => setView("table")}
              title="Vue tableau"
            >
              <ListBullets size={15} weight="regular" />
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📦</div>
          <h3>
            Aucun produit
            {filter !== "all" ? " dans ce filtre" : ""}
          </h3>
          <p>
            {filter === "all"
              ? "Créez votre premier produit pour commencer à vendre."
              : "Essayez un autre filtre ou créez un nouveau produit."}
          </p>
          {filter === "all" && (
            <Link
              href="/dashboard/produits/nouveau"
              className={styles.btnPrimary}
              style={{ marginTop: 16 }}
            >
              <Plus size={15} weight="bold" /> Créer un produit
            </Link>
          )}
        </div>
      )}

      {view === "grid" && filtered.length > 0 && (
        <div className={styles.grid}>
          {filtered.map((p) => {
            const cover = p.imageUrl || p.galleryUrls[0] || null;
            const lowStockBadge =
              p.isActive &&
              !p.unlimitedStock &&
              p.stock !== null &&
              p.stock <= 5;
            return (
              <div key={p.id} className={styles.card}>
                <Link
                  href={`/dashboard/produits/${p.id}`}
                  className={styles.cardImageLink}
                >
                  {cover ? (
                    <img src={cover} alt={p.name} className={styles.cardImage} />
                  ) : (
                    <ProductImagePlaceholder size="lg" />
                  )}
                  {!p.isActive && (
                    <span className={styles.cardBadgeDraft}>BROUILLON</span>
                  )}
                  {lowStockBadge && (
                    <span className={styles.cardBadgeLowStock}>
                      STOCK FAIBLE
                    </span>
                  )}
                </Link>

                <div className={styles.cardBody}>
                  <Link
                    href={`/dashboard/produits/${p.id}`}
                    className={styles.cardName}
                  >
                    {p.name || "Sans nom"}
                  </Link>
                  <div className={styles.cardMeta}>
                    {p.sku && <span className={styles.cardSku}>{p.sku}</span>}
                    {p.category && <span>{p.category}</span>}
                  </div>
                  <div className={styles.cardPriceRow}>
                    <span className={styles.cardPrice}>
                      {formatPrice(p.price)}{" "}
                      <span className={styles.cardCurrency}>{currency}</span>
                    </span>
                    {p.comparePrice != null && p.comparePrice > p.price && (
                      <span className={styles.cardCompare}>
                        {formatPrice(p.comparePrice)}
                      </span>
                    )}
                  </div>
                  <div className={styles.cardStock}>
                    {p.unlimitedStock || p.stock === null
                      ? "Stock illimité"
                      : `${p.stock} en stock`}
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(p)}
                    disabled={busyId === p.id}
                    className={styles.cardActionBtn}
                    title={p.isActive ? "Mettre en brouillon" : "Publier"}
                  >
                    {p.isActive ? <EyeSlash size={14} weight="regular" /> : <Eye size={14} weight="regular" />}
                  </button>
                  <Link
                    href={`/dashboard/produits/${p.id}`}
                    className={styles.cardActionBtn}
                    title="Modifier"
                  >
                    <PencilSimple size={14} weight="regular" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(p)}
                    disabled={busyId === p.id}
                    className={styles.cardActionBtn}
                    title="Dupliquer"
                  >
                    <Copy size={14} weight="regular" />
                  </button>
                  <a
                    href={`/shop/${shop.slug}/produit/${p.slug || p.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.cardActionBtn}
                    title="Voir sur la boutique"
                  >
                    <ArrowSquareOut size={14} weight="regular" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(p)}
                    disabled={busyId === p.id}
                    className={`${styles.cardActionBtn} ${styles.cardActionDanger}`}
                    title="Supprimer"
                  >
                    <Trash size={14} weight="regular" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "table" && filtered.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableCheckbox}>
                  <input type="checkbox" aria-label="Tout sélectionner" />
                </th>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Statut</th>
                <th>Ventes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const cover = p.imageUrl || p.galleryUrls[0] || null;
                const isLowStock =
                  p.isActive &&
                  !p.unlimitedStock &&
                  p.stock !== null &&
                  p.stock <= 5;
                return (
                  <tr key={p.id}>
                    <td className={styles.tableCheckbox}>
                      <input type="checkbox" aria-label={`Sélectionner ${p.name}`} />
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/produits/${p.id}`}
                        className={styles.tableProductCell}
                      >
                        <div className={styles.tableProductImg}>
                          {cover ? (
                            <img src={cover} alt={p.name} />
                          ) : (
                            <ProductImagePlaceholder size="sm" />
                          )}
                        </div>
                        <div className={styles.tableProductInfo}>
                          <div className={styles.tableProductName}>
                            {p.name || "Sans nom"}
                          </div>
                          {p.sku && (
                            <div className={styles.tableProductSku}>{p.sku}</div>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td>
                      {p.category ? (
                        <span className={styles.tableCategory}>{p.category}</span>
                      ) : (
                        <span style={{ color: "var(--sellia-subtle)" }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={styles.tablePrice}>
                        {formatPrice(p.price)} {currency}
                      </span>
                      {p.comparePrice != null && p.comparePrice > p.price && (
                        <span className={styles.tablePriceCompare}>
                          {formatPrice(p.comparePrice)} {currency}
                        </span>
                      )}
                    </td>
                    <td
                      className={`${styles.tableStock} ${isLowStock ? styles.tableStockLow : ""}`}
                    >
                      {p.unlimitedStock || p.stock === null
                        ? "Illimité"
                        : `${p.stock} unités`}
                    </td>
                    <td>
                      {!p.isActive ? (
                        <span
                          className={`${styles.statusBadge} ${styles.statusBadgeDraft}`}
                        >
                          BROUILLON
                        </span>
                      ) : isLowStock ? (
                        <span
                          className={`${styles.statusBadge} ${styles.statusBadgeLow}`}
                        >
                          STOCK FAIBLE
                        </span>
                      ) : (
                        <span
                          className={`${styles.statusBadge} ${styles.statusBadgeActive}`}
                        >
                          ACTIF
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          color:
                            p.salesCount > 0
                              ? "var(--sellia-ink)"
                              : "var(--sellia-muted)",
                          fontWeight: 600,
                        }}
                      >
                        {p.salesCount}
                      </span>
                    </td>
                    <td>
                      <div className={styles.tableActions}>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(p)}
                          disabled={busyId === p.id}
                          className={styles.tableActionBtn}
                          title={p.isActive ? "Mettre en brouillon" : "Publier"}
                        >
                          {p.isActive ? <EyeSlash size={14} weight="regular" /> : <Eye size={14} weight="regular" />}
                        </button>
                        <Link
                          href={`/dashboard/produits/${p.id}`}
                          className={styles.tableActionBtn}
                          title="Modifier"
                        >
                          <PencilSimple size={14} weight="regular" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(p)}
                          disabled={busyId === p.id}
                          className={styles.tableActionBtn}
                          title="Dupliquer"
                        >
                          <Copy size={14} weight="regular" />
                        </button>
                        <a
                          href={`/shop/${shop.slug}/produit/${p.slug || p.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.tableActionBtn}
                          title="Voir sur la boutique"
                        >
                          <ArrowSquareOut size={14} weight="regular" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
                          disabled={busyId === p.id}
                          className={`${styles.tableActionBtn} ${styles.tableActionDanger}`}
                          title="Supprimer"
                        >
                          <Trash size={14} weight="regular" />
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

      {showImportModal && (
        <ImportCsvModal onClose={() => setShowImportModal(false)} />
      )}
    </div>
  );
}
