"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getCartCount, getFavoritesCount } from "@/lib/cart";

interface CartContextValue {
  cartCount: number;
  favsCount: number;
  refresh: () => void;
}

const CartContext = createContext<CartContextValue>({
  cartCount: 0,
  favsCount: 0,
  refresh: () => {},
});

interface Props {
  children: React.ReactNode;
  shopSlug: string;
}

export function CartProvider({ children, shopSlug }: Props) {
  const [cartCount, setCartCount] = useState(0);
  const [favsCount, setFavsCount] = useState(0);

  const refresh = useCallback(() => {
    setCartCount(getCartCount(shopSlug));
    setFavsCount(getFavoritesCount(shopSlug));
  }, [shopSlug]);

  useEffect(() => {
    refresh();
    const onCartChange = (e: Event) => {
      const ce = e as CustomEvent<{ shopSlug?: string }>;
      if (ce.detail?.shopSlug === shopSlug) refresh();
    };
    const onFavsChange = (e: Event) => {
      const ce = e as CustomEvent<{ shopSlug?: string }>;
      if (ce.detail?.shopSlug === shopSlug) refresh();
    };
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === `sellia-cart-${shopSlug}` ||
        e.key === `sellia-favs-${shopSlug}`
      ) {
        refresh();
      }
    };
    window.addEventListener("sellia-cart-change", onCartChange);
    window.addEventListener("sellia-favs-change", onFavsChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("sellia-cart-change", onCartChange);
      window.removeEventListener("sellia-favs-change", onFavsChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [shopSlug, refresh]);

  return (
    <CartContext.Provider value={{ cartCount, favsCount, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  return useContext(CartContext);
}
