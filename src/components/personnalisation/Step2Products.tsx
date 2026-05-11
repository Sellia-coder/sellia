"use client";

import { useState } from "react";
import {
  step2Schema,
  PRODUCT_CATEGORIES,
  type Step2Input,
  type ProductEditInput,
} from "@/lib/validations/personnalisation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import StepNav from "./StepNav";
import ProductEditorModal from "./ProductEditorModal";
import ProductImagePlaceholder from "@/components/shop/ProductImagePlaceholder";

interface Props {
  value: Step2Input;
  onChange: (v: Step2Input) => void;
  onNext: () => void;
  onBack: () => void;
  shopContext?: { name: string | null; category: string | null };
}

const MAX_PRODUCTS = 20;

const EMPTY_PRODUCT = (id: string): ProductEditInput => ({
  id,
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  emoji: "",
  price: 100,
  comparePrice: null,
  category: undefined,
  customCategory: "",
  tags: [],
  type: "physical",
  sku: "",
  stock: null,
  unlimitedStock: true,
  weight: null,
  digitalFileUrl: "",
  downloadLimit: null,
  imageUrl: null,
  galleryUrls: [],
  hasVariants: false,
  variantAxes: [],
  variants: [],
  included: true,
});

export default function Step2Products({ value, onChange, onNext, onBack, shopContext }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const updateProduct = (id: string, patch: Partial<ProductEditInput>) => {
    onChange({
      ...value,
      products: value.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  };

  const replaceProduct = (id: string, next: ProductEditInput) => {
    onChange({
      ...value,
      products: value.products.map((p) => (p.id === id ? next : p)),
    });
  };

  const removeProduct = (id: string) => {
    onChange({
      ...value,
      products: value.products.filter((p) => p.id !== id),
    });
  };

  const addProduct = () => {
    if (value.products.length >= MAX_PRODUCTS) return;
    const id = `new-${Date.now()}`;
    onChange({
      ...value,
      products: [...value.products, EMPTY_PRODUCT(id)],
    });
    setEditingId(id);
  };

  const handleDeleteProduct = (p: ProductEditInput) => {
    const productLabel = p.name.trim() || "ce produit";
    const ok = window.confirm(`Supprimer "${productLabel}" ?\n\nCette action est définitive.`);
    if (!ok) return;
    removeProduct(p.id);
  };

  const includedCount = value.products.filter((p) => p.included).length;
  const editing = value.products.find((p) => p.id === editingId) ?? null;

  const handleSubmit = () => {
    const parsed = step2Schema.safeParse(value);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Vérifie tes produits");
      return;
    }
    setError(null);
    onNext();
  };

  return (
    <section>
      <div className="perso-section-header">
        <h1 className="perso-title">Tes premiers produits</h1>
        <p className="perso-subtitle">
          Ajoute les détails pro de chaque produit. Décoche ceux que tu ne veux pas publier.
        </p>
        <p className="perso-subtitle-accent">
          {includedCount} produit{includedCount > 1 ? "s" : ""} sélectionné
          {includedCount > 1 ? "s" : ""} sur {value.products.length}
        </p>
      </div>

      <div>
        {value.products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onToggleInclude={(checked) => updateProduct(p.id, { included: checked })}
            onEdit={() => setEditingId(p.id)}
            onDelete={() => handleDeleteProduct(p)}
          />
        ))}
      </div>

      {value.products.length < MAX_PRODUCTS && (
        <button type="button" className="perso-product-add" onClick={addProduct}>
          <Plus size={16} strokeWidth={2} />
          Ajouter un produit
        </button>
      )}

      {error && <div className="perso-alert-error perso-alert-error-inline">{error}</div>}

      <StepNav onBack={onBack} onNext={handleSubmit} nextLabel="Continuer" />

      {editing && (
        <ProductEditorModal
          key={editing.id}
          product={editing}
          shopContext={shopContext}
          onSave={(next) => {
            replaceProduct(editing.id, next);
            setEditingId(null);
          }}
          onDelete={() => {
            removeProduct(editing.id);
            setEditingId(null);
          }}
          onClose={() => setEditingId(null)}
        />
      )}
    </section>
  );
}

function ProductCard({
  product,
  onToggleInclude,
  onEdit,
  onDelete,
}: {
  product: ProductEditInput;
  onToggleInclude: (v: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const cat = PRODUCT_CATEGORIES.find((c) => c.code === product.category);

  return (
    <div className={`perso-product-pro ${product.included ? "is-included" : "is-excluded"}`}>
      <label className="perso-product-pro-checkbox">
        <input type="checkbox" checked={product.included} onChange={(e) => onToggleInclude(e.target.checked)} />
      </label>

      <div className="perso-product-pro-thumb">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt="" />
        ) : (
          <ProductImagePlaceholder
            productName={product.name || undefined}
            size="sm"
          />
        )}
      </div>

      <div className="perso-product-pro-info">
        <div className="perso-product-pro-name">{product.name || "Produit sans nom"}</div>
        <div className="perso-product-pro-meta">
          <span className="perso-product-pro-price">{product.price.toLocaleString("fr-FR")} FCFA</span>
          {cat && <span>· {cat.label}</span>}
          {product.type === "digital" && (
            <span className="perso-product-pro-tag perso-product-pro-tag-digital">Digital</span>
          )}
          {product.type === "service" && (
            <span className="perso-product-pro-tag perso-product-pro-tag-service">Service</span>
          )}
          {product.sku && <span className="perso-product-pro-tag">SKU {product.sku}</span>}
        </div>
      </div>

      <div className="perso-product-pro-actions">
        <button type="button" className="perso-product-pro-edit" onClick={onEdit} aria-label="Éditer le produit">
          <Pencil size={12} strokeWidth={2} />
          <span className="perso-product-pro-edit-label">Éditer</span>
        </button>
        <button
          type="button"
          className="perso-product-pro-delete"
          onClick={onDelete}
          aria-label="Supprimer le produit"
          title="Supprimer ce produit"
        >
          <Trash2 size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
