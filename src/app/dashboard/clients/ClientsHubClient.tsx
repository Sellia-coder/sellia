"use client";

import { useState } from "react";
import { Users, Star, ChatCircle } from "@phosphor-icons/react";
import CustomersListClient from "./CustomersListClient";
import ShopReviewsClient from "./ShopReviewsClient";
import ShopMessagesClient, {
  type ChatConversationRow,
} from "./ShopMessagesClient";
import styles from "./customers-list.module.css";
import type { CustomerRow } from "@/lib/dashboard/customer-insights";
import type { SegmentAnalytics } from "@/lib/dashboard/customer-insights";

export type ShopReviewRow = {
  id: string;
  authorName: string;
  rating: number;
  title: string | null;
  content: string;
  status: string;
  createdAt: string;
  merchantReply: string | null;
  merchantRepliedAt: string | null;
  product: { name: string; slug: string | null } | null;
};

type ProductMix = {
  physical: number;
  digital: number;
  service: number;
  physicalPct: number;
  digitalPct: number;
  servicePct: number;
};

type PaymentRow = { method: string; revenue: number; pct: number };
type CityRow = { city: string; count: number; revenue: number };

interface Props {
  currency: string;
  customers: CustomerRow[];
  reviews: ShopReviewRow[];
  conversations: ChatConversationRow[];
  unreadMessages: number;
  segments: SegmentAnalytics[];
  cities: CityRow[];
  productMix: ProductMix;
  paymentBreakdown: PaymentRow[];
}

type HubTab = "clients" | "reviews" | "messages";

export default function ClientsHubClient({
  currency,
  customers,
  reviews,
  conversations,
  unreadMessages,
  segments,
  cities,
  productMix,
  paymentBreakdown,
}: Props) {
  const [hubTab, setHubTab] = useState<HubTab>("clients");

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>— CLIENTS</span>
          <h1 className={styles.title}>Clients & avis</h1>
          <p className={styles.subtitle}>
            Suivez vos acheteurs, répondez aux messages et gérez les avis de
            votre boutique.
          </p>
        </div>
      </div>

      <div className={styles.hubTabsWrap}>
        <div className={styles.hubTabs}>
          <button
            type="button"
            className={`${styles.hubTab} ${hubTab === "clients" ? styles.hubTabActive : ""}`}
            onClick={() => setHubTab("clients")}
          >
            <Users size={16} weight="duotone" />
            Clients
          </button>
          <button
            type="button"
            className={`${styles.hubTab} ${hubTab === "messages" ? styles.hubTabActive : ""}`}
            onClick={() => setHubTab("messages")}
          >
            <ChatCircle size={16} weight="duotone" />
            Message de vos clients
            {unreadMessages > 0 ? (
              <span className={styles.hubTabBadgeUnread}>{unreadMessages}</span>
            ) : conversations.length > 0 ? (
              <span className={styles.hubTabBadge}>{conversations.length}</span>
            ) : null}
          </button>
          <button
            type="button"
            className={`${styles.hubTab} ${hubTab === "reviews" ? styles.hubTabActive : ""}`}
            onClick={() => setHubTab("reviews")}
          >
            <Star size={16} weight="duotone" />
            Avis
            {reviews.length > 0 ? (
              <span className={styles.hubTabBadge}>{reviews.length}</span>
            ) : null}
          </button>
        </div>
      </div>

      {hubTab === "clients" ? (
        <CustomersListClient
          currency={currency}
          customers={customers}
          segments={segments}
          cities={cities}
          productMix={productMix}
          paymentBreakdown={paymentBreakdown}
        />
      ) : hubTab === "messages" ? (
        <ShopMessagesClient conversations={conversations} />
      ) : (
        <ShopReviewsClient reviews={reviews} />
      )}
    </div>
  );
}
