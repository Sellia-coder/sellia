import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import ClientsHubClient from "./ClientsHubClient";
import {
  computeSegmentAnalytics,
  computeCityBreakdown,
  computeProductMixFromOrders,
  computePaymentBreakdown,
  PAID_PAYMENT_STATUSES,
  type CustomerRow,
} from "@/lib/dashboard/customer-insights";

export default async function CustomersListPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/connexion");

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: { id: true, currency: true },
  });

  if (!shop) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Aucune boutique trouvée</h2>
      </div>
    );
  }

  const [customersRaw, reviewsRaw, paidOrders, conversationsRaw] = await Promise.all([
    db.customer.findMany({
      where: { shopId: shop.id },
      orderBy: { lastOrderAt: "desc" },
    }),
    db.review.findMany({
      where: { shopId: shop.id },
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true, slug: true } },
      },
    }),
    db.order.findMany({
      where: {
        shopId: shop.id,
        paymentStatus: { in: [...PAID_PAYMENT_STATUSES] },
      },
      select: {
        total: true,
        items: true,
        paymentMethod: true,
      },
    }),
    db.chatConversation.findMany({
      where: { shopId: shop.id },
      orderBy: { lastMessageAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 200,
          select: {
            id: true,
            sender: true,
            content: true,
            flagged: true,
            blockedReason: true,
            createdAt: true,
          },
        },
      },
    }),
  ]);

  const customers: CustomerRow[] = customersRaw.map((c) => ({
    id: c.id,
    fullName: c.fullName,
    phone: c.phone,
    email: c.email,
    city: c.city,
    totalOrders: c.totalOrders,
    totalSpent: c.totalSpent,
    averageOrder: c.averageOrder,
    firstOrderAt: c.firstOrderAt?.toISOString() || null,
    lastOrderAt: c.lastOrderAt?.toISOString() || null,
    tags: c.tags || [],
  }));

  const reviews = reviewsRaw.map((r) => ({
    id: r.id,
    authorName: r.authorName,
    rating: r.rating,
    title: r.title,
    content: r.content,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    merchantReply: r.merchantReply,
    merchantRepliedAt: r.merchantRepliedAt?.toISOString() || null,
    product: r.product
      ? { name: r.product.name, slug: r.product.slug }
      : null,
  }));

  const conversations = conversationsRaw.map((c) => ({
    id: c.id,
    customerName: c.customerName,
    customerEmail: c.customerEmail,
    status: c.status,
    unreadForMerchant: c.unreadForMerchant,
    lastMessageAt: c.lastMessageAt.toISOString(),
    lastMessagePreview: c.lastMessagePreview,
    messages: c.messages.map((m) => ({
      id: m.id,
      sender:
        m.sender === "CUSTOMER"
          ? ("customer" as const)
          : m.sender === "MERCHANT"
            ? ("merchant" as const)
            : ("system" as const),
      content: m.content,
      flagged: m.flagged,
      blockedReason: m.blockedReason,
      createdAt: m.createdAt.toISOString(),
    })),
  }));

  const unreadMessages = conversations.reduce(
    (sum, c) => sum + c.unreadForMerchant,
    0
  );

  const segments = computeSegmentAnalytics(customers);
  const cities = computeCityBreakdown(customers);
  const productMix = computeProductMixFromOrders(paidOrders);
  const paymentBreakdown = computePaymentBreakdown(paidOrders);

  return (
    <ClientsHubClient
      currency={shop.currency || "FCFA"}
      customers={customers}
      reviews={reviews}
      conversations={conversations}
      unreadMessages={unreadMessages}
      segments={segments}
      cities={cities}
      productMix={productMix}
      paymentBreakdown={paymentBreakdown}
    />
  );
}
