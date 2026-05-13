"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";

export type DashboardLayoutShop = {
  slug: string;
  name: string;
  primaryColor: string;
};

export type DashboardLayoutUserHeader = {
  name: string;
  initial: string;
  plan: string;
};

interface Props {
  children: React.ReactNode;
  shop: DashboardLayoutShop | null;
  userHeader: DashboardLayoutUserHeader;
}

export default function DashboardLayoutClient({
  children,
  shop,
  userHeader,
}: Props) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  const isActive = (path: string) => pathname === path;
  const shopUrl = shop ? `https://${shop.slug}.getsellia.com` : null;
  const primary = shop?.primaryColor || "#E84B1F";

  return (
    <div className={`dash-app ${mobileSidebarOpen ? "sidebar-open" : ""}`}>
      <div className="dash-sidebar-overlay" onClick={() => setMobileSidebarOpen(false)}></div>

      <aside className="dash-sidebar">
        <div className="dash-sidebar-logo">
          <Link href="/dashboard" aria-label="Sellia" className="dash-sidebar-logo-link">
            <svg width="140" height="37" viewBox="0 0 220 60" fill="none">
              <path d="M 8 8 L 38 8 L 54 24 L 54 54 L 8 54 Z" fill="#0E1116"/>
              <circle cx="16" cy="16" r="2.4" fill="#FAFAF7"/>
              <path d="M 38 30 L 24 30 L 24 36 L 38 36 L 38 44 L 24 44" stroke="#E84B1F" strokeWidth="2.6" fill="none" strokeLinecap="square"/>
              <text x="68" y="44" fontFamily="Inter" fontSize="32" fontWeight="600" fill="#0E1116" letterSpacing="-1.2">sellia</text>
            </svg>
            <span className="dash-beta-badge">
              <span className="dash-beta-badge-dot"></span>
              BÊTA
            </span>
          </Link>
        </div>

        {shop && shopUrl ? (
          <a
            href={shopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="dash-sidebar-shop"
            aria-label={`Voir la boutique ${shop.name}`}
          >
            <div className="dash-sidebar-shop-logo" style={{ background: primary }}>
              {shop.name?.charAt(0)?.toUpperCase() || "S"}
            </div>
            <div className="dash-sidebar-shop-info">
              <div className="dash-sidebar-shop-name">{shop.name}</div>
              <div className="dash-sidebar-shop-url">
                <span className="dash-sidebar-shop-url-text">
                  {shop.slug}.getsellia.com
                </span>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  className="dash-sidebar-shop-icon"
                  aria-hidden
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </div>
            </div>
          </a>
        ) : (
          <div className="dash-sidebar-shop-placeholder">
            Aucune boutique liée à ce compte pour le moment.
          </div>
        )}

        <div className="dash-nav-section">
          <div className="dash-nav-section-label">Vue d&apos;ensemble</div>
          <Link className={`dash-nav-item ${isActive("/dashboard") ? "active" : ""}`} href="/dashboard">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Accueil
          </Link>
          <Link className={`dash-nav-item ${isActive("/dashboard/stats") ? "active" : ""}`} href="/dashboard/stats">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="20" x2="6" y2="14"/>
              <line x1="12" y1="20" x2="12" y2="9"/>
              <line x1="18" y1="20" x2="18" y2="4"/>
            </svg>
            Statistiques
          </Link>
        </div>

        <div className="dash-nav-section">
          <div className="dash-nav-section-label">Commerce</div>
          <Link className={`dash-nav-item ${pathname.startsWith("/dashboard/produits") ? "active" : ""}`} href="/dashboard/produits">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            Produits
            <span className="dash-nav-badge muted">12</span>
          </Link>
          <Link className={`dash-nav-item ${pathname.startsWith("/dashboard/commandes") ? "active" : ""}`} href="/dashboard/commandes">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
            Commandes
            <span className="dash-nav-badge">3</span>
          </Link>
          <Link className={`dash-nav-item ${pathname.startsWith("/dashboard/clients") ? "active" : ""}`} href="/dashboard/clients">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            Clients
          </Link>
        </div>

        <div className="dash-nav-section">
          <div className="dash-nav-section-label">Finances</div>
          <Link className={`dash-nav-item ${pathname.startsWith("/dashboard/paiements") ? "active" : ""}`} href="/dashboard/paiements">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
            Paiements
          </Link>
          <Link className={`dash-nav-item ${pathname.startsWith("/dashboard/promotions") ? "active" : ""}`} href="/dashboard/promotions">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            Promotions
          </Link>
        </div>

        <div className="dash-nav-section">
          <div className="dash-nav-section-label">Boutique</div>
          <Link className={`dash-nav-item ${pathname.startsWith("/dashboard/apparence") ? "active" : ""}`} href="/dashboard/apparence">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
            </svg>
            Apparence
          </Link>
          <Link className={`dash-nav-item ${pathname.startsWith("/dashboard/pages") ? "active" : ""}`} href="/dashboard/pages">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Pages & Contenu
          </Link>
          <Link className={`dash-nav-item ${pathname.startsWith("/dashboard/domaine") ? "active" : ""}`} href="/dashboard/domaine">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            SEO & Domaine
          </Link>
        </div>

        <div className="dash-nav-section">
          <div className="dash-nav-section-label">Paramètres</div>
          <Link className={`dash-nav-item ${pathname.startsWith("/dashboard/reglages") ? "active" : ""}`} href="/dashboard/reglages">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Réglages
          </Link>
        </div>

        <div className="dash-sidebar-bottom">
          <button
            className="dash-user-card"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            type="button"
            style={{ width: "100%", border: "none", background: userMenuOpen ? "var(--dash-bg-hover)" : "transparent" }}
          >
            <div className="dash-user-avatar">{userHeader.initial}</div>
            <div className="dash-user-info">
              <div className="dash-user-name">{userHeader.name}</div>
              <div className="dash-user-plan">Plan {userHeader.plan}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--dash-text-tertiary)" }}>
              <circle cx="12" cy="12" r="1"/>
              <circle cx="12" cy="5" r="1"/>
              <circle cx="12" cy="19" r="1"/>
            </svg>
          </button>

          {userMenuOpen && (
            <div className="dash-user-menu">
              <Link href="/dashboard/profil" className="dash-user-menu-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                Mon profil
              </Link>
              <Link href="/dashboard/parametres" className="dash-user-menu-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Paramètres compte
              </Link>
              <Link href="/dashboard/aide" className="dash-user-menu-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Aide & support
              </Link>
              <div className="dash-user-menu-divider"></div>
              <form action={signOutAction} style={{ margin: 0 }}>
                <button
                  type="submit"
                  className="dash-user-menu-item dash-user-menu-logout"
                  style={{ width: "100%", border: "none", background: "transparent", textAlign: "left", cursor: "pointer" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                  Se déconnecter
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>

      <div className="dash-main">
        <header className="dash-topbar">
          <button
            className="dash-mobile-toggle"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            aria-label="Ouvrir le menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <div className="dash-topbar-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Rechercher produits, commandes, clients..." />
            <span className="dash-topbar-shortcut">⌘ K</span>
          </div>

          <div className="dash-topbar-actions">
            {shop && shopUrl ? (
              <a
                href={shopUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="dash-topbar-shop-btn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                <span>Voir ma boutique</span>
              </a>
            ) : null}
            <div className="dash-topbar-divider"></div>
            <button className="dash-topbar-btn" aria-label="Aide">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </button>
            <button className="dash-topbar-btn dash-topbar-btn-notif" aria-label="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </button>
          </div>
        </header>

        <main className="dash-content">
          {children}
          <footer className="dash-footer">
            <div className="dash-footer-copyright">© 2026 Sellia · Une marque de Rollo Technologies Inc.</div>
            <div className="dash-footer-links">
              <a href="/conditions">Conditions</a>
              <span>·</span>
              <a href="/confidentialite">Confidentialité</a>
              <span>·</span>
              <a href="mailto:support@getsellia.com">Support</a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
