"use client";

import { useState } from "react";
import { ordersList, Order } from "@/lib/mock-data";

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  pending_payment: { label: "Paiement en attente", class: "warning" },
  confirmed: { label: "Confirmée", class: "info" },
  preparing: { label: "En préparation", class: "info" },
  shipped: { label: "Expédiée", class: "info" },
  delivered: { label: "Livrée", class: "success" },
  cancelled: { label: "Annulée", class: "danger" },
};

export default function OrdersPage() {
  const [filter, setFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = filter === "all" ? ordersList : ordersList.filter(o => o.status === filter);

  const stats = {
    today: 5,
    pending: ordersList.filter(o => o.status === "pending_payment").length,
    toShip: ordersList.filter(o => o.status === "preparing").length,
    delivered: ordersList.filter(o => o.status === "delivered").length,
  };

  return (
    <>
      <div className="dash-page-header dash-animate-fade-up">
        <div className="dash-page-header-left">
          <div className="dash-page-eyebrow">— Ventes</div>
          <h1 className="dash-page-title">Commandes</h1>
          <p className="dash-page-subtitle">Suivez et gérez toutes vos commandes en temps réel.</p>
        </div>
        <div className="dash-page-actions">
          <button className="dash-btn dash-btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Exporter
          </button>
        </div>
      </div>

      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-header"><span className="dash-stat-label">Aujourd&apos;hui</span></div>
          <div className="dash-stat-value">{stats.today}</div>
          <div className="dash-stat-trend dash-stat-trend-up">+2 vs hier</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-header"><span className="dash-stat-label">En attente paiement</span></div>
          <div className="dash-stat-value" style={{color:"rgb(180, 83, 9)"}}>{stats.pending}</div>
          <div className="dash-stat-trend" style={{background:"var(--dash-warning-bg)",color:"rgb(180, 83, 9)"}}>⚠ À suivre</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-header"><span className="dash-stat-label">À expédier</span></div>
          <div className="dash-stat-value" style={{color:"var(--dash-info)"}}>{stats.toShip}</div>
          <div className="dash-stat-trend dash-stat-trend-neutral">En préparation</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-header"><span className="dash-stat-label">Livrées (30J)</span></div>
          <div className="dash-stat-value" style={{color:"var(--dash-success)"}}>{stats.delivered}</div>
          <div className="dash-stat-trend dash-stat-trend-up">+18% vs mois dernier</div>
        </div>
      </div>

      <div className="dash-table-container dash-animate-fade-up dash-animate-delay-2">
        <div className="dash-table-header">
          <div className="dash-table-filters">
            <button className={`dash-filter-pill ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>Toutes <span className="dash-filter-count">{ordersList.length}</span></button>
            <button className={`dash-filter-pill ${filter === "pending_payment" ? "active" : ""}`} onClick={() => setFilter("pending_payment")}>Paiement attente <span className="dash-filter-count">{stats.pending}</span></button>
            <button className={`dash-filter-pill ${filter === "confirmed" ? "active" : ""}`} onClick={() => setFilter("confirmed")}>Confirmées</button>
            <button className={`dash-filter-pill ${filter === "preparing" ? "active" : ""}`} onClick={() => setFilter("preparing")}>Préparation</button>
            <button className={`dash-filter-pill ${filter === "shipped" ? "active" : ""}`} onClick={() => setFilter("shipped")}>Expédiées</button>
            <button className={`dash-filter-pill ${filter === "delivered" ? "active" : ""}`} onClick={() => setFilter("delivered")}>Livrées</button>
          </div>
        </div>

        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Commande</th>
                <th>Client</th>
                <th>Date</th>
                <th>Articles</th>
                <th>Paiement</th>
                <th>Total</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => {
                const statusMeta = STATUS_LABELS[order.status];
                return (
                  <tr key={order.id} onClick={() => setSelectedOrder(order)} style={{cursor:"pointer"}}>
                    <td><span className="dash-cell-mono" style={{color:"var(--dash-text-primary)",fontWeight:600}}>{order.number}</span></td>
                    <td>
                      <div className="dash-cell-customer">
                        <div className="dash-cell-customer-avatar" style={{background: order.customer.gradient}}>{order.customer.initial}</div>
                        <span style={{fontWeight:500}}>{order.customer.name}</span>
                      </div>
                    </td>
                    <td><span className="dash-cell-mono">{order.date}</span></td>
                    <td><span className="dash-cell-mono">{order.items} {order.items > 1 ? "articles" : "article"}</span></td>
                    <td><span className="dash-cell-mono">{order.payment}</span></td>
                    <td><span className="dash-cell-price">{order.total.toLocaleString("fr-FR")} FCFA</span></td>
                    <td><span className={`dash-badge dash-badge-${statusMeta.class}`}><span className="dash-badge-dot"></span>{statusMeta.label}</span></td>
                    <td>
                      <button className="dash-icon-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAWER DETAIL */}
      {selectedOrder && (
        <>
          <div className="dash-drawer-overlay" onClick={() => setSelectedOrder(null)}></div>
          <div className="dash-drawer">
            <div className="dash-drawer-header">
              <div>
                <div className="dash-drawer-eyebrow">Commande {selectedOrder.number}</div>
                <h2 className="dash-drawer-title">{selectedOrder.total.toLocaleString("fr-FR")} FCFA</h2>
              </div>
              <button className="dash-drawer-close" onClick={() => setSelectedOrder(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="dash-drawer-body">
              <div className="dash-drawer-section">
                <div className="dash-drawer-section-title">Client</div>
                <div className="dash-cell-customer" style={{padding:"8px 0"}}>
                  <div className="dash-cell-customer-avatar" style={{background: selectedOrder.customer.gradient, width:"36px", height:"36px", fontSize:"14px"}}>{selectedOrder.customer.initial}</div>
                  <div>
                    <div style={{fontWeight:600, fontSize:"13px"}}>{selectedOrder.customer.name}</div>
                    <div className="dash-cell-mono" style={{fontSize:"11px"}}>{selectedOrder.payment} · {selectedOrder.date}</div>
                  </div>
                </div>
              </div>

              <div className="dash-drawer-section">
                <div className="dash-drawer-section-title">Suivi de la commande</div>
                <div className="dash-timeline">
                  <div className={`dash-timeline-item ${["confirmed","preparing","shipped","delivered"].includes(selectedOrder.status) ? "done" : ""}`}>
                    <div className="dash-timeline-dot"></div>
                    <div className="dash-timeline-content">
                      <div className="dash-timeline-label">Commande passée</div>
                      <div className="dash-timeline-time">{selectedOrder.date}</div>
                    </div>
                  </div>
                  <div className={`dash-timeline-item ${["confirmed","preparing","shipped","delivered"].includes(selectedOrder.status) ? "done" : selectedOrder.status === "pending_payment" ? "active" : ""}`}>
                    <div className="dash-timeline-dot"></div>
                    <div className="dash-timeline-content">
                      <div className="dash-timeline-label">Paiement confirmé</div>
                      <div className="dash-timeline-time">{selectedOrder.payment}</div>
                    </div>
                  </div>
                  <div className={`dash-timeline-item ${["preparing","shipped","delivered"].includes(selectedOrder.status) ? "done" : selectedOrder.status === "confirmed" ? "active" : ""}`}>
                    <div className="dash-timeline-dot"></div>
                    <div className="dash-timeline-content">
                      <div className="dash-timeline-label">En préparation</div>
                      <div className="dash-timeline-time">Atelier Maison Aïda</div>
                    </div>
                  </div>
                  <div className={`dash-timeline-item ${["shipped","delivered"].includes(selectedOrder.status) ? "done" : selectedOrder.status === "preparing" ? "active" : ""}`}>
                    <div className="dash-timeline-dot"></div>
                    <div className="dash-timeline-content">
                      <div className="dash-timeline-label">Expédiée</div>
                      <div className="dash-timeline-time">Yango Delivery</div>
                    </div>
                  </div>
                  <div className={`dash-timeline-item ${selectedOrder.status === "delivered" ? "done" : selectedOrder.status === "shipped" ? "active" : ""}`}>
                    <div className="dash-timeline-dot"></div>
                    <div className="dash-timeline-content">
                      <div className="dash-timeline-label">Livrée</div>
                      <div className="dash-timeline-time">Confirmation client</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dash-drawer-section">
                <div className="dash-drawer-section-title">Actions</div>
                <button className="dash-btn dash-btn-ember" style={{width:"100%", marginBottom:"8px"}}>Marquer comme préparée</button>
                <button className="dash-btn dash-btn-secondary" style={{width:"100%"}}>Imprimer le bon de livraison</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
