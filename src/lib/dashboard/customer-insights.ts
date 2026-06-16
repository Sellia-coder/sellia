/** Segments clients marchand — lecture / agrégation uniquement. */

export type CustomerSegment = "all" | "vip" | "repeat" | "new" | "inactive";

export type CustomerRow = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  city: string | null;
  totalOrders: number;
  totalSpent: number;
  averageOrder: number;
  firstOrderAt: string | null;
  lastOrderAt: string | null;
  tags: string[];
};

const INACTIVE_DAYS = 90;
const NEW_DAYS = 30;
const VIP_MIN_SPENT = 100_000;
const VIP_MIN_ORDERS = 5;

export function isVipCustomer(c: CustomerRow): boolean {
  if (c.tags.some((t) => t.toLowerCase() === "vip")) return true;
  return c.totalSpent >= VIP_MIN_SPENT || c.totalOrders >= VIP_MIN_ORDERS;
}

export function isRepeatCustomer(c: CustomerRow): boolean {
  return c.totalOrders > 1;
}

export function isNewCustomer(c: CustomerRow, now = Date.now()): boolean {
  if (!c.firstOrderAt) return false;
  const t = new Date(c.firstOrderAt).getTime();
  return now - t <= NEW_DAYS * 24 * 3600 * 1000;
}

export function isInactiveCustomer(c: CustomerRow, now = Date.now()): boolean {
  if (!c.lastOrderAt) return c.totalOrders === 0;
  const t = new Date(c.lastOrderAt).getTime();
  return now - t > INACTIVE_DAYS * 24 * 3600 * 1000;
}

export function getCustomerSegment(c: CustomerRow): CustomerSegment {
  if (isVipCustomer(c)) return "vip";
  if (isInactiveCustomer(c)) return "inactive";
  if (isNewCustomer(c)) return "new";
  if (isRepeatCustomer(c)) return "repeat";
  return "all";
}

export function segmentLabel(seg: CustomerSegment): string {
  switch (seg) {
    case "vip":
      return "VIP";
    case "repeat":
      return "Récurrent";
    case "new":
      return "Nouveau";
    case "inactive":
      return "Inactif";
    default:
      return "Client";
  }
}

export function filterBySegment(
  customers: CustomerRow[],
  segment: CustomerSegment
): CustomerRow[] {
  if (segment === "all") return customers;
  if (segment === "vip") return customers.filter(isVipCustomer);
  if (segment === "repeat") return customers.filter(isRepeatCustomer);
  if (segment === "new") return customers.filter(isNewCustomer);
  if (segment === "inactive") return customers.filter(isInactiveCustomer);
  return customers;
}

export function computeCustomerKpis(customers: CustomerRow[]) {
  const now = Date.now();
  const monthAgo = now - 30 * 24 * 3600 * 1000;
  const newThisMonth = customers.filter((c) => {
    if (!c.firstOrderAt) return false;
    return new Date(c.firstOrderAt).getTime() > monthAgo;
  }).length;
  const repeat = customers.filter(isRepeatCustomer).length;
  const inactive = customers.filter((c) => isInactiveCustomer(c, now)).length;
  const totalSpent = customers.reduce((s, c) => s + c.totalSpent, 0);
  const totalOrders = customers.reduce((s, c) => s + c.totalOrders, 0);
  const avgBasket =
    totalOrders > 0
      ? Math.round(totalSpent / totalOrders)
      : customers.length > 0
        ? Math.round(
            customers.reduce((s, c) => s + c.averageOrder, 0) / customers.length
          )
        : 0;

  return {
    total: customers.length,
    newThisMonth,
    repeat,
    inactive,
    avgBasket,
    totalRevenue: totalSpent,
  };
}

export type SegmentAnalytics = {
  id: CustomerSegment;
  label: string;
  criteria: string;
  count: number;
  revenue: number;
  revenuePct: number;
  clientPct: number;
};

export function computeSegmentAnalytics(
  customers: CustomerRow[]
): SegmentAnalytics[] {
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0) || 1;
  const total = customers.length || 1;

  const defs: Array<{
    id: CustomerSegment;
    label: string;
    criteria: string;
    match: (c: CustomerRow) => boolean;
  }> = [
    {
      id: "vip",
      label: "VIP",
      criteria: `≥ ${VIP_MIN_SPENT.toLocaleString("fr-FR")} FCFA dépensés ou ≥ ${VIP_MIN_ORDERS} commandes`,
      match: isVipCustomer,
    },
    {
      id: "repeat",
      label: "Récurrents",
      criteria: "2 commandes ou plus",
      match: isRepeatCustomer,
    },
    {
      id: "new",
      label: "Nouveaux",
      criteria: `Première commande < ${NEW_DAYS} jours`,
      match: isNewCustomer,
    },
    {
      id: "inactive",
      label: "Inactifs",
      criteria: `Sans achat depuis ${INACTIVE_DAYS} jours`,
      match: (c) => isInactiveCustomer(c),
    },
  ];

  return defs.map((d) => {
    const list = customers.filter(d.match);
    const revenue = list.reduce((s, c) => s + c.totalSpent, 0);
    return {
      id: d.id,
      label: d.label,
      criteria: d.criteria,
      count: list.length,
      revenue,
      revenuePct: Math.round((revenue / totalRevenue) * 100),
      clientPct: Math.round((list.length / total) * 100),
    };
  });
}

export function computeCityBreakdown(customers: CustomerRow[]) {
  const map = new Map<string, { count: number; revenue: number }>();
  for (const c of customers) {
    const city = c.city?.trim() || "Non renseigné";
    const cur = map.get(city) ?? { count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += c.totalSpent;
    map.set(city, cur);
  }
  return [...map.entries()]
    .map(([city, v]) => ({ city, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);
}

export const PAID_PAYMENT_STATUSES = [
  "paid_escrow",
  "paid_offline",
  "delivered",
  "paid_released",
] as const;

type OrderItemLite = {
  type?: string;
  price?: number;
  quantity?: number;
};

export function computeProductMixFromOrders(
  orders: Array<{ items: unknown; total: number }>
) {
  let physical = 0;
  let digital = 0;
  let service = 0;
  for (const o of orders) {
    const items = (o.items as OrderItemLite[]) || [];
    if (items.length === 0) {
      physical += o.total;
      continue;
    }
    for (const it of items) {
      const amt = Number(it.price ?? 0) * Number(it.quantity ?? 1);
      const t =
        it.type === "digital"
          ? "digital"
          : it.type === "service"
            ? "service"
            : "physical";
      if (t === "digital") digital += amt;
      else if (t === "service") service += amt;
      else physical += amt;
    }
  }
  const total = physical + digital + service || 1;
  return {
    physical,
    digital,
    service,
    physicalPct: Math.round((physical / total) * 100),
    digitalPct: Math.round((digital / total) * 100),
    servicePct: Math.round((service / total) * 100),
  };
}

export function computePaymentBreakdown(
  orders: Array<{ paymentMethod: string; total: number }>
) {
  const map = new Map<string, number>();
  for (const o of orders) {
    const key = o.paymentMethod?.trim() || "Autre";
    map.set(key, (map.get(key) ?? 0) + o.total);
  }
  const total = [...map.values()].reduce((a, b) => a + b, 0) || 1;
  return [...map.entries()]
    .map(([method, revenue]) => ({
      method,
      revenue,
      pct: Math.round((revenue / total) * 100),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);
}
