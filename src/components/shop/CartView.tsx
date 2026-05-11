"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trash2,
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  ArrowRight,
} from "lucide-react";
import {
  getCart,
  removeFromCart,
  updateCartQuantity,
  type CartItem,
} from "@/lib/cart";
import { useCartContext } from "./CartProvider";
import QuantityPicker from "./QuantityPicker";
import type { ShopWithProducts } from "@/lib/shop-data";

interface Props {
  shop: ShopWithProducts;
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n);
}

export default function CartView({ shop }: Props) {
  const router = useRouter();
  const { refresh } = useCartContext();
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const primaryColor = shop.primaryColor ?? "#E84B1F";

  useEffect(() => {
    setMounted(true);
    setItems(getCart(shop.slug));
  }, [shop.slug]);

  const handleQtyChange = (productId: string, qty: number) => {
    const next = updateCartQuantity(shop.slug, productId, qty);
    setItems(next);
    refresh();
  };

  const handleRemove = (productId: string) => {
    const next = removeFromCart(shop.slug, productId);
    setItems(next);
    refresh();
  };

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (!mounted) {
    return (
      <div className="shop-cart">
        <div className="shop-container">
          <div style={{ padding: 60, textAlign: "center" }}>
            <Loader2
              size={24}
              strokeWidth={2}
              style={{ animation: "shopSpin 0.7s linear infinite" }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <section className="shop-cart">
        <div className="shop-container shop-cart-inner">
          <Link href={`/shop/${shop.slug}`} className="shop-order-back">
            <ArrowLeft size={14} strokeWidth={2} />
            Continuer mes achats
          </Link>
          <div className="shop-cart-empty">
            <div className="shop-cart-empty-icon">
              <ShoppingBag size={48} strokeWidth={1.5} />
            </div>
            <h1>Ton panier est vide</h1>
            <p>Découvre nos produits et fais-toi plaisir !</p>
            <Link
              href={`/shop/${shop.slug}`}
              className="shop-btn shop-btn-primary shop-btn-lg"
            >
              Découvrir les produits
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="shop-cart">
      <div className="shop-container shop-cart-inner">
        <Link href={`/shop/${shop.slug}`} className="shop-order-back">
          <ArrowLeft size={14} strokeWidth={2} />
          Continuer mes achats
        </Link>

        <h1 className="shop-cart-title">Mon panier</h1>

        <div className="shop-cart-grid">
          <div className="shop-cart-main">
            <div className="shop-cart-items">
              {items.map((item) => (
                <div className="shop-cart-item" key={item.productId}>
                  <Link
                    href={`/shop/${shop.slug}/produit/${item.productSlug}`}
                    className="shop-cart-item-img"
                  >
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} />
                    ) : (
                      <span>{item.emoji ?? "🛍️"}</span>
                    )}
                  </Link>
                  <div className="shop-cart-item-info">
                    <Link
                      href={`/shop/${shop.slug}/produit/${item.productSlug}`}
                      className="shop-cart-item-name"
                    >
                      {item.name}
                    </Link>
                    <div className="shop-cart-item-unit">
                      {item.price.toLocaleString("fr-FR")} FCFA / unité
                    </div>
                    <div className="shop-cart-item-controls">
                      <QuantityPicker
                        value={item.quantity}
                        onChange={(q) => handleQtyChange(item.productId, q)}
                      />
                      <button
                        type="button"
                        className="shop-cart-item-remove"
                        onClick={() => handleRemove(item.productId)}
                        aria-label="Retirer"
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                  <div className="shop-cart-item-line-total">
                    {(item.price * item.quantity).toLocaleString("fr-FR")}{" "}
                    FCFA
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="shop-order-summary">
            <div className="shop-order-summary-card">
              <h2 className="shop-order-summary-title">Récapitulatif</h2>

              <div className="shop-order-summary-lines">
                <div className="shop-order-summary-line">
                  <span>
                    {items.length} article{items.length > 1 ? "s" : ""}
                  </span>
                  <span>{subtotal.toLocaleString("fr-FR")} FCFA</span>
                </div>
                <div className="shop-order-summary-line shop-order-summary-line-total">
                  <span>Total</span>
                  <span>{subtotal.toLocaleString("fr-FR")} FCFA</span>
                </div>
              </div>

              <div className="cartCheckoutWrap">
                <button
                  type="button"
                  className="checkoutBtn"
                  onClick={() => router.push(`/shop/${shop.slug}/commander`)}
                  style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                >
                  <ShoppingBag size={18} strokeWidth={2.2} />
                  <span>Passer à la commande</span>
                  <ArrowRight size={16} strokeWidth={2.4} />
                </button>
                <Link
                  href={`/shop/${shop.slug}`}
                  className="continueShopping"
                >
                  ← Continuer mes achats
                </Link>
              </div>

              <p className="shop-order-summary-trust">
                <ShieldCheck size={12} strokeWidth={2} />
                Paiement 100% sécurisé
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
