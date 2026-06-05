"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem =
  | { type: "link"; href: string; label: string; icon: string; active?: boolean }
  | { type: "divider" }
  | { type: "soon"; label: string; icon: string };

const NAV: NavItem[] = [
  { type: "link", href: "/admin", label: "Vue d'ensemble", icon: "📊" },
  { type: "link", href: "/admin/boutiques", label: "Boutiques", icon: "🏪" },
  { type: "link", href: "/admin/utilisateurs", label: "Utilisateurs", icon: "👥" },
  { type: "divider" },
  { type: "soon", label: "Transactions", icon: "💳" },
  { type: "soon", label: "Retraits", icon: "💸" },
  { type: "soon", label: "Abonnements", icon: "📈" },
  { type: "link", href: "/admin/signalements", label: "Signalements", icon: "🚩" },
  { type: "soon", label: "Support", icon: "🎫" },
  { type: "soon", label: "Paramètres", icon: "⚙️" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <div className="admin-sidebar-brand-title">Admin Sellia</div>
        <div className="admin-sidebar-brand-sub">Plateforme Fiable</div>
        <Link href="/dashboard" className="admin-back-link">
          ← Retour au site
        </Link>
      </div>

      <nav className="admin-nav" aria-label="Navigation administration">
        {NAV.map((item, i) => {
          if (item.type === "divider") {
            return <div key={`d-${i}`} className="admin-nav-divider" />;
          }
          if (item.type === "soon") {
            return (
              <button
                key={item.label}
                type="button"
                className="admin-nav-item disabled"
                disabled
                title="Bientôt disponible"
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
                <span className="admin-nav-soon">Bientôt</span>
              </button>
            );
          }
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${active ? "active" : ""}`}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
