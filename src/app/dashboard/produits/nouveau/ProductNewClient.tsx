"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductEditorModal from "@/components/personnalisation/ProductEditorModal";
import type { ProductEditInput } from "@/lib/validations/personnalisation";
import { createProductAction } from "@/app/actions/product";
import "@/app/personnaliser-ma-boutique/personnalisation.css";
import styles from "./product-new.module.css";

interface Props {
  shopId: string;
  shopSlug: string;
  shopName: string;
  shopCategory: string | null;
  shopPrimaryColor: string;
}

const EMPTY_PRODUCT: ProductEditInput = {
  id: `new-${Date.now()}`,
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
  feeMode: "merchant_absorbs",
  codAvailable: false,
  included: true,
};

export default function ProductNewClient(props: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (product: ProductEditInput) => {
    setSaving(true);
    setError(null);

    const res = await createProductAction({
      shopId: props.shopId,
      product,
    });

    if (res.ok) {
      router.push(`/dashboard/produits/${res.productId}?created=1`);
    } else {
      setError(res.error);
      setSaving(false);
    }
  };

  const handleClose = () => {
    router.push("/dashboard/produits");
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <Link href="/dashboard/produits" className={styles.backLink}>
          <ArrowLeft size={15} />
          Retour aux produits
        </Link>
        <span className={styles.eyebrow}>NOUVEAU PRODUIT</span>
      </div>

      {error && <div className={styles.errorBanner}>⚠️ {error}</div>}
      {saving && (
        <div className={styles.savingBanner}>Enregistrement en cours…</div>
      )}

      <div className={styles.editorWrap}>
        <ProductEditorModal
          embedded
          product={EMPTY_PRODUCT}
          shopContext={{ name: props.shopName, category: props.shopCategory }}
          onSave={handleSave}
          onDelete={handleClose}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}
