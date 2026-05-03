// Mock data pour le dashboard Sellia
// Sera remplacé par de vraies API calls quand le backend sera prêt

export interface Shop {
  id: string;
  name: string;
  domain: string;
  initial: string;
  plan: "Découverte" | "Pro";
}

export interface User {
  id: string;
  name: string;
  email: string;
  initial: string;
  plan: "Découverte" | "Pro";
}

export interface KPI {
  label: string;
  value: string;
  unit?: string;
  trend: number;
  trendType: "up" | "down" | "neutral";
  period: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "low_stock" | "out_of_stock" | "draft";
  sales: number;
  imageGradient: string;
}

export interface ActivityItem {
  id: string;
  type: "order" | "pending" | "new_customer" | "stock_alert";
  text: string;
  meta: string;
  amount?: number;
  amountType?: "positive" | "neutral";
}

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  done: boolean;
}

export const currentShop: Shop = {
  id: "shop_1",
  name: "Maison Aïda",
  domain: "maison-aida.getsellia.com",
  initial: "M",
  plan: "Pro",
};

export const currentUser: User = {
  id: "user_1",
  name: "KONO Christian",
  email: "kono@example.com",
  initial: "K",
  plan: "Pro",
};

export const homeKPIs: KPI[] = [
  { label: "Ventes du jour", value: "247 500", unit: "FCFA", trend: 18.4, trendType: "up", period: "7 derniers jours" },
  { label: "Commandes", value: "23", trend: 12, trendType: "up", period: "7 derniers jours" },
  { label: "Visiteurs", value: "1 482", trend: 34, trendType: "up", period: "7 derniers jours" },
  { label: "Taux de conversion", value: "1.55", unit: "%", trend: -2.1, trendType: "down", period: "7 derniers jours" },
];

export const checklistItems: ChecklistItem[] = [
  { id: "identity", label: "Identité boutique", description: "Nom, logo et tagline configurés", done: true },
  { id: "products", label: "Premiers produits", description: "12 produits importés et configurés", done: true },
  { id: "payments", label: "Méthodes de paiement", description: "Mobile Money + Cartes bancaires actifs", done: true },
  { id: "delivery", label: "Zones de livraison", description: "Définir vos zones et tarifs de livraison", done: false },
  { id: "contact", label: "Contact & profil business", description: "WhatsApp, email, adresse, KYC léger", done: false },
];

export const recentActivities: ActivityItem[] = [
  { id: "1", type: "order", text: "<strong>Fatou D.</strong> a passé une commande", meta: "Il y a 12 min · MTN MoMo", amount: 34500, amountType: "positive" },
  { id: "2", type: "pending", text: "<strong>Commande #1247</strong> en attente de paiement", meta: "Il y a 28 min · Awa K.", amount: 12000, amountType: "neutral" },
  { id: "3", type: "new_customer", text: "<strong>Nouveau client</strong> inscrit · Ibrahim N.", meta: "Il y a 1h" },
  { id: "4", type: "order", text: "<strong>Marie-Claire</strong> a passé une commande", meta: "Il y a 2h · Orange Money", amount: 28900, amountType: "positive" },
  { id: "5", type: "stock_alert", text: "<strong>Stock faible</strong> · Robe Aïda — Taille M", meta: "Il y a 3h · 2 unités" },
];

// STATS PAGE
export const statsKPIs: KPI[] = [
  { label: "CA total", value: "8 247 500", unit: "FCFA", trend: 24.8, trendType: "up", period: "30J" },
  { label: "Commandes", value: "187", trend: 18.3, trendType: "up", period: "30J" },
  { label: "Panier moyen", value: "44 100", unit: "FCFA", trend: 5.5, trendType: "up", period: "30J" },
  { label: "Taux conversion", value: "2.84", unit: "%", trend: -0.4, trendType: "down", period: "30J" },
];

