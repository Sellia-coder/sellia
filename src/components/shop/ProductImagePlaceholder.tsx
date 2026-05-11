"use client";

import { Camera } from "lucide-react";
import styles from "./ProductImagePlaceholder.module.css";

interface Props {
  productName?: string;
  size?: "sm" | "md" | "lg";
}

/** Placeholder pour produits sans image (aperçu personnalisation, etc.). */
export default function ProductImagePlaceholder({
  productName,
  size = "md",
}: Props) {
  return (
    <div className={`${styles.placeholder} ${styles[`placeholder_${size}`]}`}>
      <div className={styles.icon}>
        <Camera
          size={size === "sm" ? 22 : size === "lg" ? 40 : 32}
          strokeWidth={1.6}
        />
      </div>
      <span className={styles.label}>Photo du produit</span>
      {productName ? (
        <span className={styles.subLabel}>{productName}</span>
      ) : null}
    </div>
  );
}
