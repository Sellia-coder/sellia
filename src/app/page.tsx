"use client";

import { useEffect, useState } from "react";

const RESULT_TEMPLATES: Record<string, string[]> = {
  bijoux: [
    "Boutique avec 8 modèles de bijoux",
    "Photos optimisées et descriptions",
    "Wave + Orange Money configurés",
    "Livraison Dakar 2 000 FCFA",
  ],
  cosmetiques: [
    "Catalogue 15 produits cosmétiques",
    "Page À propos + valeurs bio",
    "MTN MoMo + Visa configurés",
    "Livraison Douala / Yaoundé",
  ],
  formation: [
    "Page de vente formation premium",
    "Espace membre avec accès vidéo",
    "Téléchargement auto après paiement",
    "Visa + Mobile Money intégrés",
  ],
  vetements: [
    "Catalogue 12 modèles avec tailles",
    "Variantes couleur et taille",
    "Wave + Orange Money configurés",
    "Livraison Abidjan + intérieur",
  ],
  default: [
    "Page d'accueil avec hero",
    "12 produits avec descriptions",
    "Checkout Mobile Money + Visa",
    "Lien partageable WhatsApp",
  ],
};

function detectTemplate(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("bijou")) return "bijoux";
  if (p.includes("cosmétique") || p.includes("beauté")) return "cosmetiques";
  if (p.includes("formation") || p.includes("cours") || p.includes("coaching")) return "formation";
  if (p.includes("vêtement") || p.includes("vetement") || p.includes("mode")) return "vetements";
  return "default";
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Nav scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Demo IA simulation
  function runDemo(overridePrompt?: string) {
    const p = (overridePrompt ?? prompt).trim();
    if (!p) return;
    setResult([]);
    setLoading(true);
    setTimeout(() => {
      const template = detectTemplate(p);
      setResult(RESULT_TEMPLATES[template]);
      setLoading(false);
    }, 2000);
  }

  return (
    <>
{/* NAV */}
<nav className={scrolled ? "scrolled" : ""}>
  <div className="nav-inner">
    <a href="/" className="nav-logo" aria-label="Sellia">
      <svg width="148" height="40" viewBox="0 0 220 60" fill="none">
        <path d="M 8 8 L 38 8 L 54 24 L 54 54 L 8 54 Z" fill="#0E1116"/>
        <circle cx="16" cy="16" r="2.4" fill="#FAFAF7"/>
        <path d="M 38 30 L 24 30 L 24 36 L 38 36 L 38 44 L 24 44" stroke="#E84B1F" strokeWidth="2.6" fill="none" strokeLinecap="square"/>
        <text x="68" y="44" fontFamily="Inter, system-ui, sans-serif" fontSize="32" fontWeight="600" fill="#0E1116" letterSpacing="-1.2">sellia</text>
      </svg>
    </a>
    <div className="nav-links">
      <a href="#comment">Comment ça marche</a>
      <a href="#pour-qui">Pour qui</a>
      <a href="#tarifs">Tarifs</a>
      <a href="#faq">FAQ</a>
      <a href="/login" className="nav-login">Connexion</a>
      <a href="#cta-final" className="nav-cta">Créer ma boutique</a>
    </div>
    <button className="nav-mobile-toggle" aria-label="Menu">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>
  </div>
</nav>

{/* HERO */}
<section className="hero">
  <div className="container">
    <div className="hero-content">
      <div className="hero-badge">
        <span className="pulse"></span>
        <span>Maintenant en bêta · Inscription ouverte</span>
      </div>
      <h1>Décrivez ce que vous vendez.<br /><em>On construit votre boutique.</em></h1>
      <p className="hero-sub">Sellia transforme une simple description en boutique en ligne complète, avec <strong>Mobile Money, cartes bancaires et livraison locale</strong> — partout où vous vendez, en moins d&apos;une minute.</p>

      {/* DEMO IA */}
      <div className="demo">
        <div className="demo-header">
          <div className="demo-dots">
            <span></span><span></span><span></span>
          </div>
          <div className="demo-label">
            <span className="pulse" style={{ background: "#E84B1F" }}></span>
            <span>Sellia AI · Démo en direct</span>
          </div>
        </div>
        <div className="demo-body">
          <div className="demo-prompt-wrap">
            {/* Header du prompt avec icône et label */}
            <div className="demo-prompt-header">
              <div className="demo-prompt-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
              </div>
              <span className="demo-prompt-label">Décrivez votre activité — Sellia génère votre boutique</span>
              <span className="demo-prompt-counter">{prompt.length} / 500</span>
            </div>

            {/* Zone de saisie principale */}
            <textarea
              className="demo-prompt-textarea"
              placeholder="Exemple : Je vends des bijoux faits main pour femmes à Dakar. Ma cible : jeunes femmes 25-40 ans urbaines qui aiment le style afro-moderne. Je veux accepter Wave, Orange Money et cartes bancaires. Livraison Dakar et environs sous 48h."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
              rows={5}
              maxLength={500}
            />

            {/* Footer avec hints et CTA */}
            <div className="demo-prompt-footer">
              <div className="demo-prompt-quality">
                <div className={`quality-bar ${prompt.length >= 50 ? "active" : ""}`} />
                <div className={`quality-bar ${prompt.length >= 150 ? "active" : ""}`} />
                <div className={`quality-bar ${prompt.length >= 250 ? "active" : ""}`} />
                <span className="quality-label">
                  {prompt.length === 0 && "Commencez à écrire"}
                  {prompt.length > 0 && prompt.length < 50 && "Ajoutez plus de détails"}
                  {prompt.length >= 50 && prompt.length < 150 && "Bien — précisez votre cible"}
                  {prompt.length >= 150 && prompt.length < 250 && "Très bien — mentionnez les paiements"}
                  {prompt.length >= 250 && "Parfait — prêt à générer"}
                </span>
              </div>
              <button
                className="demo-prompt-btn"
                type="button"
                onClick={() => runDemo()}
                disabled={loading || prompt.trim().length === 0}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                <span>Générer ma boutique</span>
              </button>
            </div>
          </div>

          <div className="demo-suggestions">
            <span className="demo-suggestions-label">Inspirations rapides :</span>
            <button className="demo-suggestion" type="button" onClick={() => { const p = "Je vends des bijoux faits main au Sénégal, livraison Dakar, paiement Mobile Money. Style afro-moderne pour femmes 25-40 ans."; setPrompt(p); runDemo(p); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>
              Bijoux faits main
            </button>
            <button className="demo-suggestion" type="button" onClick={() => { const p = "Je vends des cosmétiques bio naturels au Cameroun. Paiement carte et MoMo, livraison Douala et Yaoundé. Cible jeunes femmes soucieuses de la nature."; setPrompt(p); runDemo(p); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3v12a6 6 0 0 0 12 0V3"/><path d="M9 7h6"/><path d="M12 13v8"/><path d="M9 21h6"/></svg>
              Cosmétiques bio
            </button>
            <button className="demo-suggestion" type="button" onClick={() => { const p = "Je vends une formation en ligne pour entrepreneurs africains qui veulent lancer leur business. Vidéos + accompagnement WhatsApp. Paiement carte et Mobile Money."; setPrompt(p); runDemo(p); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              Formation en ligne
            </button>
            <button className="demo-suggestion" type="button" onClick={() => { const p = "Je vends des vêtements féminins tendance en Côte d'Ivoire. Robes, ensembles, accessoires. Paiement Wave et Orange Money. Livraison Abidjan et villes secondaires."; setPrompt(p); runDemo(p); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>
              Mode féminine
            </button>
          </div>

          <div className={`demo-loading ${loading ? "visible" : ""}`}>
            <div className="spinner"></div>
            <span>Sellia construit votre boutique...</span>
          </div>

          <div className={`demo-result ${result.length > 0 ? "visible" : ""}`}>
            <div className="demo-result-header">
              <div className="check">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span>Votre boutique est prête en 47 secondes</span>
            </div>
            <div className="demo-result-list">
              {result.map((item, i) => (
                <div key={i} className="demo-result-item">{item}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* HERO STATS */}
      <div className="hero-stats">
        <div className="hero-stat">
          <div className="hero-stat-num"><em>60s</em></div>
          <div className="hero-stat-lbl">création boutique</div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-num"><em>0€</em></div>
          <div className="hero-stat-lbl">pour démarrer</div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-num"><em>15+</em></div>
          <div className="hero-stat-lbl">moyens de paiement</div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-num"><em>0</em></div>
          <div className="hero-stat-lbl">code requis</div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* PARTNERS / MOYENS DE PAIEMENT */}
<section className="partners">
  <div className="container">
    <div className="partners-label">Compatible avec tous les moyens de paiement de vos clients</div>
    <div className="partners-grid">
      {/* MTN MoMo */}
      <div className="partner">
        <svg width="44" height="32" viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg">
          <rect width="90" height="60" rx="30" fill="#FFCB05"/>
          <text x="45" y="38" textAnchor="middle" fontSize="22" fontWeight="900" fill="#0033A0" fontFamily="Arial Black, sans-serif" letterSpacing="-0.5">MTN</text>
        </svg>
        <span>MTN MoMo</span>
      </div>

      {/* Orange Money */}
      <div className="partner">
        <svg width="44" height="32" viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg">
          <rect width="90" height="60" rx="6" fill="#FF7900"/>
          <text x="45" y="38" textAnchor="middle" fontSize="20" fontWeight="900" fill="white" fontFamily="Arial Black, sans-serif" letterSpacing="-0.3">orange</text>
        </svg>
        <span>Orange Money</span>
      </div>

      {/* Wave */}
      <div className="partner">
        <svg width="44" height="32" viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg">
          <rect width="90" height="60" rx="30" fill="#1DC8FF"/>
          <path d="M 18 38 Q 27 22, 36 38 T 54 38 T 72 38" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round"/>
        </svg>
        <span>Wave</span>
      </div>

      {/* Moov Money */}
      <div className="partner">
        <svg width="44" height="32" viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg">
          <rect width="90" height="60" rx="6" fill="#0066CC"/>
          <text x="45" y="38" textAnchor="middle" fontSize="18" fontWeight="900" fill="white" fontFamily="Arial Black, sans-serif">moov</text>
        </svg>
        <span>Moov Money</span>
      </div>

      {/* Free Money */}
      <div className="partner">
        <svg width="44" height="32" viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg">
          <rect width="90" height="60" rx="6" fill="#0E1116"/>
          <text x="45" y="38" textAnchor="middle" fontSize="18" fontWeight="900" fill="#E84B1F" fontFamily="Arial Black, sans-serif">FREE</text>
        </svg>
        <span>Free Money</span>
      </div>

      {/* Visa */}
      <div className="partner">
        <svg width="56" height="32" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="60" rx="6" fill="white" stroke="#E5E5E5" strokeWidth="1"/>
          <text x="50" y="42" textAnchor="middle" fontSize="22" fontWeight="900" fill="#1A1F71" fontFamily="Arial, sans-serif" fontStyle="italic" letterSpacing="-0.5">VISA</text>
        </svg>
        <span>Visa</span>
      </div>

      {/* Mastercard */}
      <div className="partner">
        <svg width="56" height="32" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="60" rx="6" fill="white" stroke="#E5E5E5" strokeWidth="1"/>
          <circle cx="40" cy="30" r="14" fill="#EB001B"/>
          <circle cx="60" cy="30" r="14" fill="#F79E1B"/>
          <path d="M 50 19 A 14 14 0 0 1 50 41 A 14 14 0 0 1 50 19 Z" fill="#FF5F00"/>
        </svg>
        <span>Mastercard</span>
      </div>
    </div>
  </div>
</section>

{/* PROBLÈME */}
<section className="block">
  <div className="container-narrow">
    <div className="section-tag">Le problème</div>
    <h2 className="section-title">Vendre en ligne aujourd&apos;hui<br />est <em>encore trop compliqué</em>.</h2>
    <p className="section-intro">Vous vendez déjà sur Instagram, WhatsApp, ou TikTok. Mais sans boutique structurée, sans paiement automatisé, sans données. Vous perdez du temps, vous perdez des ventes, et vous plafonnez. Sellia change ça.</p>

    <div className="problem-grid">
      <div className="problem-card">
        <div className="problem-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <h4>4 à 6 heures par jour</h4>
        <p>Passées à répondre manuellement aux messages, confirmer les commandes, calculer les frais. <strong>Du temps qui ne sert pas à grandir.</strong></p>
      </div>
      <div className="problem-card">
        <div className="problem-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="9.01" y2="10"/><line x1="15" y1="10" x2="15.01" y2="10"/></svg>
        </div>
        <h4>30 à 50% de ventes perdues</h4>
        <p>Entre le premier message et la conversion, faute de réponse rapide ou de processus clair. <strong>L&apos;argent qui part chez le concurrent.</strong></p>
      </div>
      <div className="problem-card">
        <div className="problem-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h4>Aucune confiance acheteur</h4>
        <p>Sans page produit professionnelle ni politique claire, les clients exigent le paiement à la livraison. <strong>Annulations massives.</strong></p>
      </div>
      <div className="problem-card">
        <div className="problem-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        </div>
        <h4>Zéro donnée pour grandir</h4>
        <p>Sans analytics, impossible de savoir ce qui fonctionne. <strong>Vous restez artisanal et plafonnez à un certain volume.</strong></p>
      </div>
    </div>
  </div>
</section>

{/* COMMENT ÇA MARCHE */}
<section className="block" id="comment">
  <div className="container-narrow">
    <div className="section-tag">Comment ça marche</div>
    <h2 className="section-title">Trois étapes.<br /><em>Aucune n&apos;est compliquée.</em></h2>
    <p className="section-intro">Sellia fait disparaître toute la complexité technique. Vous écrivez, on construit. Vous vendez, on encaisse.</p>

    <div className="steps">
      <div className="step">
        <div className="step-num">ÉTAPE 01</div>
        <h4>Vous décrivez</h4>
        <p>En une ou deux phrases en français : ce que vous vendez, où vous livrez, comment vous voulez encaisser.</p>
        <div className="step-illus">"Je vends des chaussures pour femmes au Cameroun, livraison Douala, paiement Mobile Money."</div>
      </div>
      <div className="step">
        <div className="step-num">ÉTAPE 02</div>
        <h4>Sellia construit</h4>
        <p>L&apos;intelligence Sellia génère votre boutique : pages, catalogue, descriptions, paiements, livraison. Tout automatique.</p>
        <div className="step-illus">→ Boutique générée en 47 secondes<br />→ 12 pages, paiement configuré<br />→ Lien prêt à partager</div>
      </div>
      <div className="step">
        <div className="step-num">ÉTAPE 03</div>
        <h4>Vous encaissez</h4>
        <p>Partagez votre lien sur WhatsApp, Instagram, TikTok. Recevez les commandes et les paiements automatiquement.</p>
        <div className="step-illus">💰 Paiement reçu : 18 500 FCFA<br />📱 Notification WhatsApp envoyée<br />📦 Bordereau livraison généré</div>
      </div>
    </div>
  </div>
</section>

{/* POUR QUI */}
<section className="block" id="pour-qui">
  <div className="container-narrow">
    <div className="section-tag">Pour qui</div>
    <h2 className="section-title">Conçu pour <em>tous les entrepreneurs</em><br />qui veulent vendre en ligne.</h2>
    <p className="section-intro">Trois profils. Une seule plateforme. Que vous soyez vendeur sur les réseaux sociaux, créateur de contenu, ou commerçant établi — Sellia s&apos;adapte à votre activité, où que vous soyez.</p>

    <div className="personas">
      <div className="persona">
        <div className="persona-header">
          <div className="persona-avatar">F</div>
          <div>
            <div className="persona-name">Fatou</div>
            <div className="persona-role">Yaoundé · Vendeuse Instagram</div>
          </div>
        </div>
        <div className="persona-quote">"J&apos;ai 12 000 abonnés et je passe ma journée dans les DM. Avec Sellia, j&apos;ai enfin une vraie boutique."</div>
        <div className="persona-meta">
          <div className="persona-meta-cell">
            <strong>Vend</strong>
            <span>Vêtements, accessoires</span>
          </div>
          <div className="persona-meta-cell">
            <strong>Volume</strong>
            <span>30-80 ventes/mois</span>
          </div>
        </div>
      </div>

      <div className="persona">
        <div className="persona-header">
          <div className="persona-avatar">A</div>
          <div>
            <div className="persona-name">Aïcha</div>
            <div className="persona-role">Abidjan · Coach digitale</div>
          </div>
        </div>
        <div className="persona-quote">"Je vends mes formations. Avec Sellia, livraison auto du PDF dès paiement reçu. Plus jamais à envoyer manuellement."</div>
        <div className="persona-meta">
          <div className="persona-meta-cell">
            <strong>Vend</strong>
            <span>Formations, ebooks</span>
          </div>
          <div className="persona-meta-cell">
            <strong>Panier</strong>
            <span>25K-150K FCFA</span>
          </div>
        </div>
      </div>

      <div className="persona">
        <div className="persona-header">
          <div className="persona-avatar">K</div>
          <div>
            <div className="persona-name">Kouassi</div>
            <div className="persona-role">Dakar · Commerçant</div>
          </div>
        </div>
        <div className="persona-quote">"Mon magasin physique marche. Avec Sellia, je touche enfin la clientèle en ligne, sans payer un dev 3 millions."</div>
        <div className="persona-meta">
          <div className="persona-meta-cell">
            <strong>Vend</strong>
            <span>Cosmétiques, soins</span>
          </div>
          <div className="persona-meta-cell">
            <strong>Catalogue</strong>
            <span>200+ produits</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* FEATURES */}
<section className="block">
  <div className="container-narrow">
    <div className="section-tag">Tout ce dont vous avez besoin</div>
    <h2 className="section-title">Une plateforme.<br /><em>Tous les outils.</em></h2>
    <p className="section-intro">Sellia n&apos;est pas qu&apos;un constructeur de boutique. C&apos;est un commerce complet, prêt à vendre, dès le premier jour.</p>

    <div className="features">
      <div className="feature">
        <div className="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <div className="feature-text">
          <h4>Génération IA en 60 secondes</h4>
          <p>Boutique complète avec pages, produits, descriptions et paiements depuis un simple prompt.</p>
        </div>
      </div>
      <div className="feature">
        <div className="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
        </div>
        <div className="feature-text">
          <h4>Mobile Money + cartes natifs</h4>
          <p>MTN, Orange, Wave, Moov, Free, Visa, Mastercard. Tout configuré automatiquement.</p>
        </div>
      </div>
      <div className="feature">
        <div className="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        </div>
        <div className="feature-text">
          <h4>Produits physiques & digitaux</h4>
          <p>Vêtements, électronique, formations, ebooks, abonnements. Sellia gère tout.</p>
        </div>
      </div>
      <div className="feature">
        <div className="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        </div>
        <div className="feature-text">
          <h4>Notifications WhatsApp</h4>
          <p>Vous et vos clients êtes notifiés à chaque étape. Plus jamais une commande oubliée.</p>
        </div>
      </div>
      <div className="feature">
        <div className="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        </div>
        <div className="feature-text">
          <h4>Analytics qui parlent</h4>
          <p>Tableau de bord clair : ventes, panier moyen, produits qui marchent. En français.</p>
        </div>
      </div>
      <div className="feature">
        <div className="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
        </div>
        <div className="feature-text">
          <h4>Assistant client IA 24/7</h4>
          <p>Sellia répond aux questions de vos clients sur disponibilité, livraison, tailles. En continu.</p>
        </div>
      </div>
      <div className="feature">
        <div className="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        </div>
        <div className="feature-text">
          <h4>Logistique intégrée</h4>
          <p>Yango, livreurs locaux, click & collect. Bordereaux générés automatiquement.</p>
        </div>
      </div>
      <div className="feature">
        <div className="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <div className="feature-text">
          <h4>Modifications en langage naturel</h4>
          <p>"Change la couleur en vert", "ajoute une promo de 20%". L&apos;IA exécute, vous gardez le contrôle.</p>
        </div>
      </div>
    </div>
  </div>
</section>

{/* TARIFS */}
<section className="block" id="tarifs">
  <div className="container">
    <div className="container-narrow" style={{ padding: 0 }}>
      <div className="section-tag">Tarifs</div>
      <h2 className="section-title">Commencez <em>gratuitement.</em><br />Grandissez à votre rythme.</h2>
      <p className="section-intro">Quatre plans pour quatre étapes de votre commerce. Pas d&apos;engagement, changement à tout moment.</p>
    </div>

    <div className="pricing">
      <div className="plan">
        <div className="plan-name">Free</div>
        <div className="plan-tagline">Pour tester sans risque</div>
        <div className="plan-amount">0<span className="currency">FCFA</span></div>
        <div className="plan-period">Toujours gratuit</div>
        <ul className="plan-features">
          <li>1 boutique générée par IA</li>
          <li>Jusqu&apos;à 10 produits</li>
          <li>Sous-domaine getsellia.com</li>
          <li>Mobile Money + cartes</li>
          <li>Commission 4% par vente</li>
          <li>Support communautaire</li>
        </ul>
        <a href="#cta-final" className="plan-cta">Commencer gratuitement</a>
      </div>

      <div className="plan">
        <div className="plan-name">Starter</div>
        <div className="plan-tagline">Pour vendeurs qui décollent</div>
        <div className="plan-amount">9 900<span className="currency">FCFA</span></div>
        <div className="plan-period">par mois</div>
        <ul className="plan-features">
          <li>Jusqu&apos;à 100 produits</li>
          <li>Domaine personnalisé</li>
          <li>Templates IA avancés</li>
          <li>Commission 2,5%</li>
          <li>Email + WhatsApp client</li>
          <li>Statistiques de base</li>
        </ul>
        <a href="#cta-final" className="plan-cta">Choisir Starter</a>
      </div>

      <div className="plan featured">
        <div className="plan-name">Pro</div>
        <div className="plan-tagline">Pour commerces actifs et créateurs</div>
        <div className="plan-amount">29 900<span className="currency">FCFA</span></div>
        <div className="plan-period">par mois</div>
        <ul className="plan-features">
          <li>2 boutiques · produits illimités</li>
          <li>Produits digitaux · livraison auto</li>
          <li>Espace membre & abonnements</li>
          <li>Commission 1,5%</li>
          <li>Assistant IA client 24/7</li>
          <li>Génération marketing illimitée</li>
          <li>Support prioritaire</li>
        </ul>
        <a href="#cta-final" className="plan-cta">Choisir Pro</a>
      </div>

      <div className="plan">
        <div className="plan-name">Business</div>
        <div className="plan-tagline">Pour commerces établis et PME</div>
        <div className="plan-amount">39 900<span className="currency">FCFA</span></div>
        <div className="plan-period">par mois</div>
        <ul className="plan-features">
          <li>5 boutiques · multi-utilisateurs</li>
          <li>Multi-entrepôts & stock avancé</li>
          <li>API & intégrations sur mesure</li>
          <li>Commission 0,9%</li>
          <li>Onboarding dédié</li>
          <li>Account manager</li>
          <li>Reporting comptable</li>
        </ul>
        <a href="#cta-final" className="plan-cta">Choisir Business</a>
      </div>
    </div>
  </div>
</section>

{/* TESTIMONIALS (placeholder Pioneers) */}
<section className="block">
  <div className="container-narrow">
    <div className="section-tag">Pioneers</div>
    <h2 className="section-title">Ils ont rejoint Sellia<br /><em>parmi les premiers.</em></h2>
    <p className="section-intro">Les premiers entrepreneurs qui testent Sellia en avant-première. Voici ce qu&apos;ils en disent.</p>

    <div className="testimonials">
      <div className="testimonial">
        <p className="testimonial-quote">J&apos;ai créé ma boutique en parlant à mon téléphone. Première vente trois jours après. C&apos;est bluffant.</p>
        <div className="testimonial-author">
          <div className="testimonial-avatar testimonial-avatar-1">
            M
            <span className="testimonial-avatar-verify">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
          </div>
          <div className="testimonial-info">
            <strong>Marie-Claire N.</strong>
            <small>Yaoundé · Mode féminine</small>
          </div>
        </div>
      </div>
      <div className="testimonial">
        <p className="testimonial-quote">Je passais 5 heures par jour sur WhatsApp. Sellia me les a rendues. Mes ventes ont doublé en deux mois.</p>
        <div className="testimonial-author">
          <div className="testimonial-avatar testimonial-avatar-2">
            I
            <span className="testimonial-avatar-verify">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
          </div>
          <div className="testimonial-info">
            <strong>Ibrahim D.</strong>
            <small>Abidjan · Cosmétiques</small>
          </div>
        </div>
      </div>
      <div className="testimonial">
        <p className="testimonial-quote">Enfin une plateforme qui parle français et qui comprend Mobile Money. Mes clients sont rassurés, je suis tranquille.</p>
        <div className="testimonial-author">
          <div className="testimonial-avatar testimonial-avatar-3">
            A
            <span className="testimonial-avatar-verify">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
          </div>
          <div className="testimonial-info">
            <strong>Awa K.</strong>
            <small>Dakar · Coach business</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* FAQ */}
<section className="block" id="faq">
  <div className="container-narrow">
    <div className="section-tag">Questions fréquentes</div>
    <h2 className="section-title">Tout ce que vous voulez savoir<br /><em>avant de commencer.</em></h2>

    <div className="faq">
      <div className={`faq-item ${openFaq === 0 ? "open" : ""}`}>
        <div className="faq-question" onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}>
          <span>Combien coûte vraiment Sellia ?</span>
          <div className="faq-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
        </div>
        <div className="faq-answer">
          <div className="faq-answer-inner">Le plan Free est entièrement gratuit, sans carte bancaire requise. Vous payez uniquement une commission de 4% sur vos ventes. Les plans payants commencent à 9 900 FCFA/mois et réduisent la commission. Vous pouvez changer de plan ou résilier à tout moment.</div>
        </div>
      </div>
      <div className={`faq-item ${openFaq === 1 ? "open" : ""}`}>
        <div className="faq-question" onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}>
          <span>Combien de temps pour créer ma boutique ?</span>
          <div className="faq-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
        </div>
        <div className="faq-answer">
          <div className="faq-answer-inner">Moins d&apos;une minute en moyenne. Vous décrivez votre activité, et Sellia génère pages, produits, descriptions, paiements et livraison automatiquement. Vous pouvez ensuite affiner par conversation avec l&apos;IA.</div>
        </div>
      </div>
      <div className={`faq-item ${openFaq === 2 ? "open" : ""}`}>
        <div className="faq-question" onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}>
          <span>Quels moyens de paiement sont supportés ?</span>
          <div className="faq-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
        </div>
        <div className="faq-answer">
          <div className="faq-answer-inner">Tous les Mobile Money africains majeurs : MTN MoMo, Orange Money, Wave, Moov Money, Free Money. Plus les cartes Visa et Mastercard pour les clients internationaux. Les virements bancaires et le paiement à la livraison sont aussi supportés.</div>
        </div>
      </div>
      <div className={`faq-item ${openFaq === 3 ? "open" : ""}`}>
        <div className="faq-question" onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}>
          <span>Puis-je vendre des produits digitaux ?</span>
          <div className="faq-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
        </div>
        <div className="faq-answer">
          <div className="faq-answer-inner">Oui. Formations, ebooks, logiciels, abonnements, coaching — tout est supporté avec livraison automatique par lien sécurisé après paiement. Disponible en plan Pro et Business.</div>
        </div>
      </div>
      <div className={`faq-item ${openFaq === 4 ? "open" : ""}`}>
        <div className="faq-question" onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}>
          <span>Mes données sont-elles sécurisées ?</span>
          <div className="faq-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
        </div>
        <div className="faq-answer">
          <div className="faq-answer-inner">Oui. Sellia ne stocke jamais vos numéros de carte ou identifiants Mobile Money — ces données passent directement par nos partenaires certifiés (Stripe, Afribapay, CinetPay). Vos données personnelles sont chiffrées, sauvegardées quotidiennement, et exportables sur simple demande conformément aux lois locales sur la protection des données.</div>
        </div>
      </div>
      <div className={`faq-item ${openFaq === 5 ? "open" : ""}`}>
        <div className="faq-question" onClick={() => setOpenFaq(openFaq === 5 ? null : 5)}>
          <span>Puis-je utiliser mon propre nom de domaine ?</span>
          <div className="faq-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
        </div>
        <div className="faq-answer">
          <div className="faq-answer-inner">Oui, à partir du plan Starter. En Free, votre boutique est sur boutique-monnom.getsellia.com. En plan payant, vous pouvez la lier à votre propre domaine (ma-boutique.com) en quelques clics.</div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* CTA FINAL */}
<section className="cta-final" id="cta-final">
  <div className="container">
    <div className="cta-final-content">
      <h2>Décrivez ce que vous vendez.<br /><em>Commencez à gagner aujourd&apos;hui.</em></h2>
      <p>Créez votre boutique en moins d&apos;une minute. Aucune carte bancaire requise. Vous gardez 100% de vos ventes en plan Free.</p>
      <div className="cta-final-buttons">
        <a href="#hero" className="btn-primary">
          <span>Créer ma boutique</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
        <a href="#tarifs" className="btn-secondary">Voir les tarifs</a>
      </div>
    </div>
  </div>
</section>

{/* FOOTER */}
<footer>
  <div className="container">
    <div className="footer-grid">
      <div className="footer-brand">
        {/* Logo Sellia version blanche pour fond Ink */}
        <a href="/" className="footer-logo" aria-label="Sellia">
          <svg width="148" height="40" viewBox="0 0 220 60" fill="none">
            <path d="M 8 8 L 38 8 L 54 24 L 54 54 L 8 54 Z" fill="#FAFAF7"/>
            <circle cx="16" cy="16" r="2.4" fill="#0E1116"/>
            <path d="M 38 30 L 24 30 L 24 36 L 38 36 L 38 44 L 24 44" stroke="#E84B1F" strokeWidth="2.6" fill="none" strokeLinecap="square"/>
            <text x="68" y="44" fontFamily="Inter, system-ui, sans-serif" fontSize="32" fontWeight="600" fill="#FAFAF7" letterSpacing="-1.2">sellia</text>
          </svg>
        </a>
        <p>Le système d&apos;exploitation du commerce digital. Conçu pour les entrepreneurs du monde entier qui veulent vendre sans complexité technique.</p>
      </div>
      <div className="footer-col">
        <h5>Produit</h5>
        <ul>
          <li><a href="#comment">Comment ça marche</a></li>
          <li><a href="#pour-qui">Pour qui</a></li>
          <li><a href="#tarifs">Tarifs</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
      </div>
      <div className="footer-col">
        <h5>Entreprise</h5>
        <ul>
          <li><a href="#">À propos</a></li>
          <li><a href="#">Carrières</a></li>
          <li><a href="#">Presse</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </div>
      <div className="footer-col">
        <h5>Légal</h5>
        <ul>
          <li><a href="/conditions">Conditions d&apos;utilisation</a></li>
          <li><a href="/confidentialite">Politique de confidentialité</a></li>
          <li><a href="/mentions-legales">Mentions légales</a></li>
          <li><a href="/cookies">Politique de cookies</a></li>
        </ul>
      </div>
    </div>

    {/* Section sécurité & confiance */}
    <div className="footer-security">
      <div className="footer-security-label">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
        <span>Sécurité & Infrastructure</span>
      </div>
      <div className="footer-security-badges">
        {/* Cloudflare */}
        <div className="security-badge">
          <div className="security-badge-icon">
            <svg width="22" height="14" viewBox="0 0 200 70" xmlns="http://www.w3.org/2000/svg">
              <path d="M125 35c0-1.5-.2-3-.5-4.4a13.7 13.7 0 0 0-26.4-1.5 13.5 13.5 0 0 0-23.6 0 13.7 13.7 0 0 0-26.4 1.5c-.3 1.4-.5 2.9-.5 4.4 0 11.5 9.3 20.7 20.7 20.7h35.5c11.5 0 20.7-9.3 20.7-20.7z" fill="#F38020"/>
              <path d="M150 35c0-1.5-.2-3-.5-4.4a13.7 13.7 0 0 0-12.7-9.6c-.6 0-1.2.1-1.8.2a13.5 13.5 0 0 0-2.5.7 20 20 0 0 1 1.5 7.6c0 11.5-9.3 20.7-20.7 20.7h35.5a8.3 8.3 0 0 0 1.2-.1 13.7 13.7 0 0 0 0-15.1z" fill="#FAAD3F"/>
            </svg>
          </div>
          <div className="security-badge-text">
            <span className="security-badge-name">Cloudflare</span>
            <span className="security-badge-detail">CDN & Protection DDoS</span>
          </div>
        </div>

        {/* SSL / TLS */}
        <div className="security-badge">
          <div className="security-badge-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.2"><rect x="4" y="11" width="16" height="10" rx="2" fill="rgba(16,185,129,0.08)"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1.5" fill="#10B981"/></svg>
          </div>
          <div className="security-badge-text">
            <span className="security-badge-name">SSL/TLS 1.3</span>
            <span className="security-badge-detail">Chiffrement HTTPS</span>
          </div>
        </div>

        {/* Données chiffrées */}
        <div className="security-badge">
          <div className="security-badge-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#E84B1F" strokeWidth="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(232,75,31,0.08)"/><path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="security-badge-text">
            <span className="security-badge-name">Chiffrement AES-256</span>
            <span className="security-badge-detail">Données protégées</span>
          </div>
        </div>
      </div>
    </div>

    <div className="footer-bottom">
      <span>© 2026 Sellia · Tous droits réservés</span>
      <span>Décrivez. C&apos;est prêt.</span>
    </div>
  </div>
</footer>
    </>
  );
}
