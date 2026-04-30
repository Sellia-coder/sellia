import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de Cookies",
  description: "Politique de cookies du service Sellia, opéré par Rollo Technologies Inc.",
  robots: { index: false, follow: false },
};

export default function Cookies() {
  return (
    <>
      <nav className="legal-nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo" aria-label="Sellia">
            <svg width="148" height="40" viewBox="0 0 220 60" fill="none">
              <path d="M 8 8 L 38 8 L 54 24 L 54 54 L 8 54 Z" fill="#0E1116" />
              <circle cx="16" cy="16" r="2.4" fill="#FAFAF7" />
              <path d="M 38 30 L 24 30 L 24 36 L 38 36 L 38 44 L 24 44" stroke="#E84B1F" strokeWidth="2.6" fill="none" strokeLinecap="square" />
              <text x="68" y="44" fontFamily="Inter, system-ui, sans-serif" fontSize="32" fontWeight="600" fill="#0E1116" letterSpacing="-1.2">sellia</text>
            </svg>
          </Link>
          <Link href="/" className="legal-back-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
            <span>Retour à l&apos;accueil</span>
          </Link>
        </div>
      </nav>

      <main className="legal-page">
        <div className="container-narrow">
          <div className="legal-header">
            <span className="legal-tag">Document juridique</span>
            <h1 className="legal-title">Politique de <em>cookies</em></h1>
            <div className="legal-meta-grid">
              <div className="legal-meta-item">
                <span className="legal-meta-label">Version</span>
                <span className="legal-meta-value">1.0</span>
              </div>
              <div className="legal-meta-item">
                <span className="legal-meta-label">En vigueur depuis</span>
                <span className="legal-meta-value">30 avril 2026</span>
              </div>
              <div className="legal-meta-item">
                <span className="legal-meta-label">Dernière révision</span>
                <span className="legal-meta-value">30 avril 2026</span>
              </div>
              <div className="legal-meta-item">
                <span className="legal-meta-label">Contact DPO</span>
                <span className="legal-meta-value">dpo@getsellia.com</span>
              </div>
            </div>
          </div>

          <div className="legal-toc">
            <h3>Sommaire</h3>
            <ol>
              <li><a href="#article-1">Définitions et cadre juridique</a></li>
              <li><a href="#article-2">Qu&apos;est-ce qu&apos;un cookie ?</a></li>
              <li><a href="#article-3">Pourquoi utilisons-nous des cookies ?</a></li>
              <li><a href="#article-4">Catégories de cookies utilisés</a></li>
              <li><a href="#article-5">Liste détaillée des cookies</a></li>
              <li><a href="#article-6">Cookies de tiers</a></li>
              <li><a href="#article-7">Durées de conservation</a></li>
              <li><a href="#article-8">Bases légales</a></li>
              <li><a href="#article-9">Gestion de votre consentement</a></li>
              <li><a href="#article-10">Désactivation par le navigateur</a></li>
              <li><a href="#article-11">Conséquences du refus</a></li>
              <li><a href="#article-12">Vos droits</a></li>
              <li><a href="#article-13">Modifications de la politique</a></li>
              <li><a href="#article-14">Contact</a></li>
            </ol>
          </div>

          <div className="legal-content">
            <section className="legal-preamble">
              <h2>Préambule</h2>
              <p>
                La présente Politique de Cookies (ci-après « <strong>la Politique</strong> ») a pour
                objet d&apos;informer les Utilisateurs du service Sellia, accessible à
                l&apos;adresse <strong>https://getsellia.com</strong>, sur l&apos;utilisation des cookies et autres
                technologies similaires lors de leur navigation.
              </p>
              <p>
                Cette Politique s&apos;inscrit dans le cadre de notre engagement de
                transparence et de protection de la vie privée, en complément de notre <Link href="/confidentialite" className="legal-link">Politique de Confidentialité</Link>.
              </p>
              <p>
                Elle est conforme aux exigences :
              </p>
              <ul>
                <li>Du Règlement (UE) 2016/679 (RGPD)</li>
                <li>De la Directive ePrivacy 2002/58/CE et ses transpositions nationales</li>
                <li>Des recommandations de la Commission Nationale de l&apos;Informatique et des Libertés (CNIL) française et de ses homologues européens</li>
                <li>Des législations africaines applicables sur la protection des données</li>
                <li>Du California Consumer Privacy Act (CCPA) pour les résidents californiens</li>
              </ul>
            </section>

            <section id="article-1">
              <h2>Article 1 — Définitions et cadre juridique</h2>

              <h3>1.1 Cookie</h3>
              <p>
                Un cookie est un petit fichier texte (généralement de quelques
                kilo-octets) déposé et lu sur le terminal de l&apos;Utilisateur (ordinateur,
                smartphone, tablette, console) lors de la consultation d&apos;un site web ou
                de l&apos;utilisation d&apos;une application.
              </p>

              <h3>1.2 Technologies similaires</h3>
              <p>Sont assimilées aux cookies, et également couvertes par la présente Politique :</p>
              <ul>
                <li><strong>Local storage</strong> et <strong>session storage</strong> : zones de stockage local du navigateur</li>
                <li><strong>Pixels invisibles</strong> (<em>tracking pixels</em>) : images d&apos;un pixel utilisées pour le tracking</li>
                <li><strong>Empreintes numériques</strong> (<em>fingerprinting</em>) : techniques d&apos;identification basées sur la configuration du terminal</li>
                <li><strong>Tags et balises web</strong> : scripts insérés dans les pages</li>
                <li><strong>SDK mobiles</strong> : kits de développement intégrés dans les applications</li>
                <li><strong>Identifiants publicitaires mobiles</strong> (IDFA, AAID) : identifiants persistants des terminaux mobiles</li>
              </ul>

              <h3>1.3 Acteurs concernés</h3>
              <ul>
                <li><strong>Éditeur</strong> : Rollo Technologies Inc., responsable du Service Sellia et de cette Politique</li>
                <li><strong>Tiers</strong> : prestataires techniques dont les services peuvent déposer leurs propres cookies (ex. : Cloudflare)</li>
                <li><strong>Utilisateur</strong> : toute personne consultant le Service</li>
              </ul>
            </section>

            <section id="article-2">
              <h2>Article 2 — Qu&apos;est-ce qu&apos;un cookie ?</h2>

              <h3>2.1 Fonctionnement</h3>
              <p>
                Lorsque vous visitez un site web, ce dernier peut envoyer des cookies à
                votre navigateur. Le navigateur les stocke et les renvoie au site lors
                de visites ultérieures. Cela permet au site de :
              </p>
              <ul>
                <li>Vous reconnaître entre deux visites</li>
                <li>Mémoriser vos préférences (langue, devise)</li>
                <li>Maintenir votre session active une fois connecté</li>
                <li>Mesurer son audience</li>
                <li>Personnaliser certains contenus</li>
              </ul>

              <h3>2.2 Catégorisation par origine</h3>
              <ul>
                <li><strong>Cookies internes (first-party)</strong> : déposés par le domaine que vous visitez (ici : getsellia.com)</li>
                <li><strong>Cookies tiers (third-party)</strong> : déposés par un autre domaine, généralement un service intégré (analytics, paiements, vidéos embarquées)</li>
              </ul>

              <h3>2.3 Catégorisation par durée</h3>
              <ul>
                <li><strong>Cookies de session</strong> : supprimés à la fermeture du navigateur</li>
                <li><strong>Cookies persistants</strong> : conservés sur le terminal jusqu&apos;à leur expiration ou suppression manuelle</li>
              </ul>
            </section>

            <section id="article-3">
              <h2>Article 3 — Pourquoi utilisons-nous des cookies ?</h2>
              <p>
                Sellia utilise des cookies et technologies similaires pour les
                finalités suivantes :
              </p>

              <h3>3.1 Finalités essentielles</h3>
              <ul>
                <li>Permettre l&apos;authentification et la connexion sécurisée à votre Compte</li>
                <li>Maintenir votre session active pendant la navigation</li>
                <li>Mémoriser le contenu de votre panier (pour les Acheteurs)</li>
                <li>Sécuriser le Service contre les attaques (CSRF, bot detection)</li>
                <li>Mémoriser votre choix concernant les cookies (consentement)</li>
                <li>Assurer le bon fonctionnement technique du Service</li>
              </ul>

              <h3>3.2 Finalités de mesure et d&apos;amélioration</h3>
              <ul>
                <li>Mesurer la fréquentation du Service (visites, pages vues, durée)</li>
                <li>Analyser les parcours de navigation pour identifier les difficultés</li>
                <li>Tester de nouvelles fonctionnalités sur des panels d&apos;Utilisateurs</li>
                <li>Détecter et corriger les bugs techniques</li>
              </ul>

              <h3>3.3 Finalités de personnalisation</h3>
              <ul>
                <li>Mémoriser vos préférences (langue, devise, thème)</li>
                <li>Adapter l&apos;interface selon votre type de profil (Vendeur, Acheteur)</li>
                <li>Préremplir certains formulaires</li>
              </ul>

              <h3>3.4 Finalités exclues</h3>
              <p>
                <strong>Sellia n&apos;utilise actuellement PAS de cookies à des fins
                publicitaires</strong> (ciblage publicitaire, retargeting, profilage publicitaire,
                vente d&apos;audiences à des annonceurs tiers). Si cela devait évoluer, vous
                en seriez informé(e) au préalable et votre consentement explicite serait
                sollicité.
              </p>
            </section>

            <section id="article-4">
              <h2>Article 4 — Catégories de cookies utilisés</h2>

              <h3>4.1 Cookies strictement nécessaires (essentiels)</h3>
              <p>
                Ces cookies sont indispensables au fonctionnement du Service. Sans eux,
                certaines fonctionnalités essentielles ne pourraient pas être fournies.
                Ils ne peuvent pas être désactivés.
              </p>
              <p>
                <strong>Base légale</strong> : intérêt légitime (article 6.1.f RGPD) et
                exemption au principe de consentement préalable au titre de l&apos;article
                82 de la loi française n° 78-17 modifiée et équivalents européens.
              </p>
              <p>Exemples :</p>
              <ul>
                <li>Cookie de session d&apos;authentification</li>
                <li>Cookie de protection CSRF</li>
                <li>Cookie de mémorisation du consentement aux cookies</li>
                <li>Cookies techniques de répartition de charge</li>
              </ul>

              <h3>4.2 Cookies de mesure d&apos;audience</h3>
              <p>
                Ces cookies nous permettent de comprendre comment les Utilisateurs
                interagissent avec le Service, afin d&apos;identifier les axes
                d&apos;amélioration.
              </p>
              <p>
                <strong>Base légale</strong> : consentement (article 6.1.a RGPD), sauf
                lorsque la mesure d&apos;audience est strictement limitée à la mesure
                d&apos;audience du seul site éditeur, sans transmission à des tiers, ni
                profilage individuel — auquel cas elle peut être exemptée de
                consentement selon les recommandations de la CNIL.
              </p>

              <h3>4.3 Cookies de fonctionnalité</h3>
              <p>
                Ces cookies mémorisent vos choix pour personnaliser votre expérience
                (thème, langue, paramètres d&apos;affichage).
              </p>
              <p>
                <strong>Base légale</strong> : consentement, sauf lorsqu&apos;ils sont
                strictement nécessaires à une fonctionnalité explicitement demandée par
                l&apos;Utilisateur.
              </p>

              <h3>4.4 Cookies de sécurité avancée</h3>
              <p>
                Déposés par notre prestataire Cloudflare, ces cookies permettent de
                détecter les bots, prévenir les attaques DDoS et protéger contre les
                tentatives d&apos;intrusion.
              </p>
              <p>
                <strong>Base légale</strong> : intérêt légitime (sécurité du Service et
                des Utilisateurs).
              </p>
            </section>

            <section id="article-5">
              <h2>Article 5 — Liste détaillée des cookies</h2>
              <p>
                Le tableau ci-dessous présente la liste indicative des cookies utilisés
                par Sellia. Cette liste peut évoluer ; la version à jour est consultable
                sur cette page ou via l&apos;outil de gestion de consentement disponible sur
                le Service.
              </p>

              <h3>5.1 Cookies essentiels (Sellia)</h3>
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Finalité</th>
                    <th>Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>sellia_session</td>
                    <td>Authentification et session</td>
                    <td>Session</td>
                  </tr>
                  <tr>
                    <td>sellia_csrf</td>
                    <td>Protection contre les attaques CSRF</td>
                    <td>Session</td>
                  </tr>
                  <tr>
                    <td>sellia_consent</td>
                    <td>Mémorisation du choix de consentement</td>
                    <td>13 mois</td>
                  </tr>
                  <tr>
                    <td>sellia_locale</td>
                    <td>Langue et préférences régionales</td>
                    <td>1 an</td>
                  </tr>
                  <tr>
                    <td>sellia_cart</td>
                    <td>Contenu du panier (Acheteurs)</td>
                    <td>30 jours</td>
                  </tr>
                </tbody>
              </table>

              <h3>5.2 Cookies de sécurité (Cloudflare)</h3>
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Finalité</th>
                    <th>Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>__cf_bm</td>
                    <td>Détection de bots (Cloudflare Bot Management)</td>
                    <td>30 minutes</td>
                  </tr>
                  <tr>
                    <td>cf_clearance</td>
                    <td>Vérification anti-DDoS</td>
                    <td>30 jours</td>
                  </tr>
                  <tr>
                    <td>__cflb</td>
                    <td>Répartition de charge</td>
                    <td>Session</td>
                  </tr>
                </tbody>
              </table>

              <h3>5.3 Cookies de mesure d&apos;audience</h3>
              <p>
                Sellia utilise un système de mesure d&apos;audience interne, anonymisé, sans
                transmission à des tiers à des fins commerciales. Aucun cookie de
                mesure d&apos;audience publicitaire (Google Analytics avec configuration
                par défaut, Meta Pixel, etc.) n&apos;est actuellement déployé sur le Service.
              </p>
              <p>
                Si Sellia devait intégrer ultérieurement un outil de mesure d&apos;audience
                tiers, vous en serez informé(e) au préalable et votre consentement
                serait sollicité conformément à l&apos;Article 9 de la présente Politique.
              </p>
            </section>

            <section id="article-6">
              <h2>Article 6 — Cookies de tiers</h2>

              <h3>6.1 Principe</h3>
              <p>
                Certains services intégrés au Service Sellia peuvent déposer des
                cookies tiers, sur lesquels nous n&apos;avons qu&apos;un contrôle indirect. Nous
                veillons à minimiser leur usage et à les soumettre à votre
                consentement préalable lorsque la loi l&apos;exige.
              </p>

              <h3>6.2 Liste des tiers</h3>
              <ul>
                <li><strong>Cloudflare, Inc.</strong> — protection, sécurité, distribution de contenu (cookies essentiels). Politique : https://www.cloudflare.com/privacypolicy/</li>
                <li><strong>Google Fonts</strong> — chargement des polices d&apos;écriture (sans cookie de tracking grâce à notre configuration). Politique : https://policies.google.com/privacy</li>
              </ul>

              <h3>6.3 Tiers à venir</h3>
              <p>
                Lors du déploiement complet du Service, nous intégrerons progressivement :
              </p>
              <ul>
                <li><strong>Afribapay</strong> et <strong>CinetPay</strong> — cookies relatifs aux paiements lors des transactions</li>
                <li><strong>Stripe, Inc.</strong> (à terme) — cookies relatifs aux paiements internationaux</li>
                <li><strong>Resend</strong> — éventuels pixels de suivi d&apos;ouverture des emails transactionnels</li>
              </ul>
              <p>
                Ces tiers et leurs cookies feront l&apos;objet d&apos;une mise à jour de la
                présente Politique au moment de leur intégration effective.
              </p>
            </section>

            <section id="article-7">
              <h2>Article 7 — Durées de conservation</h2>
              <p>
                Les durées de conservation des cookies sont fixées en fonction de leur
                finalité et conformément aux recommandations des autorités de contrôle :
              </p>
              <ul>
                <li><strong>Cookies de session</strong> : supprimés à la fermeture du navigateur</li>
                <li><strong>Cookies de consentement</strong> : 13 mois maximum</li>
                <li><strong>Cookies d&apos;authentification persistante (« Se souvenir de moi »)</strong> : 30 jours</li>
                <li><strong>Cookies de mesure d&apos;audience</strong> : 13 mois maximum</li>
                <li><strong>Cookies de fonctionnalité (préférences)</strong> : 13 mois maximum</li>
                <li><strong>Cookies de sécurité Cloudflare</strong> : durées variables, conformes à leur politique</li>
              </ul>
              <p>
                Au terme de la durée de conservation, le cookie est automatiquement
                supprimé. Si vous revenez sur le Service après l&apos;expiration, votre
                consentement vous sera de nouveau demandé pour les cookies non
                essentiels.
              </p>
            </section>

            <section id="article-8">
              <h2>Article 8 — Bases légales</h2>
              <p>
                Conformément aux exigences du RGPD et de la directive ePrivacy, le
                dépôt de cookies repose sur les bases légales suivantes :
              </p>

              <h3>8.1 Consentement préalable</h3>
              <p>
                Pour les cookies non essentiels (mesure d&apos;audience non exemptée,
                fonctionnalité non strictement nécessaire), votre consentement libre,
                spécifique, éclairé et univoque est requis avant tout dépôt.
              </p>
              <p>
                Ce consentement est recueilli via une bannière à votre première visite,
                avec possibilité de l&apos;accepter, le refuser ou paramétrer finement vos
                choix.
              </p>

              <h3>8.2 Exemption au consentement</h3>
              <p>
                Conformément aux lignes directrices européennes et à la jurisprudence,
                ne nécessitent pas de consentement préalable :
              </p>
              <ul>
                <li>Les cookies strictement nécessaires à la fourniture du service expressément demandé par l&apos;Utilisateur</li>
                <li>Les cookies de mesure d&apos;audience strictement limités à la mesure d&apos;audience du seul éditeur, sans recoupement et sans transmission à des tiers</li>
                <li>Les cookies de sécurité (anti-fraude, anti-DDoS) nécessaires à la protection du Service et des Utilisateurs</li>
              </ul>
            </section>

            <section id="article-9">
              <h2>Article 9 — Gestion de votre consentement</h2>

              <h3>9.1 Bannière de consentement</h3>
              <p>
                Lors de votre première visite sur le Service, une bannière vous permet
                de :
              </p>
              <ul>
                <li><strong>Accepter</strong> tous les cookies</li>
                <li><strong>Refuser</strong> tous les cookies non essentiels</li>
                <li><strong>Paramétrer</strong> finement votre choix par catégorie</li>
              </ul>
              <p>
                Le bouton « Refuser » est aussi visible et accessible que le bouton
                « Accepter », conformément aux recommandations de la CNIL.
              </p>

              <h3>9.2 Modification de votre choix</h3>
              <p>
                Vous pouvez modifier votre choix à tout moment via :
              </p>
              <ul>
                <li>Le lien « Gérer mes cookies » présent dans le pied de page du Service (à venir)</li>
                <li>Les paramètres de votre Compte, section « Confidentialité »</li>
                <li>Une demande adressée à <strong>dpo@getsellia.com</strong></li>
              </ul>

              <h3>9.3 Retrait du consentement</h3>
              <p>
                Vous pouvez retirer votre consentement à tout moment, sans que cela
                n&apos;affecte la licéité des traitements antérieurs.
              </p>
            </section>

            <section id="article-10">
              <h2>Article 10 — Désactivation par le navigateur</h2>
              <p>
                Indépendamment de l&apos;outil de gestion fourni par Sellia, vous pouvez
                paramétrer votre navigateur pour bloquer ou supprimer les cookies. Voici
                des liens utiles vers les principaux navigateurs :
              </p>
              <ul>
                <li><strong>Google Chrome</strong> : Paramètres → Confidentialité et sécurité → Cookies et autres données de site</li>
                <li><strong>Mozilla Firefox</strong> : Paramètres → Vie privée et sécurité → Cookies et données de sites</li>
                <li><strong>Apple Safari</strong> : Préférences → Confidentialité → Gérer les données de site web</li>
                <li><strong>Microsoft Edge</strong> : Paramètres → Cookies et autorisations de site</li>
                <li><strong>Brave</strong> : Paramètres → Boucliers</li>
                <li><strong>Opera</strong> : Paramètres → Avancé → Confidentialité et sécurité</li>
              </ul>
              <p>
                Pour les terminaux mobiles, des paramètres équivalents sont disponibles
                dans les réglages du système d&apos;exploitation (iOS, Android).
              </p>
            </section>

            <section id="article-11">
              <h2>Article 11 — Conséquences du refus</h2>

              <h3>11.1 Refus des cookies non essentiels</h3>
              <p>
                Le refus des cookies non essentiels n&apos;empêche pas l&apos;utilisation du
                Service. Toutefois, certaines fonctionnalités peuvent être limitées :
              </p>
              <ul>
                <li>Vos préférences ne pourront pas être mémorisées entre les sessions</li>
                <li>Les améliorations basées sur l&apos;analyse de l&apos;usage seront ralenties</li>
                <li>Vous pourrez voir réapparaître la bannière de consentement plus fréquemment</li>
              </ul>

              <h3>11.2 Désactivation des cookies essentiels</h3>
              <p>
                Si vous désactivez les cookies strictement nécessaires (via votre
                navigateur), le Service ne pourra pas fonctionner correctement.
                Notamment, vous ne pourrez pas vous connecter à votre Compte, ni
                effectuer de transactions.
              </p>
            </section>

            <section id="article-12">
              <h2>Article 12 — Vos droits</h2>
              <p>
                Conformément au RGPD et aux législations applicables, vous disposez des
                droits suivants concernant les données associées aux cookies :
              </p>
              <ul>
                <li>Droit d&apos;accès aux données collectées via les cookies</li>
                <li>Droit de rectification de données inexactes</li>
                <li>Droit à l&apos;effacement (suppression des cookies et des données associées)</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit d&apos;opposition aux traitements basés sur l&apos;intérêt légitime</li>
                <li>Droit de retirer votre consentement à tout moment</li>
                <li>Droit d&apos;introduire une réclamation auprès d&apos;une autorité de contrôle</li>
              </ul>
              <p>
                L&apos;exercice de ces droits est détaillé à l&apos;Article 14 de notre <Link href="/confidentialite" className="legal-link">Politique de Confidentialité</Link>.
              </p>
            </section>

            <section id="article-13">
              <h2>Article 13 — Modifications de la politique</h2>
              <p>
                Cette Politique peut être mise à jour pour refléter :
              </p>
              <ul>
                <li>L&apos;ajout de nouvelles fonctionnalités utilisant des cookies</li>
                <li>L&apos;intégration de nouveaux prestataires tiers</li>
                <li>Les évolutions de la législation ou des recommandations des autorités</li>
                <li>Toute autre évolution pertinente</li>
              </ul>
              <p>
                Toute modification substantielle vous sera notifiée :
              </p>
              <ul>
                <li>Par une nouvelle bannière de consentement le cas échéant</li>
                <li>Par notification visible dans le Service</li>
                <li>Par mise à jour du numéro de version et de la date en tête de la présente Politique</li>
              </ul>
              <p>
                La date de dernière mise à jour est indiquée en tête de cette page. Les
                versions antérieures sont archivées et disponibles sur demande à <strong>dpo@getsellia.com</strong>.
              </p>
            </section>

            <section id="article-14">
              <h2>Article 14 — Contact</h2>
              <p>Pour toute question concernant cette Politique :</p>
              <div className="legal-info-block">
                <p>
                  <strong>Délégué à la Protection des Données</strong> : dpo@getsellia.com<br />
                  <strong>Service confidentialité</strong> : privacy@getsellia.com<br />
                  <strong>Contact général</strong> : contact@getsellia.com
                </p>
                <p>
                  <strong>Adresse postale</strong> :<br />
                  Rollo Technologies Inc.<br />
                  Attn: Data Protection Officer<br />
                  1111B S Governors Ave, Suite 59264<br />
                  Dover, DE 19904<br />
                  États-Unis d&apos;Amérique
                </p>
              </div>
            </section>

            <div className="legal-signature">
              <p>
                <strong>Document approuvé et publié par :</strong><br />
                Dylan NONGA<br />
                Responsable conformité, Rollo Technologies Inc.<br />
                Le 30 avril 2026
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="legal-footer">
        <div className="container">
          <div className="legal-footer-inner">
            <span>© 2026 Rollo Technologies Inc. · Tous droits réservés · Sellia™ est une marque de Rollo Technologies Inc.</span>
            <div className="legal-footer-links">
              <Link href="/conditions">Conditions</Link>
              <Link href="/confidentialite">Confidentialité</Link>
              <Link href="/mentions-legales">Mentions légales</Link>
              <Link href="/cookies">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
