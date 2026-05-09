"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

interface Product {
  id: string;
  slug: string | null;
  name: string;
  price: number;
  imageUrl: string | null;
  emoji: string | null;
  category: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  shopSlug: string;
}

export default function SearchOverlay({
  isOpen,
  onClose,
  shopSlug,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      setQuery("");
      setResults([]);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/shop/${shopSlug}/search?q=${encodeURIComponent(query.trim())}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.products ?? []);
        }
      } catch (e) {
        console.error("[search]", e);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query, shopSlug]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="shop-search-overlay" role="dialog" aria-modal="true">
      <div className="shop-search-backdrop" onClick={onClose} />
      <div className="shop-search-panel">
        <div className="shop-search-header">
          <Search size={18} strokeWidth={2} className="shop-search-panel-icon" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un produit..."
            className="shop-search-panel-input"
          />
          <button
            type="button"
            className="shop-search-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="shop-search-results">
          {!query.trim() && (
            <div className="shop-search-empty">
              Tape au moins 2 caractères pour rechercher.
            </div>
          )}
          {query.trim() && query.trim().length < 2 && (
            <div className="shop-search-empty">Continue à taper…</div>
          )}
          {loading && (
            <div className="shop-search-empty">Recherche en cours…</div>
          )}
          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <div className="shop-search-empty">
              Aucun produit ne correspond à <strong>{query}</strong>
            </div>
          )}
          {results.length > 0 && (
            <ul className="shop-search-list">
              {results.map((p) => {
                const seg = p.slug ?? p.id;
                return (
                  <li key={p.id}>
                    <Link
                      href={`/shop/${shopSlug}/produit/${seg}`}
                      className="shop-search-item"
                      onClick={onClose}
                    >
                      <div className="shop-search-item-img">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt="" />
                        ) : (
                          <span>{p.emoji ?? "🛍️"}</span>
                        )}
                      </div>
                      <div className="shop-search-item-info">
                        <div className="shop-search-item-name">{p.name}</div>
                        {p.category && (
                          <div className="shop-search-item-cat">
                            {p.category}
                          </div>
                        )}
                      </div>
                      <div className="shop-search-item-price">
                        {p.price.toLocaleString("fr-FR")} FCFA
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
