"use client";

import { useEffect, useState } from "react";
import { Globe, MapPin, Users, Eye } from "@phosphor-icons/react";
import type { VisitStats } from "@/lib/shop-visits";
import styles from "./VisitAudienceBlock.module.css";

interface Props {
  initialStats: VisitStats | null;
}

const POLL_MS = 30_000;

export default function VisitAudienceBlock({ initialStats }: Props) {
  const [stats, setStats] = useState<VisitStats | null>(initialStats);
  const [livePulse, setLivePulse] = useState(true);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/dashboard/stats/visits");
        if (!res.ok) return;
        const data = await res.json();
        if (data.ok && data.stats) {
          setStats(data.stats);
          setLivePulse((p) => !p);
        }
      } catch {
        /* ignore polling errors */
      }
    }, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>— AUDIENCE</span>
          <h2 className={styles.sectionTitle}>Visites de la boutique</h2>
          <p className={styles.sectionSubtitle}>
            Les statistiques de visite seront disponibles après application de la
            migration base de données.
          </p>
        </div>
      </div>
    );
  }

  const maxCountry =
    stats.topCountries.length > 0
      ? Math.max(...stats.topCountries.map((c) => c.count))
      : 1;
  const maxCity =
    stats.topCities.length > 0
      ? Math.max(...stats.topCities.map((c) => c.count))
      : 1;

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.eyebrow}>— AUDIENCE</span>
        <h2 className={styles.sectionTitle}>Visites de la boutique</h2>
        <p className={styles.sectionSubtitle}>
          Audience anonymisée — pays via Cloudflare, sans adresse IP stockée.
        </p>
      </div>

      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>
            <Eye size={18} weight="duotone" />
          </div>
          <span className={styles.kpiLabel}>Aujourd&apos;hui</span>
          <span className={styles.kpiValue}>{stats.today}</span>
          <span className={styles.kpiHint}>visites</span>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>
            <Eye size={18} weight="duotone" />
          </div>
          <span className={styles.kpiLabel}>Ce mois</span>
          <span className={styles.kpiValue}>{stats.month}</span>
          <span className={styles.kpiHint}>visites</span>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>
            <Eye size={18} weight="duotone" />
          </div>
          <span className={styles.kpiLabel}>Total</span>
          <span className={styles.kpiValue}>{stats.total}</span>
          <span className={styles.kpiHint}>visites</span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiCardLive}`}>
          <div className={styles.kpiIcon}>
            <Users size={18} weight="duotone" />
          </div>
          <span className={styles.kpiLabel}>En temps réel</span>
          <span className={styles.kpiValue}>
            <span
              className={`${styles.liveDot} ${livePulse ? styles.liveDotPulse : ""}`}
              aria-hidden
            />
            {stats.liveVisitors}
          </span>
          <span className={styles.kpiHint}>visiteurs actifs (~5 min)</span>
        </div>
      </div>

      <div className={styles.geoGrid}>
        <div className={styles.geoPanel}>
          <div className={styles.geoPanelHead}>
            <Globe size={16} weight="duotone" />
            <h3>Top pays</h3>
          </div>
          {stats.topCountries.length === 0 ? (
            <p className={styles.geoEmpty}>
              Aucune donnée géographique pour le moment. Le pays est détecté via
              l&apos;en-tête Cloudflare CF-IPCountry.
            </p>
          ) : (
            <ul className={styles.geoList}>
              {stats.topCountries.map((row) => (
                <li key={row.code} className={styles.geoRow}>
                  <span className={styles.geoLabel}>{row.label}</span>
                  <div className={styles.geoBarWrap}>
                    <div
                      className={styles.geoBar}
                      style={{ width: `${(row.count / maxCountry) * 100}%` }}
                    />
                  </div>
                  <span className={styles.geoCount}>{row.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.geoPanel}>
          <div className={styles.geoPanelHead}>
            <MapPin size={16} weight="duotone" />
            <h3>Top villes</h3>
          </div>
          {!stats.cityDataAvailable ? (
            <p className={styles.geoEmpty}>
              Ville non disponible — les en-têtes CF-IPCity / CF-Region ne sont
              pas exposés sur cet environnement. Seul le pays est enregistré.
            </p>
          ) : (
            <ul className={styles.geoList}>
              {stats.topCities.map((row) => (
                <li
                  key={`${row.label}-${row.country}`}
                  className={styles.geoRow}
                >
                  <span className={styles.geoLabel}>
                    {row.label}
                    <small>{row.country}</small>
                  </span>
                  <div className={styles.geoBarWrap}>
                    <div
                      className={styles.geoBar}
                      style={{ width: `${(row.count / maxCity) * 100}%` }}
                    />
                  </div>
                  <span className={styles.geoCount}>{row.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
