"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, CheckCircle2 } from "lucide-react";
import ProductEditorModal from "@/components/personnalisation/ProductEditorModal";
import type { ProductEditInput } from "@/lib/validations/personnalisation";
import {
  updateProductAction,
  deleteProductAction,
  toggleProductActiveAction,
} from "@/app/actions/product";
import "@/app/personnaliser-ma-boutique/personnalisation.css";
import styles from "../nouveau/product-new.module.css";

interface Props {
  productId: string;
  initialProduct: ProductEditInput;
  shopId: string;
  shopSlug: string;
  shopName: string;
  shopCategory: string | null;
  shopPrimaryColor: string;
  isActive: boolean;
}

export default function ProductEditClient(props: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justCreated = searchParams.get("created") === "1";

  const [error, setError] = useState<string | null>(null);
  const [showCreatedToast, setShowCreatedToast] = useState(justCreated);

  const handleSave = async (product: ProductEditInput) => {
    setError(null);
    const res = await updateProductAction({
      productId: props.productId,
      product,
    });
    if (!res.ok) {
      setError(res.error);
    } else {
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer ce produit ? Cette action est définitive.")) return;
    const res = await deleteProductAction(props.productId);
    if (res.ok) router.push("/dashboard/produits");
    else setError(res.error);
  };

  const handleToggleActive = async () => {
    const res = await toggleProductActiveAction(
      props.productId,
      !props.isActive
    );
    if (res.ok) router.refresh();
    else setError(res.error);
  };

  const handleClose = () => {
    router.push("/dashboard/produits");
  };

  const productPath = `/shop/${props.shopSlug}/produit/${props.initialProduct.slug || props.productId}`;

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <Link href="/dashboard/produits" className={styles.backLink}>
          <ArrowLeft size={15} />
          Retour aux produits
        </Link>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            type="button"
            onClick={handleToggleActive}
            className={styles.backLink}
          >
            {props.isActive ? "Mettre en brouillon" : "Publier"}
          </button>
          <a
            href={productPath}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.backLink}
          >
            <ExternalLink size={14} />
            Voir sur la boutique
          </a>
        </div>
      </div>

      {showCreatedToast && (
        <div className={styles.successBanner}>
          <CheckCircle2 size={16} />
          Produit créé avec succès. Il est maintenant visible sur votre boutique.
          <button
            type="button"
            onClick={() => setShowCreatedToast(false)}
            className={styles.toastClose}
          >
            ✕
          </button>
        </div>
      )}

      {error && <div className={styles.errorBanner}>⚠️ {error}</div>}

      <div className={styles.editorWrap}>
        <ProductEditorModal
          embedded
          product={props.initialProduct}
          shopContext={{ name: props.shopName, category: props.shopCategory }}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}
