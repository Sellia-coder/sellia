"use client";

import { Package, AlertCircle } from "lucide-react";

interface Props {
  stock: number | null;
}

export default function StockIndicator({ stock }: Props) {
  if (stock === null || stock === undefined) {
    return (
      <div className="shop-stock-indicator shop-stock-in">
        <span className="shop-stock-dot" />
        <Package size={13} strokeWidth={2} />
        <span>En stock</span>
      </div>
    );
  }

  if (stock <= 0) {
    return (
      <div className="shop-stock-indicator shop-stock-out">
        <AlertCircle size={13} strokeWidth={2} />
        <span>Rupture de stock</span>
      </div>
    );
  }

  if (stock < 5) {
    return (
      <div className="shop-stock-indicator shop-stock-low">
        <AlertCircle size={13} strokeWidth={2} />
        <span>
          Plus que <strong>{stock}</strong> disponible{stock > 1 ? "s" : ""}
        </span>
      </div>
    );
  }

  return (
    <div className="shop-stock-indicator shop-stock-in">
      <span className="shop-stock-dot" />
      <Package size={13} strokeWidth={2} />
      <span>
        En stock · <strong>{stock}</strong> disponible{stock > 1 ? "s" : ""}
      </span>
    </div>
  );
}
