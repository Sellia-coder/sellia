export interface CartItem {
  productId: string;
  productSlug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  emoji: string | null;
  /** physical | digital | service — défaut physical si absent (anciens paniers) */
  productType?: string | null;
  quantity: number;
  addedAt: number;
}

const CART_KEY = (shopSlug: string) => `sellia-cart-${shopSlug}`;
const FAVS_KEY = (shopSlug: string) => `sellia-favs-${shopSlug}`;

export function getCart(shopSlug: string): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY(shopSlug));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setCart(shopSlug: string, cart: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_KEY(shopSlug), JSON.stringify(cart));
    window.dispatchEvent(
      new CustomEvent("sellia-cart-change", { detail: { shopSlug } })
    );
  } catch (e) {
    console.error("[cart] setCart failed", e);
  }
}

export function addToCart(
  shopSlug: string,
  item: Omit<CartItem, "addedAt" | "quantity">,
  quantity = 1
): CartItem[] {
  const cart = getCart(shopSlug);
  const existing = cart.find((c) => c.productId === item.productId);
  let next: CartItem[];
  if (existing) {
    next = cart.map((c) =>
      c.productId === item.productId
        ? { ...c, quantity: Math.min(99, c.quantity + quantity) }
        : c
    );
  } else {
    next = [...cart, { ...item, quantity, addedAt: Date.now() }];
  }
  setCart(shopSlug, next);
  return next;
}

export function updateCartQuantity(
  shopSlug: string,
  productId: string,
  quantity: number
): CartItem[] {
  const cart = getCart(shopSlug);
  const next = cart
    .map((c) =>
      c.productId === productId
        ? { ...c, quantity: Math.max(0, Math.min(99, quantity)) }
        : c
    )
    .filter((c) => c.quantity > 0);
  setCart(shopSlug, next);
  return next;
}

export function removeFromCart(
  shopSlug: string,
  productId: string
): CartItem[] {
  const cart = getCart(shopSlug);
  const next = cart.filter((c) => c.productId !== productId);
  setCart(shopSlug, next);
  return next;
}

export function clearCart(shopSlug: string) {
  setCart(shopSlug, []);
}

export function getCartCount(shopSlug: string): number {
  return getCart(shopSlug).reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartSubtotal(shopSlug: string): number {
  return getCart(shopSlug).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
}

export function getFavorites(shopSlug: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVS_KEY(shopSlug));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(shopSlug: string, productId: string): boolean {
  const favs = getFavorites(shopSlug);
  const has = favs.includes(productId);
  const next = has
    ? favs.filter((id) => id !== productId)
    : [...favs, productId];
  try {
    localStorage.setItem(FAVS_KEY(shopSlug), JSON.stringify(next));
    window.dispatchEvent(
      new CustomEvent("sellia-favs-change", { detail: { shopSlug } })
    );
  } catch (e) {
    console.error("[favorites] toggleFavorite failed", e);
  }
  return !has;
}

export function isFavorite(shopSlug: string, productId: string): boolean {
  return getFavorites(shopSlug).includes(productId);
}

export function getFavoritesCount(shopSlug: string): number {
  return getFavorites(shopSlug).length;
}
