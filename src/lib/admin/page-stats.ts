/**
 * KPIs par page admin — agrégations lecture seule.
 * Importe metrics.ts / insights en lecture uniquement (ne pas modifier ces modules).
 */

import { db } from "@/lib/db";
import { PayoutStatus } from "@prisma/client";
import { ADMIN_PAID_PAYMENT_STATUSES, formatAdminMoney } from "./constants";
import { gmvByShopIds } from "./metrics";
import { getShopReviewStatsList, getFulfillmentCounts } from "./insights";
import { listWithdrawalGroups } from "@/lib/payouts/withdrawal";
import { ADMIN_ROLE } from "@/lib/auth/admin";

export type PageKpiItem = {
  label: string;
  value: string;
  hint?: string;
  icon:
    | "shops"
    | "users"
    | "gmv"
    | "revenue"
    | "withdrawals"
    | "orders"
    | "clients"
    | "reviews"
    | "blocked";
  ember?: boolean;
};

const paidWhere = {
  paymentStatus: { in: [...ADMIN_PAID_PAYMENT_STATUSES] },
};

function monthStart(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function todayStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getBoutiquesPageKpis(): Promise<PageKpiItem[]> {
  const start = monthStart();
  const [total, published, newMonth, byPlan] = await Promise.all([
    db.shop.count(),
    db.shop.count({ where: { isPublished: true } }),
    db.shop.count({ where: { createdAt: { gte: start } } }),
    db.shop.groupBy({ by: ["plan"], _count: { id: true } }),
  ]);
  const pro = byPlan.find((p) => p.plan === "pro")?._count.id ?? 0;
  const business = byPlan.find((p) => p.plan === "business")?._count.id ?? 0;

  return [
    { label: "Total boutiques", value: String(total), icon: "shops" },
    {
      label: "Publiées",
      value: String(published),
      hint: `${total > 0 ? Math.round((published / total) * 100) : 0} %`,
      icon: "shops",
      ember: true,
    },
    { label: "Nouvelles ce mois", value: String(newMonth), icon: "shops" },
    {
      label: "Plans Pro / Business",
      value: `${pro} / ${business}`,
      icon: "shops",
    },
  ];
}

export async function getTransactionsPageKpis(): Promise<PageKpiItem[]> {
  const startMonth = monthStart();
  const startToday = todayStart();
  const [gmvAgg, monthAgg, todayAgg, count, avg] = await Promise.all([
    db.order.aggregate({ where: paidWhere, _sum: { total: true } }),
    db.order.aggregate({
      where: { ...paidWhere, createdAt: { gte: startMonth } },
      _sum: { total: true },
      _count: { id: true },
    }),
    db.order.aggregate({
      where: { ...paidWhere, createdAt: { gte: startToday } },
      _sum: { total: true },
      _count: { id: true },
    }),
    db.order.count({ where: paidWhere }),
    db.order.aggregate({ where: paidWhere, _avg: { total: true } }),
  ]);

  return [
    {
      label: "Volume total",
      value: formatAdminMoney(gmvAgg._sum.total ?? 0),
      icon: "gmv",
      ember: true,
    },
    {
      label: "Ce mois",
      value: formatAdminMoney(monthAgg._sum.total ?? 0),
      hint: `${monthAgg._count.id} commandes`,
      icon: "gmv",
    },
    {
      label: "Aujourd'hui",
      value: formatAdminMoney(todayAgg._sum.total ?? 0),
      hint: `${todayAgg._count.id} commandes`,
      icon: "orders",
    },
    {
      label: "Panier moyen",
      value:
        avg._avg.total != null ? formatAdminMoney(avg._avg.total) : "—",
      hint: `${count} commandes payées`,
      icon: "orders",
    },
  ];
}

export async function getRetraitsPageKpis(): Promise<PageKpiItem[]> {
  const groups = await listWithdrawalGroups();
  const manual = groups.filter((g) => g.manualReviewRequired).length;
  const paidAgg = await db.payout.aggregate({
    where: { status: { in: [PayoutStatus.SUCCESS, PayoutStatus.PAID] } },
    _sum: { netAmount: true },
    _count: { id: true },
  });
  const avg =
    paidAgg._count.id > 0
      ? Number(paidAgg._sum.netAmount ?? 0) / paidAgg._count.id
      : null;

  return [
    {
      label: "En attente",
      value: String(groups.filter((g) => g.status === PayoutStatus.REQUESTED).length),
      icon: "withdrawals",
      ember: true,
    },
    {
      label: "À vérifier",
      value: String(manual),
      icon: "withdrawals",
    },
    {
      label: "Total versé",
      value: formatAdminMoney(Number(paidAgg._sum.netAmount ?? 0)),
      icon: "gmv",
    },
    {
      label: "Montant moyen",
      value: avg != null ? formatAdminMoney(avg) : "—",
      icon: "withdrawals",
    },
  ];
}

export async function getClientsPageKpis(): Promise<PageKpiItem[]> {
  const [total, repeat, top, avg] = await Promise.all([
    db.customer.count(),
    db.customer.count({ where: { totalOrders: { gt: 1 } } }),
    db.customer.findFirst({
      orderBy: { totalSpent: "desc" },
      select: { totalSpent: true },
    }),
    db.customer.aggregate({ _avg: { totalSpent: true } }),
  ]);

  return [
    { label: "Total clients", value: String(total), icon: "clients" },
    {
      label: "Récurrents",
      value: String(repeat),
      hint: "Plus d'une commande",
      icon: "clients",
    },
    {
      label: "Panier moyen",
      value:
        avg._avg.totalSpent != null
          ? formatAdminMoney(avg._avg.totalSpent)
          : "—",
      icon: "gmv",
    },
    {
      label: "Top dépensier",
      value: top ? formatAdminMoney(top.totalSpent) : "—",
      icon: "clients",
      ember: true,
    },
  ];
}

export async function getAvisPageKpis(): Promise<PageKpiItem[]> {
  const [reviewAgg, positiveCount, stats] = await Promise.all([
    db.review.aggregate({
      where: { status: { in: ["approved", "pending"] } },
      _avg: { rating: true },
      _count: { id: true },
    }),
    db.review.count({
      where: { status: { in: ["approved", "pending"] }, rating: { gte: 4 } },
    }),
    getShopReviewStatsList(),
  ]);
  const total = reviewAgg._count.id;
  const avg = reviewAgg._avg.rating ?? 0;
  const pct = total > 0 ? Math.round((positiveCount / total) * 100) : 0;

  return [
    {
      label: "Note moyenne",
      value: total > 0 ? avg.toFixed(1) : "—",
      hint: "Sur 5",
      icon: "reviews",
      ember: true,
    },
    { label: "Nombre d'avis", value: String(total), icon: "reviews" },
    {
      label: "Avis positifs",
      value: total > 0 ? `${pct} %` : "—",
      hint: "4★ et 5★",
      icon: "reviews",
    },
    {
      label: "Boutiques notées",
      value: String(stats.filter((s) => s.reviewCount > 0).length),
      icon: "shops",
    },
  ];
}

export async function getCommandesPageKpis(): Promise<PageKpiItem[]> {
  const counts = await getFulfillmentCounts();
  return [
    {
      label: "En cours",
      value: String(counts.in_progress),
      icon: "orders",
    },
    {
      label: "Attente livraison",
      value: String(counts.pending_delivery),
      icon: "orders",
      ember: true,
    },
    {
      label: "Livrées",
      value: String(counts.delivered),
      icon: "orders",
    },
    {
      label: "Total suivi",
      value: String(counts.total),
      icon: "orders",
    },
  ];
}

export async function getUtilisateursPageKpis(): Promise<PageKpiItem[]> {
  const start = monthStart();
  const [total, admins, blocked, newMonth] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: ADMIN_ROLE } }),
    db.user.count({ where: { isBlocked: true } }),
    db.user.count({ where: { createdAt: { gte: start } } }),
  ]);

  return [
    { label: "Total comptes", value: String(total), icon: "users" },
    { label: "Administrateurs", value: String(admins), icon: "users" },
    {
      label: "Bloqués",
      value: String(blocked),
      icon: "blocked",
      ember: blocked > 0,
    },
    { label: "Nouveaux ce mois", value: String(newMonth), icon: "users" },
  ];
}

