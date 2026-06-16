import Link from "next/link";
import type { AdminTodoCounts } from "@/lib/admin/todo-counts";

export default function AdminTodoBanner({ counts }: { counts: AdminTodoCounts }) {
  if (counts.total === 0) return null;

  const items: { label: string; href: string; count: number }[] = [];

  if (counts.pendingWithdrawals > 0) {
    items.push({
      label: "Retraits en attente",
      href: "/admin/retraits",
      count: counts.pendingWithdrawals,
    });
  }
  if (counts.manualReviewWithdrawals > 0) {
    items.push({
      label: "Retraits à vérifier",
      href: "/admin/retraits?filter=manual",
      count: counts.manualReviewWithdrawals,
    });
  }
  if (counts.openReports > 0) {
    items.push({
      label: "Signalements ouverts",
      href: "/admin/signalements",
      count: counts.openReports,
    });
  }
  if (counts.openTickets > 0) {
    items.push({
      label: "Tickets support",
      href: "/admin/support",
      count: counts.openTickets,
    });
  }
  if (counts.newMerchantFeedbacks > 0) {
    items.push({
      label: "Feedback marchands",
      href: "/admin/feedback",
      count: counts.newMerchantFeedbacks,
    });
  }

  return (
    <div className="admin-todo-banner">
      <span className="admin-todo-banner-label">À traiter</span>
      <ul className="admin-todo-banner-list">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="admin-todo-banner-link">
              {item.label}
              <span className="admin-todo-banner-count">{item.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
