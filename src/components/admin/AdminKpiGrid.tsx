"use client";

import {
  Storefront,
  Users,
  Coins,
  ChartLineUp,
  Clock,
  Receipt,
} from "@phosphor-icons/react";

type KpiItem = {
  label: string;
  value: string;
  hint?: string;
  icon: "shops" | "users" | "gmv" | "revenue" | "withdrawals" | "orders";
  ember?: boolean;
};

const ICONS = {
  shops: Storefront,
  users: Users,
  gmv: Coins,
  revenue: ChartLineUp,
  withdrawals: Clock,
  orders: Receipt,
} as const;

export default function AdminKpiGrid({ items }: { items: KpiItem[] }) {
  return (
    <div className="admin-kpi-grid">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const wrapClass = item.ember
          ? "admin-kpi-icon-wrap admin-kpi-icon-wrap--ember"
          : "admin-kpi-icon-wrap admin-kpi-icon-wrap--neutral";
        const valueClass =
          item.icon === "shops" || item.icon === "users" || item.icon === "withdrawals" || item.icon === "orders"
            ? "admin-kpi-value admin-kpi-value--inter"
            : "admin-kpi-value";

        return (
          <div key={item.label} className="admin-kpi">
            <div className={wrapClass}>
              <Icon size={18} weight="duotone" />
            </div>
            <div className="admin-kpi-label">{item.label}</div>
            <div className={valueClass}>{item.value}</div>
            {item.hint ? <div className="admin-kpi-hint">{item.hint}</div> : null}
          </div>
        );
      })}
    </div>
  );
}