export async function getSignalementsPageKpis(): Promise<PageKpiItem[]> {
  const [pending, reviewing, resolved] = await Promise.all([
    db.productReport.count({ where: { status: "PENDING" } }),
    db.productReport.count({ where: { status: "REVIEWING" } }),
    db.productReport.count({ where: { status: "RESOLVED" } }),
  ]);
  return [
    {
      label: "En attente",
      value: String(pending),
      icon: "orders",
      ember: pending > 0,
    },
    { label: "En cours", value: String(reviewing), icon: "orders" },
    { label: "Résolus", value: String(resolved), icon: "orders" },
    {
      label: "Total actifs",
      value: String(pending + reviewing),
      icon: "orders",
    },
  ];
}

export async function getSoldesPageKpis(): Promise<PageKpiItem[]> {
  const { getAllShopBalancesMap } = await import("./insights");
  const [shopCount, balancesMap] = await Promise.all([
    db.shop.count(),
    getAllShopBalancesMap(),
  ]);
  let totalAvailable = 0;
  let totalEscrow = 0;
  let totalInProgress = 0;
  let totalPaid = 0;
  for (const b of Object.values(balancesMap)) {
    totalAvailable += b.available;
    totalEscrow += b.pendingEscrow;
    totalInProgress += b.inProgress;
    totalPaid += b.paidTotal;
  }
  return [
    {
      label: "Boutiques suivies",
      value: String(shopCount),
      icon: "shops",
    },
    {
      label: "Disponible (total)",
      value: formatAdminMoney(totalAvailable),
      icon: "gmv",
      ember: true,
    },
    {
      label: "En séquestre",
      value: formatAdminMoney(totalEscrow),
      icon: "withdrawals",
    },
    {
      label: "Déjà versé",
      value: formatAdminMoney(totalPaid),
      hint:
        totalInProgress > 0
          ? `${formatAdminMoney(totalInProgress)} en cours`
          : undefined,
      icon: "revenue",
    },
  ];
}

