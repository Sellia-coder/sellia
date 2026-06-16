"use client";

import {
  Storefront,
  Users,
  Coins,
  ChartLineUp,
  Clock,
  Receipt,
  UserCircle,
  Star,
  Prohibit,
} from "@phosphor-icons/react";
import type { PageKpiItem } from "@/lib/admin/page-stats";

const ICONS = {
  shops: Storefront,
  users: Users,
  gmv: Coins,
  revenue: ChartLineUp,
  withdrawals: Clock,
  orders: Receipt,
  clients: UserCircle,
  reviews: Star,
  blocked: Prohibit,
} as const;

export default function AdminKpiGrid({ items }: { items: PageKpiItem[] }) {
  return (
    <div className="admin-kpi-grid">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const wrapClass = item.ember
          ? "admin-kpi-icon-wrap admin-kpi-icon-wrap--ember"
          : "admin-kpi-icon-wrap admin-kpi-icon-wrap--neutral";
        const valueClass = "admin-kpi-value sellia-num";

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
