import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions Légales",
  description: "Mentions légales du service Sellia, opéré par Fiable Technologies LLC",
  robots: { index: false, follow: false },
};

export default function MentionsLegales() {
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
          {/* En-tête formelle */}
          <div className="legal-header">
            <span className="legal-tag">Document juridique</span>
            <h1 className="legal-title">Mentions <em>légales</em></h1>
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
                <span className="legal-meta-label">Contact juridique</span>
                <span className="legal-meta-value">legal@getsellia.com</span>
              </div>
            </div>
          </div>

          {/* Sommaire */}
          <div className="legal-toc">
            <h3>Sommaire</h3>
            <ol>
              <li><a href="#article-1">Identification de l&apos;éditeur</a></li>
              <li><a href="#article-2">Identification du directeur de la publication</a></li>
              <li><a href="#article-3">Hébergement et infrastructure technique</a></li>
              <li><a href="#article-4">Activité du service</a></li>
              <li><a href="#article-5">Propriété intellectuelle</a></li>
              <li><a href="#article-6">Marques tierces</a></li>
              <li><a href="#article-7">Liens hypertextes</a></li>
              <li><a href="#article-8">Crédits et remerciements</a></li>
              <li><a href="#article-9">Données personnelles et cookies</a></li>
              <li><a href="#article-10">Conditions d&apos;utilisation</a></li>
              <li><a href="#article-11">Limitation de responsabilité</a></li>
              <li><a href="#article-12">Loi applicable et juridiction compétente</a></li>
              <li><a href="#article-13">Modification des mentions légales</a></li>
              <li><a href="#article-14">Signalement de contenu illicite</a></li>
              <li><a href="#article-15">Contact</a></li>
            </ol>
          </div>

          <div className="legal-content">
            {/* Préambule */}
            <section className="legal-preamble">
              <h2>Préambule</h2>
              <p>
                Conformément aux dispositions des articles applicables relatifs à la
                confiance dans l&apos;économie numérique (notamment, en France, la loi n°
                2004-575 du 21 juin 2004 dite « LCEN » ; aux États-Unis, le Digital
                Millennium Copyright Act ; et dans les juridictions d&apos;Afrique
                francophone, les législations équivalentes telles que la Loi
                camerounaise n° 2010/012 du 21 décembre 2010 ou la Loi sénégalaise n°
                2008-11 du 25 janvier 2008), il est porté à la connaissance des
                Utilisateurs du présent service les informations détaillées ci-après.
              </p>
              <p>
                Les présentes mentions légales s&apos;appliquent à toute personne consultant
                ou utilisant le service Sellia, accessible à l&apos;adresse <strong>https://getsellia.com</strong> et ses sous-domaines associés.
              </p>
            </section>

            <section id="article-1">
              <h2>Article 1 — Identification de l&apos;éditeur</h2>
              <p>
                Le service Sellia (ci-après « le Service ») est édité et exploité par :
              </p>
              <div className="legal-info-block">
                <p><strong>Fiable Technologies LLC</strong></p>
                <p>
                  Société de droit américain (Corporation)<br />
                  Constituée selon les lois de l&apos;État du Delaware, États-Unis d&apos;Amérique
                </p>
                <p>
                  <strong>Siège social</strong> :<br />
                  1111B S Governors Ave, Suite 59264<br />
                  Dover, DE 19904<br />
                  États-Unis d&apos;Amérique
                </p>
                <p>
                  <strong>Forme juridique</strong> : Delaware C-Corporation<br />
                  <strong>Numéro d&apos;immatriculation</strong> : disponible sur demande motivée<br />
                  <strong>Représentant légal</strong> : Dylan NONGA, responsable conformité
                </p>
                <p>
                  <strong>Adresse électronique générale</strong> : contact@getsellia.com<br />
                  <strong>Adresse électronique juridique</strong> : legal@getsellia.com
                </p>
              </div>
              <p>
                Fiable Technologies LLC exploite le Service Sellia en tant que marque
                commerciale. Sellia constitue une activité opérée par Fiable Technologies
                Inc. mais positionnée comme une offre distincte ciblant le marché du
                commerce digital.
              </p>
            </section>

            <section id="article-2">
              <h2>Article 2 — Identification du directeur de la publication</h2>
              <p>
                Le directeur de la publication, au sens des dispositions légales
                applicables aux services de communication au public en ligne, est :
              </p>
              <div className="legal-info-block">
                <p>
                  <strong>Dylan NONGA</strong><br />
                  Responsable conformité de Fiable Technologies LLC<br />
                  Contact : <strong>legal@getsellia.com</strong>
                </p>
              </div>
              <p>
                Le directeur de la publication est responsable du contenu éditorial du
                Service. Toute demande relative au contenu publié peut lui être
                adressée à l&apos;adresse électronique mentionnée ci-dessus.
              </p>
            </section>

            <section id="article-3">
              <h2>Article 3 — Hébergement et infrastructure technique</h2>
              <p>
                Le Service est hébergé sur une infrastructure cloud professionnelle
                composée de plusieurs prestataires intervenant chacun dans leur domaine
                de compétence. La liste détaillée des prestataires techniques est la
                suivante :
              </p>

              <h3>3.1 Hébergement principal du serveur applicatif</h3>
              <div className="legal-info-block">
                <p>
                  <strong>Hostinger International Ltd.</strong><br />
                  61 Lordou Vironos Street, 6023 Larnaca, Chypre<br />
                  Société de droit chypriote, conforme RGPD<br />
                  Site web : https://www.hostinger.com
                </p>
              </div>

              <h3>3.2 Réseau de distribution de contenu (CDN), DNS et protection</h3>
              <div className="legal-info-block">
                <p>
                  <strong>Cloudflare, Inc.</strong><br />
                  101 Townsend Street, San Francisco, California 94107, États-Unis<br />
                  Société de droit américain (Delaware)<br />
                  Certifié SOC 2 Type II, ISO 27001<br />
                  Site web : https://www.cloudflare.com
                </p>
              </div>

              <h3>3.3 Hébergement du code source et du système de versioning</h3>
              <div className="legal-info-block">
                <p>
                  <strong>GitHub, Inc.</strong> (filiale de Microsoft Corporation)<br />
                  88 Colin P. Kelly Jr Street, San Francisco, California 94107, États-Unis<br />
                  Site web : https://github.com
                </p>
              </div>

              <h3>3.4 Partenaires de paiement (à venir)</h3>
              <p>
                Le Service intégrera prochainement plusieurs partenaires de paiement
                certifiés pour le traitement sécurisé des transactions. Ces partenaires
                seront listés dans la <Link href="/confidentialite" className="legal-link">Politique de Confidentialité</Link> dès leur mise en production.
              </p>
            </section>

            <section id="article-4">
              <h2>Article 4 — Activité du service</h2>

              <h3>4.1 Description générale</h3>
              <p>
                Sellia est un service logiciel en mode SaaS (Software as a Service)
                permettant à toute personne physique ou morale (ci-après le « Vendeur »)
                de créer, configurer et exploiter une boutique en ligne destinée à la
                commercialisation de biens ou services auprès de consommateurs ou
                professionnels (ci-après l&apos;« Acheteur »).
              </p>

              <h3>4.2 Fonctionnalités principales</h3>
              <p>Le Service offre notamment les fonctionnalités suivantes :</p>
              <ul>
                <li>Création automatisée d&apos;une boutique en ligne par génération assistée par intelligence artificielle, à partir d&apos;une description fournie par le Vendeur</li>
                <li>Gestion du catalogue de produits ou services (descriptions, photographies, prix, stocks, variantes)</li>
                <li>Intégration de moyens de paiement multiples : Mobile Money (MTN MoMo, Orange Money, Wave, Moov Money, Free Money), cartes bancaires Visa et Mastercard, virements bancaires</li>
                <li>Configuration des modalités de livraison locale et internationale</li>
                <li>Outils marketing (génération de descriptions, optimisation SEO, partages sur réseaux sociaux)</li>
                <li>Tableau de bord analytique pour le suivi des ventes et de la performance commerciale</li>
                <li>Espace membre et gestion d&apos;abonnements pour les Vendeurs proposant des produits digitaux</li>
              </ul>

              <h3>4.3 Marchés visés</h3>
              <p>
                Sellia est conçu prioritairement pour les marchés d&apos;Afrique francophone
                (Cameroun, Côte d&apos;Ivoire, Sénégal, République démocratique du Congo,
                Mali, Burkina Faso, Togo, Bénin, Niger, et autres pays utilisant le
                français comme langue officielle ou de travail), tout en restant
                accessible aux Utilisateurs du monde entier.
              </p>

              <h3>4.4 Statut du service au moment de la publication</h3>
              <p>
                À la date de publication des présentes mentions légales, le Service
                Sellia est proposé en bêta privée sur invitation. Certaines
                fonctionnalités peuvent être progressivement activées au fur et à
                mesure du déploiement commercial. Les éventuelles limitations sont
                communiquées dans les <Link href="/conditions" className="legal-link">Conditions Générales d&apos;Utilisation</Link>.
              </p>
            </section>

            <section id="article-5">
              <h2>Article 5 — Propriété intellectuelle</h2>

              <h3>5.1 Droits de Fiable Technologies LLC</h3>
              <p>
                L&apos;ensemble des éléments composant le Service Sellia, à savoir
                notamment :
              </p>
              <ul>
                <li>La marque verbale et figurative « Sellia » et son logo associé</li>
                <li>L&apos;identité visuelle du Service (charte graphique, palette de couleurs Ink/Ivory/Ember, typographies Fraunces et Inter)</li>
                <li>Le code source de l&apos;application web et de ses composants</li>
                <li>L&apos;architecture logicielle et les bases de données associées</li>
                <li>Les textes, illustrations, photographies, vidéos, animations</li>
                <li>Les modèles d&apos;invites (« prompts ») et workflows d&apos;intelligence artificielle conçus par Sellia</li>
                <li>L&apos;ensemble des contenus éditoriaux (articles, FAQ, documentation)</li>
              </ul>
              <p>
                sont la propriété exclusive de Fiable Technologies LLC ou de ses
                concédants de licence, et sont protégés par les lois en vigueur sur la
                propriété intellectuelle, notamment le droit d&apos;auteur, le droit des
                marques, le droit des dessins et modèles, ainsi que le droit des bases
                de données.
              </p>

              <h3>5.2 Interdiction d&apos;exploitation non autorisée</h3>
              <p>
                Toute reproduction, représentation, modification, publication,
                adaptation, traduction, distribution ou exploitation, totale ou
                partielle, de tout ou partie des éléments susmentionnés, par quelque
                procédé que ce soit et sur quelque support que ce soit, est strictement
                interdite, sauf autorisation écrite préalable de Fiable Technologies
                Inc.
              </p>
              <p>
                Toute exploitation non autorisée constitue une contrefaçon engageant la
                responsabilité civile et pénale de son auteur, conformément aux
                dispositions du Code de la propriété intellectuelle français, du U.S.
                Copyright Act, et de toute autre législation applicable.
              </p>

              <h3>5.3 Contenus créés par les Utilisateurs</h3>
              <p>
                Les contenus que les Utilisateurs téléchargent ou créent au moyen du
                Service (notamment : descriptions de produits, photographies de
                produits, contenus marketing, données de leur boutique) demeurent leur
                propriété exclusive. L&apos;Utilisateur concède toutefois à Fiable
                Technologies Inc. une licence non-exclusive, mondiale et gratuite,
                pour la durée d&apos;utilisation du Service, aux fins limitatives suivantes :
              </p>
              <ul>
                <li>Hébergement et stockage des contenus</li>
                <li>Affichage des contenus dans le cadre du fonctionnement de la boutique de l&apos;Utilisateur</li>
                <li>Sauvegarde technique pour assurer la continuité du Service</li>
                <li>Adaptation technique nécessaire à l&apos;affichage sur différents appareils</li>
              </ul>
              <p>
                Cette licence prend fin avec la suppression du compte Utilisateur, sous
                réserve des sauvegardes techniques temporaires conservées conformément
                à la <Link href="/confidentialite" className="legal-link">Politique de Confidentialité</Link>.
              </p>
            </section>

            <section id="article-6">
              <h2>Article 6 — Marques tierces</h2>
              <p>
                Le Service mentionne ou utilise des marques appartenant à des tiers,
                notamment dans le cadre des intégrations de paiement et des
                certifications de sécurité. Ces marques restent la propriété exclusive
                de leurs titulaires respectifs.
              </p>
              <p>Les marques tierces référencées incluent, à titre non limitatif :</p>
              <ul>
                <li><strong>MTN Mobile Money (MoMo)</strong> — propriété de MTN Group Limited</li>
                <li><strong>Orange Money</strong> — propriété d&apos;Orange S.A.</li>
                <li><strong>Wave</strong> — propriété de Wave Mobile Money, Inc.</li>
                <li><strong>Moov Money</strong> — propriété de Maroc Telecom</li>
                <li><strong>Free Money</strong> — propriété de Sonatel</li>
                <li><strong>Visa</strong> — propriété de Visa Inc.</li>
                <li><strong>Mastercard</strong> — propriété de Mastercard International Incorporated</li>
                <li><strong>Cloudflare</strong> — propriété de Cloudflare, Inc.</li>
              </ul>
              <p>
                L&apos;utilisation de ces marques sur le Service est strictement
                informative, visant à indiquer la compatibilité technique avec ces
                services. Aucune affiliation, association, partenariat formel ou
                approbation par les titulaires de ces marques n&apos;est sous-entendue,
                sauf mention explicite contraire.
              </p>
            </section>

            <section id="article-7">
              <h2>Article 7 — Liens hypertextes</h2>

              <h3>7.1 Liens entrants</h3>
              <p>
                La création de liens hypertextes pointant vers le Service Sellia est
                autorisée, sous réserve de respecter les conditions suivantes :
              </p>
              <ul>
                <li>Le lien doit pointer vers une page publiquement accessible du Service</li>
                <li>Le contexte du lien ne doit pas être préjudiciable à la réputation de Sellia ou de Fiable Technologies LLC</li>
                <li>Le lien ne doit pas induire en erreur sur l&apos;origine du contenu lié</li>
                <li>Le lien ne doit pas s&apos;accompagner d&apos;une utilisation non autorisée des marques de Sellia</li>
              </ul>

              <h3>7.2 Liens sortants</h3>
              <p>
                Le Service peut contenir des liens hypertextes pointant vers des sites
                tiers. Fiable Technologies LLC n&apos;exerce aucun contrôle éditorial sur
                ces sites tiers et ne saurait être tenu responsable de leur contenu, de
                leur disponibilité, de leur conformité légale, ou de toute conséquence
                résultant de leur consultation.
              </p>
              <p>
                L&apos;Utilisateur consulte les sites tiers sous sa seule responsabilité.
              </p>
            </section>

            <section id="article-8">
              <h2>Article 8 — Crédits et remerciements</h2>
              <p>
                Le développement du Service Sellia s&apos;appuie sur diverses ressources et
                technologies open source dont nous reconnaissons l&apos;importance :
              </p>
              <ul>
                <li><strong>Next.js</strong> (framework React) — Vercel Inc.</li>
                <li><strong>React</strong> (bibliothèque JavaScript) — Meta Platforms, Inc.</li>
                <li><strong>TypeScript</strong> — Microsoft Corporation</li>
                <li><strong>Tailwind CSS</strong> — Tailwind Labs, Inc.</li>
                <li><strong>Polices Inter</strong> — Rasmus Andersson (licence SIL Open Font License)</li>
                <li><strong>Polices Fraunces</strong> — Undercase Type (licence SIL Open Font License)</li>
                <li><strong>Polices JetBrains Mono</strong> — JetBrains s.r.o. (licence SIL Open Font License)</li>
              </ul>
            </section>

            <section id="article-9">
              <h2>Article 9 — Données personnelles et cookies</h2>
              <p>
                Le traitement des données personnelles dans le cadre du Service est
                régi par notre <Link href="/confidentialite" className="legal-link">Politique de Confidentialité</Link>, conforme au Règlement Général sur la Protection des Données (RGPD), au California Consumer Privacy Act (CCPA), et aux législations africaines équivalentes.
              </p>
              <p>
                L&apos;utilisation des cookies et technologies de suivi est détaillée dans
                notre <Link href="/cookies" className="legal-link">Politique de Cookies</Link>.
              </p>
              <p>
                Le Délégué à la Protection des Données (DPO) est joignable à l&apos;adresse :
                <strong> dpo@getsellia.com</strong>
              </p>
            </section>

            <section id="article-10">
              <h2>Article 10 — Conditions d&apos;utilisation</h2>
              <p>
                L&apos;accès et l&apos;utilisation du Service sont soumis aux <Link href="/conditions" className="legal-link">Conditions Générales d&apos;Utilisation</Link>, qui forment, ensemble avec les présentes mentions légales et la Politique de Confidentialité, le cadre contractuel applicable à toute utilisation du Service.
              </p>
            </section>

            <section id="article-11">
              <h2>Article 11 — Limitation de responsabilité</h2>
              <p>
                Fiable Technologies LLC met en œuvre tous les moyens raisonnables pour
                assurer le bon fonctionnement, la sécurité et la disponibilité du
                Service. Toutefois, dans les limites autorisées par la loi applicable,
                Fiable Technologies LLC ne saurait être tenu responsable :
              </p>
              <ul>
                <li>Des interruptions de service liées à des opérations de maintenance, des évolutions techniques, ou des cas de force majeure</li>
                <li>Des dommages directs ou indirects résultant de l&apos;utilisation ou de l&apos;impossibilité d&apos;utiliser le Service</li>
                <li>Des contenus publiés par les Utilisateurs sur leurs boutiques générées</li>
                <li>Des transactions commerciales conclues entre Vendeurs et Acheteurs via les boutiques générées</li>
                <li>Des défaillances éventuelles des prestataires techniques tiers (hébergeurs, partenaires de paiement, services de livraison)</li>
                <li>Des erreurs ou inexactitudes dans les contenus générés automatiquement par les fonctionnalités d&apos;intelligence artificielle</li>
              </ul>
              <p>
                Les limitations spécifiques de responsabilité applicables à chaque
                catégorie d&apos;Utilisateur (Vendeurs, Acheteurs) sont précisées dans les <Link href="/conditions" className="legal-link">Conditions Générales d&apos;Utilisation</Link>.
              </p>
            </section>

            <section id="article-12">
              <h2>Article 12 — Loi applicable et juridiction compétente</h2>

              <h3>12.1 Droit applicable</h3>
              <p>
                Les présentes mentions légales sont régies par le droit de l&apos;État du
                Delaware, États-Unis d&apos;Amérique, sans égard à ses règles de conflit de
                lois.
              </p>
              <p>
                Toutefois, les Utilisateurs résidant dans l&apos;Union Européenne, en
                Suisse, au Royaume-Uni, ou dans tout pays appliquant des règles
                impératives de protection du consommateur ou de protection des données
                personnelles, conservent le bénéfice des dispositions impératives de
                leur droit national applicable, notamment en matière de RGPD.
              </p>
              <p>
                De même, les Utilisateurs résidant dans les pays membres de
                l&apos;Organisation pour l&apos;Harmonisation en Afrique du Droit des Affaires
                (OHADA) bénéficient, pour les matières concernées, des dispositions des
                Actes uniformes de l&apos;OHADA.
              </p>

              <h3>12.2 Juridiction compétente</h3>
              <p>
                Tout litige relatif à l&apos;interprétation, à l&apos;exécution ou à la validité
                des présentes mentions légales sera, à défaut de résolution amiable
                préalable, soumis :
              </p>
              <ul>
                <li>À la compétence exclusive des tribunaux de l&apos;État du Delaware (Court of Chancery), pour les Utilisateurs commerçants ou professionnels</li>
                <li>Aux juridictions compétentes selon les règles impératives applicables, pour les Utilisateurs consommateurs résidant dans l&apos;UE, l&apos;OHADA, ou tout autre territoire imposant ses propres règles de compétence</li>
              </ul>

              <h3>12.3 Médiation et résolution amiable</h3>
              <p>
                Avant toute action contentieuse, les parties s&apos;engagent à rechercher
                une solution amiable du litige. Le cas échéant, le recours à une
                médiation indépendante peut être proposé. Les Utilisateurs
                consommateurs résidant dans l&apos;Union Européenne disposent par ailleurs
                de la plateforme européenne de règlement en ligne des litiges,
                accessible à : <strong>https://ec.europa.eu/consumers/odr</strong>
              </p>
            </section>

            <section id="article-13">
              <h2>Article 13 — Modification des mentions légales</h2>
              <p>
                Fiable Technologies LLC se réserve le droit de modifier les présentes
                mentions légales à tout moment, notamment pour les adapter aux
                évolutions législatives, réglementaires ou techniques.
              </p>
              <p>
                Les Utilisateurs sont informés des modifications substantielles par les
                moyens suivants :
              </p>
              <ul>
                <li>Notification visible sur le Service pendant au moins 30 jours après publication</li>
                <li>Notification par courrier électronique à l&apos;adresse fournie lors de l&apos;inscription, le cas échéant</li>
                <li>Mise à jour du numéro de version et de la date de révision en tête du présent document</li>
              </ul>
              <p>
                La poursuite de l&apos;utilisation du Service après l&apos;entrée en vigueur des
                modifications vaut acceptation tacite des nouvelles mentions légales.
              </p>
            </section>

            <section id="article-14">
              <h2>Article 14 — Signalement de contenu illicite</h2>
              <p>
                Conformément aux obligations applicables aux services de communication
                au public en ligne, Fiable Technologies LLC met en place une procédure
                de signalement permettant à toute personne de notifier la présence sur
                le Service d&apos;un contenu manifestement illicite.
              </p>

              <h3>14.1 Adresse de signalement</h3>
              <p>
                Tout signalement doit être adressé à : <strong>abuse@getsellia.com</strong>
              </p>

              <h3>14.2 Contenu d&apos;un signalement</h3>
              <p>Pour être traité efficacement, le signalement doit contenir :</p>
              <ul>
                <li>L&apos;identité du déclarant (nom, prénom, profession, domicile, nationalité, date et lieu de naissance pour une personne physique ; raison sociale et siège social pour une personne morale)</li>
                <li>Une adresse électronique à laquelle le déclarant peut être contacté</li>
                <li>La description précise du contenu litigieux et sa localisation exacte sur le Service (URL)</li>
                <li>Les motifs pour lesquels le contenu doit être considéré comme illicite</li>
                <li>Le cas échéant, la copie de la correspondance préalable adressée à l&apos;auteur ou à l&apos;éditeur du contenu pour en obtenir le retrait</li>
              </ul>

              <h3>14.3 Traitement des signalements</h3>
              <p>
                Fiable Technologies LLC s&apos;engage à examiner chaque signalement avec
                diligence et à répondre dans un délai raisonnable. En cas de contenu
                manifestement illicite avéré, le contenu sera retiré ou son accès rendu
                impossible dans les meilleurs délais.
              </p>
              <p>
                Tout signalement abusif, mensonger ou de mauvaise foi peut engager la
                responsabilité civile et pénale de son auteur.
              </p>
            </section>

            <section id="article-15">
              <h2>Article 15 — Contact</h2>
              <p>
                Pour toute demande relative aux présentes mentions légales,
                l&apos;Utilisateur peut nous contacter par les moyens suivants :
              </p>
              <div className="legal-info-block">
                <p>
                  <strong>Contact général</strong> : contact@getsellia.com<br />
                  <strong>Service juridique</strong> : legal@getsellia.com<br />
                  <strong>Délégué à la protection des données</strong> : dpo@getsellia.com<br />
                  <strong>Signalement de contenu</strong> : abuse@getsellia.com<br />
                  <strong>Support technique</strong> : support@getsellia.com
                </p>
                <p>
                  <strong>Adresse postale</strong> :<br />
                  Fiable Technologies LLC<br />
                  Attn: Legal Department<br />
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
                Responsable conformité, Fiable Technologies LLC<br />
                Le 30 avril 2026
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="legal-footer">
        <div className="container">
          <div className="legal-footer-inner">
            <span>© 2026 Fiable Technologies LLC · Tous droits réservés · Sellia™ est une marque de Fiable Technologies LLC</span>
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