export async function getClassementPageKpis(): Promise<PageKpiItem[]> {
  const { getMerchantRanking } = await import("./insights");
  const rows = await getMerchantRanking();
  if (rows.length === 0) {
    return [
      { label: "Marchands classés", value: "0", icon: "shops" },
      { label: "GMV cumulé (top 10)", value: "—", icon: "gmv" },
      { label: "Meilleur score", value: "—", icon: "reviews" },
      { label: "Note moy. (top 10)", value: "—", icon: "reviews" },
    ];
  }
  const top10 = rows.slice(0, 10);
  const gmvTop = top10.reduce((s, r) => s + r.gmv, 0);
  const rated = top10.filter((r) => r.reviewCount > 0);
  const avgRating =
    rated.length > 0
      ? rated.reduce((s, r) => s + r.avgRating, 0) / rated.length
      : null;
  return [
    { label: "Marchands classés", value: String(rows.length), icon: "shops" },
    {
      label: "GMV cumulé (top 10)",
      value: formatAdminMoney(gmvTop),
      icon: "gmv",
      ember: true,
    },
    {
      label: "Meilleur score",
      value: rows[0] ? String(Math.round(rows[0].score)) : "—",
      hint: rows[0]?.shopName,
      icon: "reviews",
    },
    {
      label: "Note moy. (top 10)",
      value: avgRating != null ? avgRating.toFixed(1) : "—",
      hint: "Sur 5",
      icon: "reviews",
    },
  ];
}

export async function getAbonnementsPageKpis(): Promise<PageKpiItem[]> {
  const { getAdminAbonnementsData } = await import("./abonnements");
  const data = await getAdminAbonnementsData();
  const pro = data.planDistribution.find((p) => p.plan === "pro");
  const business = data.planDistribution.find((p) => p.plan === "business");
  const starter = data.planDistribution.find((p) => p.plan === "starter");
  return [
    {
      label: "Revenus Sellia",
      value:
        data.totalRevenue != null
          ? formatAdminMoney(data.totalRevenue)
          : "—",
      hint: "Commissions encaissées",
      icon: "revenue",
      ember: true,
    },
    {
      label: "Plan Pro",
      value: String(pro?.count ?? 0),
      hint: pro ? `${pro.percent} %` : undefined,
      icon: "shops",
    },
    {
      label: "Plan Business",
      value: String(business?.count ?? 0),
      hint: business ? `${business.percent} %` : undefined,
      icon: "shops",
    },
    {
      label: "Plan Starter",
      value: String(starter?.count ?? 0),
      hint: starter ? `${starter.percent} %` : undefined,
      icon: "shops",
    },
  ];
}

export async function getAuditPageKpis(): Promise<PageKpiItem[]> {
  const { countAdminAuditLogs } = await import("./audit-log");
  const startMonth = monthStart();
  const startToday = todayStart();
  const [total, month, today] = await Promise.all([
    countAdminAuditLogs({}),
    countAdminAuditLogs({ from: startMonth }),
    countAdminAuditLogs({ from: startToday }),
  ]);
  return [
    { label: "Actions enregistrées", value: String(total), icon: "users" },
    {
      label: "Ce mois",
      value: String(month),
      icon: "orders",
      ember: month > 0,
    },
    { label: "Aujourd'hui", value: String(today), icon: "orders" },
    {
      label: "Dernière activité",
      value: total > 0 ? "Voir journal" : "—",
      hint: "Lecture seule",
      icon: "blocked",
    },
  ];
}

export async function getSupportPageKpis(): Promise<PageKpiItem[]> {
  const [open, waiting, closed] = await Promise.all([
    db.supportTicket.count({ where: { status: "OPEN" } }),
    db.supportTicket.count({
      where: { status: { in: ["WAITING_USER", "WAITING_SUPPORT"] } },
    }),
    db.supportTicket.count({ where: { status: "CLOSED" } }),
  ]);
  return [
    { label: "Ouverts", value: String(open), icon: "orders", ember: open > 0 },
    { label: "En attente", value: String(waiting), icon: "orders" },
    { label: "Fermés", value: String(closed), icon: "orders" },
    { label: "À traiter", value: String(open + waiting), icon: "orders" },
  ];
}