export const topProducts = [
  { rank: 1, name: "Robe wax Aïda", sales: 47, price: 28500, total: 1339500, gradient: "linear-gradient(135deg, #C9A876, #8B6F47)", barWidth: 100 },
  { rank: 2, name: "Sac à main cuir tressé", sales: 19, price: 45000, total: 855000, gradient: "linear-gradient(135deg, #2D5A3D, #4A7A5C)", barWidth: 64 },
  { rank: 3, name: "Robe soirée nuit", sales: 8, price: 52000, total: 416000, gradient: "linear-gradient(135deg, #4B0082, #6A0DAD)", barWidth: 31 },
  { rank: 4, name: "Boucles d'oreilles dorées", sales: 28, price: 12000, total: 336000, gradient: "linear-gradient(135deg, #D4AF37, #B8860B)", barWidth: 25 },
  { rank: 5, name: "Bracelet artisanal cuir", sales: 63, price: 8500, total: 535500, gradient: "linear-gradient(135deg, #8B4513, #A0522D)", barWidth: 40 },
];

export const topCustomers = [
  { rank: 1, name: "Fatou Diop", city: "Dakar", orders: 8, total: 312000, gradient: "linear-gradient(135deg, #E84B1F, #ff7849)", initial: "F" },
  { rank: 2, name: "Awa Konaté", city: "Abidjan", orders: 6, total: 187500, gradient: "linear-gradient(135deg, #6B5B47, #8B6F47)", initial: "A" },
  { rank: 3, name: "Marie-Claire N.", city: "Yaoundé", orders: 5, total: 142000, gradient: "linear-gradient(135deg, #4B0082, #6A0DAD)", initial: "M" },
  { rank: 4, name: "Ibrahim N.", city: "Dakar", orders: 4, total: 128000, gradient: "linear-gradient(135deg, #2D5A3D, #4A7A5C)", initial: "I" },
  { rank: 5, name: "Sokhna B.", city: "Dakar", orders: 3, total: 95500, gradient: "linear-gradient(135deg, #D4AF37, #B8860B)", initial: "S" },
];

export const paymentMethods = [
  { name: "MTN MoMo", color: "#FFCB05", percentage: 38 },
  { name: "Orange Money", color: "#FF7900", percentage: 28 },
  { name: "Wave", color: "#1DC8FF", percentage: 18 },
  { name: "Cartes bancaires", color: "#E84B1F", percentage: 16 },
];

export const topCities = [
  { city: "Dakar, Sénégal", amount: "3.1M FCFA", percent: 37.6, barWidth: 100, flag: "linear-gradient(180deg,#00853F 33%,#FDEF42 33% 66%,#E31B23 66%)" },
  { city: "Abidjan, Côte d'Ivoire", amount: "2.2M FCFA", percent: 26.7, barWidth: 72, flag: "linear-gradient(90deg,#FF8200 33%,white 33% 66%,#009A44 66%)" },
  { city: "Yaoundé, Cameroun", amount: "1.5M FCFA", percent: 18.2, barWidth: 48, flag: "linear-gradient(90deg,#007A5E 33%,#CE1126 33% 66%,#FCD116 66%)" },
  { city: "Kinshasa, RDC", amount: "760K FCFA", percent: 9.2, barWidth: 24, flag: "linear-gradient(90deg,#0093DD 33%,#FDD116 33% 66%,#CE1126 66%)" },
  { city: "Bamako, Mali", amount: "432K FCFA", percent: 5.2, barWidth: 14, flag: "linear-gradient(90deg,#009E60 33%,#FCD116 33% 66%,#CE1126 66%)" },
];

export const additionalStats = [
  { label: "Visiteurs uniques", value: "6 587", change: "+34% vs 4 916" },
  { label: "Taux de retour client", value: "42", unit: "%", change: "+8% vs 34%" },
  { label: "Temps moyen sur site", value: "3:42", change: "+18s vs 3:24" },
  { label: "Taux d'abandon panier", value: "68", unit: "%", change: "+2% (à surveiller)", warning: true },
];
