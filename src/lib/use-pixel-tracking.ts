"use client";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    ttq?: { track: (...args: unknown[]) => void };
    snaptr?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

interface ProductEvent {
  productId: string;
  productName: string;
  price: number;
  currency: string;
  quantity?: number;
}

interface PurchaseEvent {
  orderId: string;
  total: number;
  currency: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export function usePixelTracking() {
  const trackViewContent = (event: ProductEvent) => {
    if (typeof window === "undefined") return;

    if (window.gtag) {
      window.gtag("event", "view_item", {
        currency: event.currency,
        value: event.price,
        items: [
          {
            item_id: event.productId,
            item_name: event.productName,
            price: event.price,
            quantity: 1,
          },
        ],
      });
    }

    if (window.fbq) {
      window.fbq("track", "ViewContent", {
        content_ids: [event.productId],
        content_name: event.productName,
        content_type: "product",
        value: event.price,
        currency: event.currency,
      });
    }

    if (window.ttq) {
      window.ttq.track("ViewContent", {
        contents: [
          {
            content_id: event.productId,
            content_name: event.productName,
          },
        ],
        value: event.price,
        currency: event.currency,
      });
    }

    if (window.snaptr) {
      window.snaptr("track", "VIEW_CONTENT", {
        item_ids: [event.productId],
        price: event.price,
        currency: event.currency,
      });
    }
  };

  const trackAddToCart = (event: ProductEvent) => {
    if (typeof window === "undefined") return;
    const qty = event.quantity || 1;
    const value = event.price * qty;

    if (window.gtag) {
      window.gtag("event", "add_to_cart", {
        currency: event.currency,
        value,
        items: [
          {
            item_id: event.productId,
            item_name: event.productName,
            price: event.price,
            quantity: qty,
          },
        ],
      });
    }

    if (window.fbq) {
      window.fbq("track", "AddToCart", {
        content_ids: [event.productId],
        content_name: event.productName,
        value,
        currency: event.currency,
      });
    }

    if (window.ttq) {
      window.ttq.track("AddToCart", {
        contents: [
          {
            content_id: event.productId,
            content_name: event.productName,
            quantity: qty,
          },
        ],
        value,
        currency: event.currency,
      });
    }

    if (window.snaptr) {
      window.snaptr("track", "ADD_CART", {
        item_ids: [event.productId],
        price: value,
        currency: event.currency,
      });
    }
  };

  const trackInitiateCheckout = (
    value: number,
    currency: string,
    itemsCount: number
  ) => {
    if (typeof window === "undefined") return;

    if (window.gtag) {
      window.gtag("event", "begin_checkout", { currency, value });
    }
    if (window.fbq) {
      window.fbq("track", "InitiateCheckout", {
        value,
        currency,
        num_items: itemsCount,
      });
    }
    if (window.ttq) {
      window.ttq.track("InitiateCheckout", { value, currency });
    }
    if (window.snaptr) {
      window.snaptr("track", "START_CHECKOUT", { price: value, currency });
    }
  };

  const trackPurchase = (event: PurchaseEvent) => {
    if (typeof window === "undefined") return;

    if (window.gtag) {
      window.gtag("event", "purchase", {
        transaction_id: event.orderId,
        value: event.total,
        currency: event.currency,
        items: event.items.map((i) => ({
          item_id: i.productId,
          item_name: i.productName,
          price: i.price,
          quantity: i.quantity,
        })),
      });
    }

    if (window.fbq) {
      window.fbq("track", "Purchase", {
        value: event.total,
        currency: event.currency,
        content_ids: event.items.map((i) => i.productId),
        content_type: "product",
        num_items: event.items.length,
      });
    }

    if (window.ttq) {
      window.ttq.track("CompletePayment", {
        value: event.total,
        currency: event.currency,
        contents: event.items.map((i) => ({
          content_id: i.productId,
          content_name: i.productName,
          quantity: i.quantity,
        })),
      });
    }

    if (window.snaptr) {
      window.snaptr("track", "PURCHASE", {
        item_ids: event.items.map((i) => i.productId),
        price: event.total,
        currency: event.currency,
        transaction_id: event.orderId,
      });
    }
  };

  return {
    trackViewContent,
    trackAddToCart,
    trackInitiateCheckout,
    trackPurchase,
  };
}
