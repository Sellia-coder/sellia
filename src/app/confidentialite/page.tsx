import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de Confidentialité",
  description: "Politique de confidentialité du service Sellia, conforme RGPD, CCPA et lois OHADA. Opéré par Fiable Technologies LLC",
  robots: { index: false, follow: false },
};

export default function Confidentialite() {
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
            <h1 className="legal-title">Politique de <em>confidentialité</em></h1>
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
              <li><a href="#article-1">Définitions</a></li>
              <li><a href="#article-2">Responsable du traitement</a></li>
              <li><a href="#article-3">Délégué à la protection des données</a></li>
              <li><a href="#article-4">Catégories de données collectées</a></li>
              <li><a href="#article-5">Sources des données</a></li>
              <li><a href="#article-6">Finalités du traitement</a></li>
              <li><a href="#article-7">Bases légales</a></li>
              <li><a href="#article-8">Destinataires des données</a></li>
              <li><a href="#article-9">Sous-traitants</a></li>
              <li><a href="#article-10">Transferts internationaux</a></li>
              <li><a href="#article-11">Durées de conservation</a></li>
              <li><a href="#article-12">Sécurité des données</a></li>
              <li><a href="#article-13">Vos droits</a></li>
              <li><a href="#article-14">Exercice de vos droits</a></li>
              <li><a href="#article-15">Mineurs</a></li>
              <li><a href="#article-16">Profilage et décision automatisée</a></li>
              <li><a href="#article-17">Violations de données</a></li>
              <li><a href="#article-18">Modifications de la politique</a></li>
              <li><a href="#article-19">Contact et réclamations</a></li>
            </ol>
          </div>

          <div className="legal-content">
            <section className="legal-preamble">
              <h2>Préambule</h2>
              <p>
                Fiable Technologies LLC (ci-après « <strong>Fiable</strong> », « <strong>nous</strong> », « <strong>notre</strong> » ou « <strong>nos</strong> »), société de droit américain immatriculée dans l&apos;État du Delaware, exploite le service Sellia (ci-après « <strong>le Service</strong> ») accessible à l&apos;adresse <strong>https://getsellia.com</strong>.
              </p>
              <p>
                La protection de vos données personnelles est une priorité pour Fiable. La
                présente Politique de Confidentialité (ci-après « <strong>la Politique</strong> ») a pour
                objet de vous informer, de manière claire, complète et transparente, sur
                la manière dont nous collectons, utilisons, conservons, partageons et
                protégeons vos données personnelles dans le cadre de l&apos;utilisation du
                Service.
              </p>
              <p>
                Cette Politique est conforme aux principales législations applicables en
                matière de protection des données :
              </p>
              <ul>
                <li>Le Règlement (UE) 2016/679 du 27 avril 2016, dit « RGPD », pour les Utilisateurs résidant dans l&apos;Espace Économique Européen</li>
                <li>Le UK Data Protection Act 2018, pour les Utilisateurs résidant au Royaume-Uni</li>
                <li>Le California Consumer Privacy Act (CCPA), pour les résidents de Californie</li>
                <li>La Loi camerounaise n° 2010/012 du 21 décembre 2010 relative à la cybersécurité et la cybercriminalité, ainsi que la Loi n° 2024/017 sur la protection des données</li>
                <li>La Loi sénégalaise n° 2008-12 du 25 janvier 2008 sur la protection des données à caractère personnel</li>
                <li>La Loi ivoirienne n° 2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel</li>
                <li>L&apos;Acte uniforme OHADA portant droit commercial général, pour les aspects commerciaux applicables</li>
              </ul>
              <p>
                Nous vous invitons à lire attentivement la présente Politique. En
                utilisant le Service, vous reconnaissez en avoir pris connaissance et,
                lorsque la base légale du traitement est le consentement, vous acceptez
                expressément les traitements décrits.
              </p>
            </section>

            <section id="article-1">
              <h2>Article 1 — Définitions</h2>
              <p>Aux fins de la présente Politique, les termes ci-dessous, avec ou sans majuscule, ont la signification suivante :</p>
              <ul>
                <li><strong>« Données personnelles »</strong> : toute information se rapportant à une personne physique identifiée ou identifiable, directement ou indirectement.</li>
                <li><strong>« Traitement »</strong> : toute opération effectuée sur des Données personnelles (collecte, enregistrement, organisation, conservation, modification, extraction, consultation, utilisation, communication, mise à disposition, effacement, etc.).</li>
                <li><strong>« Responsable du traitement »</strong> : la personne morale qui détermine les finalités et les moyens du Traitement. En l&apos;espèce : Fiable Technologies LLC</li>
                <li><strong>« Sous-traitant »</strong> : la personne morale qui traite des Données personnelles pour le compte du Responsable du traitement.</li>
                <li><strong>« Utilisateur »</strong> : toute personne physique utilisant le Service, qu&apos;elle soit Vendeur ou Acheteur.</li>
                <li><strong>« Vendeur »</strong> : Utilisateur qui crée et exploite une boutique en ligne via le Service pour commercialiser ses produits ou services.</li>
                <li><strong>« Acheteur »</strong> : Utilisateur qui visite ou effectue des achats sur une boutique générée par un Vendeur via le Service.</li>
                <li><strong>« Cookie »</strong> : petit fichier texte déposé sur le terminal de l&apos;Utilisateur lors de la consultation du Service.</li>
                <li><strong>« RGPD »</strong> : Règlement (UE) 2016/679 du Parlement européen et du Conseil du 27 avril 2016.</li>
                <li><strong>« DPO »</strong> : Délégué à la Protection des Données (Data Protection Officer).</li>
                <li><strong>« Autorité de contrôle »</strong> : autorité publique indépendante chargée de veiller à l&apos;application de la législation en matière de protection des données (CNIL en France, ICO au Royaume-Uni, FTC aux États-Unis, Commission de Protection des Données Personnelles au Sénégal, ANTIC au Cameroun, etc.).</li>
              </ul>
            </section>

            <section id="article-2">
              <h2>Article 2 — Responsable du traitement</h2>
              <p>
                Le Responsable du traitement de vos Données personnelles est :
              </p>
              <div className="legal-info-block">
                <p>
                  <strong>Fiable Technologies LLC</strong><br />
                  Société de droit américain (Delaware C-Corporation)<br />
                  1111B S Governors Ave, Suite 59264<br />
                  Dover, DE 19904<br />
                  États-Unis d&apos;Amérique
                </p>
                <p>
                  <strong>Email général</strong> : contact@getsellia.com<br />
                  <strong>Email confidentialité</strong> : privacy@getsellia.com<br />
                  <strong>DPO</strong> : dpo@getsellia.com
                </p>
              </div>
              <p>
                En tant que Responsable du traitement, Fiable Technologies LLC détermine
                les finalités et les moyens des traitements de Données personnelles
                effectués dans le cadre du Service.
              </p>
              <p>
                Lorsqu&apos;un Vendeur utilise le Service pour exploiter sa boutique, ce
                Vendeur est lui-même Responsable du traitement des Données personnelles
                de ses propres Acheteurs. Fiable agit alors en tant que Sous-traitant pour
                ce périmètre, dans le cadre d&apos;un accord de traitement de données (DPA)
                disponible sur demande.
              </p>
            </section>

            <section id="article-3">
              <h2>Article 3 — Délégué à la protection des données</h2>
              <p>
                Bien que la désignation d&apos;un DPO ne soit pas obligatoire pour Fiable
                Technologies Inc. au regard du RGPD, nous avons fait le choix volontaire
                de désigner un point de contact dédié aux questions de protection des
                données.
              </p>
              <p>
                Le DPO est joignable à l&apos;adresse : <strong>dpo@getsellia.com</strong>
              </p>
              <p>
                Il a notamment pour missions :
              </p>
              <ul>
                <li>De répondre aux demandes des Utilisateurs souhaitant exercer leurs droits</li>
                <li>D&apos;assurer la conformité des traitements aux législations applicables</li>
                <li>De superviser les processus internes de protection des données</li>
                <li>D&apos;être l&apos;interlocuteur privilégié des autorités de contrôle</li>
                <li>De gérer les incidents et violations de données éventuels</li>
              </ul>
            </section>

            <section id="article-4">
              <h2>Article 4 — Catégories de données collectées</h2>
              <p>Nous collectons et traitons les catégories de Données personnelles suivantes, selon votre profil et votre interaction avec le Service :</p>

              <h3>4.1 Données d&apos;identification</h3>
              <ul>
                <li>Nom, prénom</li>
                <li>Adresse email</li>
                <li>Mot de passe (stocké de manière chiffrée et irréversible via algorithme bcrypt ou équivalent)</li>
                <li>Numéro de téléphone (optionnel)</li>
                <li>Date de naissance (uniquement pour vérification d&apos;âge)</li>
                <li>Pays et ville de résidence</li>
                <li>Photo de profil (optionnelle)</li>
              </ul>

              <h3>4.2 Données professionnelles (Vendeurs uniquement)</h3>
              <ul>
                <li>Raison sociale ou nom commercial</li>
                <li>Forme juridique</li>
                <li>Numéro d&apos;immatriculation au registre du commerce (RCCM, NINEA, etc.)</li>
                <li>Numéro d&apos;identification fiscale</li>
                <li>Adresse professionnelle</li>
                <li>Secteur d&apos;activité</li>
                <li>Pièce d&apos;identité du représentant légal (dans le cadre de la procédure KYC)</li>
                <li>Justificatif de domicile professionnel (KYC)</li>
                <li>Documents bancaires (RIB, attestation de compte) pour le versement des produits des ventes</li>
              </ul>

              <h3>4.3 Données de paiement</h3>
              <p>
                <strong>Important : Sellia ne stocke jamais les numéros de cartes
                bancaires complets ni les codes PIN Mobile Money.</strong> Ces données
                sensibles transitent directement et exclusivement par nos partenaires
                certifiés (notamment Afribapay, CinetPay et, à terme, Stripe), tous
                conformes aux normes PCI-DSS Level 1.
              </p>
              <ul>
                <li>4 derniers chiffres de la carte (à titre indicatif uniquement)</li>
                <li>Type de moyen de paiement utilisé</li>
                <li>Numéro de téléphone associé au Mobile Money (chiffré)</li>
                <li>Historique des transactions (montants, dates, statuts)</li>
                <li>Identifiants de transaction internes des partenaires</li>
              </ul>

              <h3>4.4 Données relatives à la boutique (Vendeurs)</h3>
              <ul>
                <li>Nom de la boutique, sous-domaine personnalisé</li>
                <li>Description, charte graphique, logo</li>
                <li>Catalogue de produits (titres, descriptions, photos, prix, stocks)</li>
                <li>Configuration des paiements et de la livraison</li>
                <li>Statistiques de visite et de vente</li>
              </ul>

              <h3>4.5 Données techniques et de connexion</h3>
              <ul>
                <li>Adresse IP</li>
                <li>Type de navigateur et version</li>
                <li>Système d&apos;exploitation</li>
                <li>Identifiant de session</li>
                <li>Identifiant d&apos;appareil (device ID)</li>
                <li>Empreinte de navigateur (browser fingerprint, partielle)</li>
                <li>Date et heure de connexion</li>
                <li>Pages visitées, durée des sessions, parcours de navigation</li>
                <li>Logs serveur (requêtes HTTP, erreurs, événements de sécurité)</li>
              </ul>

              <h3>4.6 Données de communication</h3>
              <ul>
                <li>Échanges avec le support client (emails, chat, tickets)</li>
                <li>Préférences de communication (consentement aux newsletters, notifications push)</li>
                <li>Réponses aux enquêtes de satisfaction</li>
              </ul>

              <h3>4.7 Données de géolocalisation</h3>
              <ul>
                <li>Géolocalisation approximative basée sur l&apos;adresse IP (ville, pays)</li>
                <li>Adresse de livraison renseignée par les Acheteurs</li>
                <li>Coordonnées GPS uniquement avec consentement explicite (jamais activé par défaut)</li>
              </ul>

              <h3>4.8 Données générées par l&apos;intelligence artificielle</h3>
              <ul>
                <li>Prompts saisis par les Vendeurs pour générer leurs boutiques</li>
                <li>Contenus générés (descriptions, structures de pages, suggestions marketing)</li>
                <li>Métriques de qualité et de pertinence des générations</li>
              </ul>

              <p className="legal-note">
                <strong>Données sensibles</strong> : Sellia ne collecte ni ne traite
                volontairement de données dites « sensibles » au sens du RGPD (origine
                raciale ou ethnique, opinions politiques, convictions religieuses,
                appartenance syndicale, données génétiques, biométriques,
                d&apos;orientation sexuelle ou de santé). Si de telles données venaient à
                nous être communiquées involontairement, elles seraient supprimées sans
                délai.
              </p>
            </section>

            <section id="article-5">
              <h2>Article 5 — Sources des données</h2>
              <p>Vos Données personnelles proviennent des sources suivantes :</p>
              <ul>
                <li><strong>Données fournies directement par vous</strong> : lors de votre inscription, de la configuration de votre compte, de l&apos;utilisation des fonctionnalités du Service, ou de vos communications avec notre équipe</li>
                <li><strong>Données collectées automatiquement</strong> : par les technologies de mesure d&apos;audience, les cookies, et les logs serveur lors de votre navigation</li>
                <li><strong>Données fournies par des tiers</strong> : nos partenaires de paiement (statuts de transaction), nos prestataires de vérification d&apos;identité (résultats de KYC), nos services anti-fraude</li>
                <li><strong>Données issues de sources publiques</strong> : registres du commerce, données ouvertes des autorités fiscales, dans le cadre limité de la conformité réglementaire</li>
              </ul>
            </section>

            <section id="article-6">
              <h2>Article 6 — Finalités du traitement</h2>
              <p>Vos Données personnelles sont traitées pour les finalités suivantes :</p>

              <h3>6.1 Fourniture du Service</h3>
              <ul>
                <li>Création et gestion de votre compte Utilisateur</li>
                <li>Génération automatisée de votre boutique en ligne</li>
                <li>Hébergement et affichage de vos boutiques et de leurs contenus</li>
                <li>Traitement des transactions commerciales</li>
                <li>Suivi et reporting de votre activité</li>
                <li>Sauvegarde et continuité du Service</li>
              </ul>

              <h3>6.2 Communication et relation client</h3>
              <ul>
                <li>Réponse à vos demandes via le support</li>
                <li>Envoi de notifications opérationnelles (transactions, sécurité, modifications du Service)</li>
                <li>Envoi d&apos;informations commerciales et marketing, sous réserve de votre consentement préalable et révocable à tout moment</li>
                <li>Réalisation d&apos;enquêtes de satisfaction</li>
              </ul>

              <h3>6.3 Sécurité, fraude et conformité</h3>
              <ul>
                <li>Détection et prévention des fraudes, du blanchiment d&apos;argent, du financement du terrorisme</li>
                <li>Vérification d&apos;identité (procédure KYC obligatoire pour les Vendeurs)</li>
                <li>Surveillance des transactions suspectes</li>
                <li>Sécurisation des accès et des données</li>
                <li>Respect de nos obligations légales et réglementaires (anti-blanchiment, sanctions internationales, fiscalité)</li>
                <li>Réponse aux réquisitions des autorités judiciaires compétentes</li>
              </ul>

              <h3>6.4 Amélioration du Service</h3>
              <ul>
                <li>Analyse de l&apos;usage et des performances du Service</li>
                <li>Identification et correction des bugs</li>
                <li>Développement de nouvelles fonctionnalités</li>
                <li>Optimisation des modèles d&apos;intelligence artificielle</li>
                <li>Tests A/B sur des panels d&apos;Utilisateurs (avec données pseudonymisées)</li>
              </ul>

              <h3>6.5 Obligations comptables et fiscales</h3>
              <ul>
                <li>Établissement des factures et reçus</li>
                <li>Comptabilité d&apos;entreprise</li>
                <li>Déclarations fiscales (TVA, impôts sur les sociétés, retenues à la source applicables)</li>
                <li>Conservation des justificatifs commerciaux selon les durées légales</li>
              </ul>
            </section>

            <section id="article-7">
              <h2>Article 7 — Bases légales du traitement</h2>
              <p>
                Conformément à l&apos;article 6 du RGPD et aux dispositions équivalentes des
                autres législations applicables, chaque traitement repose sur l&apos;une des
                bases légales suivantes :
              </p>

              <h3>7.1 Exécution du contrat (article 6.1.b RGPD)</h3>
              <p>
                Pour fournir le Service auquel vous avez souscrit, gérer votre compte,
                traiter vos transactions et assurer le support client.
              </p>

              <h3>7.2 Consentement (article 6.1.a RGPD)</h3>
              <p>
                Pour les communications marketing, certains cookies non essentiels, et
                tout traitement spécifique nécessitant votre accord explicite. Vous
                pouvez retirer votre consentement à tout moment, sans que cela ne
                remette en cause la licéité des traitements antérieurs.
              </p>

              <h3>7.3 Obligation légale (article 6.1.c RGPD)</h3>
              <p>
                Pour respecter nos obligations comptables, fiscales, anti-blanchiment,
                anti-terrorisme, et de coopération avec les autorités compétentes.
              </p>

              <h3>7.4 Intérêt légitime (article 6.1.f RGPD)</h3>
              <p>
                Pour améliorer le Service, prévenir les fraudes, sécuriser nos
                infrastructures, et défendre nos droits en cas de litige. Cet intérêt
                légitime est mis en balance avec vos droits et libertés fondamentaux.
              </p>

              <h3>7.5 Sauvegarde des intérêts vitaux (article 6.1.d RGPD)</h3>
              <p>
                Dans des cas exceptionnels où le traitement serait nécessaire pour la
                sauvegarde d&apos;intérêts vitaux d&apos;une personne (par exemple, prévention
                d&apos;atteinte grave à la sécurité d&apos;autrui).
              </p>
            </section>

            <section id="article-8">
              <h2>Article 8 — Destinataires des données</h2>
              <p>Vos Données personnelles peuvent être transmises aux destinataires suivants, dans les limites de ce qui est strictement nécessaire :</p>

              <h3>8.1 Personnel de Fiable</h3>
              <p>
                Les équipes internes de Fiable (développement, support, sécurité,
                comptabilité, juridique), soumises à des obligations strictes de
                confidentialité et accédant aux données selon le principe du moindre
                privilège.
              </p>

              <h3>8.2 Sous-traitants</h3>
              <p>
                Nos prestataires techniques (hébergement, paiement, analytics, support)
                listés à l&apos;Article 9 ci-dessous, agissant pour notre compte et selon
                nos instructions.
              </p>

              <h3>8.3 Vendeurs et Acheteurs</h3>
              <p>
                Dans le cadre des relations commerciales nouées via le Service, les
                Données personnelles strictement nécessaires sont transmises à votre
                contrepartie (par exemple, l&apos;adresse de livraison de l&apos;Acheteur est
                transmise au Vendeur pour permettre la livraison).
              </p>

              <h3>8.4 Autorités compétentes</h3>
              <p>
                En cas de demande légale ou judiciaire (réquisition, ordonnance,
                obligation déclarative). Nous évaluons systématiquement la légitimité
                des demandes et nous limitons à la stricte minimum nécessaire.
              </p>

              <h3>8.5 Tiers en cas d&apos;opérations capitalistiques</h3>
              <p>
                En cas de fusion, acquisition, cession partielle ou totale d&apos;activité,
                vos Données personnelles peuvent être transmises au repreneur, sous
                réserve du respect de la présente Politique. Vous serez informé(e) au
                préalable de toute opération substantielle.
              </p>

              <p className="legal-note">
                <strong>Vente de données : NON.</strong> Fiable ne vend, ne loue ni
                n&apos;échange vos Données personnelles à des tiers à des fins commerciales.
                Cette interdiction est inscrite dans nos engagements contractuels et
                applicable sans exception.
              </p>
            </section>

            <section id="article-9">
              <h2>Article 9 — Sous-traitants</h2>
              <p>
                Nous faisons appel à des Sous-traitants soigneusement sélectionnés pour
                fournir certains services. La liste actuelle de nos Sous-traitants
                principaux est la suivante :
              </p>

              <div className="legal-info-block">
                <h4>Hébergement et infrastructure</h4>
                <ul>
                  <li><strong>Hostinger International Ltd.</strong> (Chypre, UE) — hébergement du serveur applicatif principal</li>
                  <li><strong>Cloudflare, Inc.</strong> (Californie, USA) — CDN, DNS, protection DDoS, certificats SSL/TLS</li>
                  <li><strong>GitHub, Inc.</strong> (Californie, USA) — hébergement du code source</li>
                </ul>
              </div>

              <div className="legal-info-block">
                <h4>Paiements (en cours d&apos;intégration)</h4>
                <ul>
                  <li><strong>Afribapay</strong> — agrégateur Mobile Money pour l&apos;Afrique francophone</li>
                  <li><strong>CinetPay</strong> — agrégateur de paiements multi-canaux pour l&apos;Afrique</li>
                  <li><strong>Stripe, Inc.</strong> (à venir) — paiements internationaux par carte</li>
                </ul>
              </div>

              <div className="legal-info-block">
                <h4>Communication transactionnelle</h4>
                <ul>
                  <li><strong>Resend</strong> — envoi d&apos;emails transactionnels</li>
                  <li>Fournisseurs SMS partenaires des opérateurs Mobile Money pour les notifications</li>
                </ul>
              </div>

              <div className="legal-info-block">
                <h4>Intelligence artificielle</h4>
                <ul>
                  <li><strong>Anthropic PBC</strong> — modèles Claude utilisés pour la génération de contenus</li>
                  <li><strong>OpenAI, L.L.C.</strong> — modèles GPT utilisés en complément ou en fallback</li>
                </ul>
              </div>

              <p>
                Tous nos Sous-traitants sont engagés contractuellement à respecter le
                RGPD et les législations équivalentes. Des accords de traitement de
                données (Data Processing Agreements) ont été conclus avec chacun
                d&apos;eux. La liste exhaustive et à jour des Sous-traitants est disponible
                sur demande adressée à <strong>dpo@getsellia.com</strong>.
              </p>
            </section>

            <section id="article-10">
              <h2>Article 10 — Transferts internationaux de données</h2>
              <p>
                Compte tenu de la nature internationale du Service et de l&apos;implantation
                de Fiable Technologies LLC aux États-Unis, vos Données personnelles
                peuvent être transférées en dehors de votre pays de résidence,
                notamment :
              </p>
              <ul>
                <li>Vers les <strong>États-Unis</strong> (siège de Fiable, Cloudflare, GitHub, Stripe, Anthropic, OpenAI)</li>
                <li>Vers <strong>l&apos;Union Européenne</strong> (Hostinger en Chypre)</li>
                <li>Vers <strong>l&apos;Afrique</strong> (Afribapay, CinetPay)</li>
              </ul>

              <h3>10.1 Garanties applicables</h3>
              <p>
                Pour encadrer ces transferts internationaux, nous mettons en œuvre les
                garanties prévues par le RGPD :
              </p>
              <ul>
                <li><strong>Décisions d&apos;adéquation</strong> de la Commission européenne, lorsqu&apos;applicables</li>
                <li><strong>Clauses Contractuelles Types</strong> (CCT) approuvées par la Commission européenne, version 2021</li>
                <li><strong>Évaluation des risques liés aux transferts</strong> (Transfer Impact Assessment) pour les pays sans décision d&apos;adéquation</li>
                <li><strong>Mesures techniques complémentaires</strong> : chiffrement de bout en bout, pseudonymisation, contrôles d&apos;accès stricts</li>
                <li><strong>Cadre Data Privacy Framework</strong> UE-USA, lorsque applicable au prestataire concerné</li>
              </ul>

              <h3>10.2 Vos droits face aux transferts</h3>
              <p>
                Vous pouvez à tout moment obtenir une copie des garanties mises en
                place pour un transfert spécifique en contactant notre DPO à <strong>dpo@getsellia.com</strong>.
              </p>
            </section>

            <section id="article-11">
              <h2>Article 11 — Durées de conservation</h2>
              <p>Nous conservons vos Données personnelles pendant les durées strictement nécessaires aux finalités pour lesquelles elles ont été collectées :</p>

              <table className="legal-table">
                <thead>
                  <tr><th>Catégorie</th><th>Durée de conservation</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Données de compte actif</td>
                    <td>Pendant toute la durée d&apos;utilisation du Service</td>
                  </tr>
                  <tr>
                    <td>Données après suppression de compte</td>
                    <td>30 jours (sauvegarde) puis suppression définitive</td>
                  </tr>
                  <tr>
                    <td>Documents KYC (Vendeurs)</td>
                    <td>5 ans après la fin de la relation contractuelle (obligation anti-blanchiment)</td>
                  </tr>
                  <tr>
                    <td>Données de facturation</td>
                    <td>10 ans (obligations comptables et fiscales)</td>
                  </tr>
                  <tr>
                    <td>Données de transactions</td>
                    <td>10 ans (obligations comptables)</td>
                  </tr>
                  <tr>
                    <td>Logs techniques de sécurité</td>
                    <td>12 mois maximum</td>
                  </tr>
                  <tr>
                    <td>Logs analytiques</td>
                    <td>13 mois maximum</td>
                  </tr>
                  <tr>
                    <td>Cookies de mesure d&apos;audience</td>
                    <td>13 mois maximum</td>
                  </tr>
                  <tr>
                    <td>Données de prospects (sans inscription)</td>
                    <td>3 ans à compter du dernier contact</td>
                  </tr>
                  <tr>
                    <td>Communications support</td>
                    <td>5 ans après clôture du dernier ticket</td>
                  </tr>
                </tbody>
              </table>

              <p>
                Au-delà de ces durées, les données sont soit supprimées de manière
                irréversible, soit anonymisées (rendues impossibles à rattacher à une
                personne identifiable) à des fins statistiques.
              </p>
            </section>

            <section id="article-12">
              <h2>Article 12 — Sécurité des données</h2>
              <p>
                Nous mettons en œuvre des mesures techniques et organisationnelles
                appropriées pour garantir la sécurité, l&apos;intégrité et la
                confidentialité de vos Données personnelles, conformément à l&apos;article
                32 du RGPD.
              </p>

              <h3>12.1 Mesures techniques</h3>
              <ul>
                <li>Chiffrement HTTPS via TLS 1.3 pour toutes les communications avec le Service</li>
                <li>Chiffrement AES-256 des données sensibles au repos</li>
                <li>Hashage cryptographique des mots de passe (bcrypt avec coût élevé)</li>
                <li>Protection DDoS et pare-feu applicatif (WAF) via Cloudflare</li>
                <li>Sauvegardes quotidiennes chiffrées avec rétention de 30 jours</li>
                <li>Surveillance temps réel des intrusions et anomalies</li>
                <li>Mises à jour régulières des dépendances logicielles (gestion des CVE)</li>
                <li>Tests de pénétration et audits de sécurité périodiques</li>
                <li>Authentification renforcée (mots de passe forts, à terme 2FA)</li>
                <li>Isolation des environnements de production, staging et développement</li>
              </ul>

              <h3>12.2 Mesures organisationnelles</h3>
              <ul>
                <li>Charte de sécurité informatique signée par tous les collaborateurs</li>
                <li>Formation régulière des équipes aux bonnes pratiques de sécurité</li>
                <li>Politique d&apos;accès aux données fondée sur le principe du moindre privilège</li>
                <li>Engagements de confidentialité dans tous les contrats</li>
                <li>Plan de continuité et de reprise d&apos;activité (PRA/PCA)</li>
                <li>Procédure documentée de gestion des incidents de sécurité</li>
                <li>Registre des activités de traitement maintenu à jour</li>
                <li>Évaluations d&apos;impact sur la protection des données (DPIA) lorsque requis</li>
              </ul>
            </section>

            <section id="article-13">
              <h2>Article 13 — Vos droits</h2>
              <p>
                En application du RGPD et des législations équivalentes, vous disposez
                des droits suivants concernant vos Données personnelles :
              </p>

              <h3>13.1 Droit d&apos;accès (article 15 RGPD)</h3>
              <p>
                Vous pouvez obtenir confirmation que vos Données sont traitées et, le
                cas échéant, en obtenir une copie ainsi que des informations sur les
                finalités, catégories, destinataires, durées de conservation, et
                origines de ces données.
              </p>

              <h3>13.2 Droit de rectification (article 16 RGPD)</h3>
              <p>
                Vous pouvez demander la correction de Données inexactes ou la
                complétion de Données incomplètes vous concernant.
              </p>

              <h3>13.3 Droit à l&apos;effacement / droit à l&apos;oubli (article 17 RGPD)</h3>
              <p>
                Vous pouvez demander la suppression de vos Données dans certains cas
                (données qui ne sont plus nécessaires, retrait du consentement,
                opposition au traitement, traitement illicite, obligation légale,
                etc.). Ce droit n&apos;est pas absolu et peut être limité par nos
                obligations légales (par exemple, conservation comptable obligatoire).
              </p>

              <h3>13.4 Droit à la limitation du traitement (article 18 RGPD)</h3>
              <p>
                Vous pouvez demander la suspension temporaire d&apos;un traitement, par
                exemple en cas de contestation de l&apos;exactitude des données ou
                d&apos;opposition à un traitement.
              </p>

              <h3>13.5 Droit à la portabilité (article 20 RGPD)</h3>
              <p>
                Vous pouvez recevoir vos Données dans un format structuré, couramment
                utilisé et lisible par machine (par exemple : JSON, CSV), et les
                transmettre à un autre responsable du traitement.
              </p>

              <h3>13.6 Droit d&apos;opposition (article 21 RGPD)</h3>
              <p>
                Vous pouvez vous opposer, à tout moment, à un traitement fondé sur
                notre intérêt légitime ou sur une mission d&apos;intérêt public. Pour les
                traitements de prospection commerciale, vous pouvez vous opposer sans
                avoir à motiver votre demande.
              </p>

              <h3>13.7 Droit de retirer votre consentement</h3>
              <p>
                Lorsque le traitement repose sur votre consentement, vous pouvez le
                retirer à tout moment. Le retrait du consentement ne remet pas en cause
                la licéité des traitements effectués antérieurement.
              </p>

              <h3>13.8 Droit de définir des directives post-mortem</h3>
              <p>
                Vous pouvez définir des directives sur le sort de vos Données après
                votre décès. Ces directives peuvent être enregistrées auprès d&apos;un tiers
                certifié, et nous nous engageons à les respecter dans la mesure de nos
                moyens techniques.
              </p>

              <h3>13.9 Droit d&apos;introduire une réclamation</h3>
              <p>
                Vous pouvez introduire une réclamation auprès d&apos;une autorité de
                contrôle compétente :
              </p>
              <ul>
                <li>En France : <strong>Commission Nationale de l&apos;Informatique et des Libertés (CNIL)</strong> — www.cnil.fr</li>
                <li>Au Sénégal : <strong>Commission de Protection des Données Personnelles (CDP)</strong> — www.cdp.sn</li>
                <li>Au Cameroun : <strong>Agence Nationale des TIC (ANTIC)</strong> — www.antic.cm</li>
                <li>En Côte d&apos;Ivoire : <strong>Autorité de Régulation des Télécommunications (ARTCI)</strong></li>
                <li>Aux États-Unis (résidents Californie) : <strong>California Attorney General</strong></li>
                <li>Autres juridictions : auprès de l&apos;autorité compétente de votre lieu de résidence</li>
              </ul>
            </section>

            <section id="article-14">
              <h2>Article 14 — Exercice de vos droits</h2>
              <p>
                Pour exercer vos droits, vous pouvez nous contacter par les moyens
                suivants :
              </p>

              <h3>14.1 Modalités</h3>
              <ul>
                <li><strong>Email</strong> : <strong>dpo@getsellia.com</strong> (méthode privilégiée)</li>
                <li><strong>Courrier postal</strong> : Fiable Technologies LLC, Attn: Data Protection Officer, 1111B S Governors Ave, Suite 59264, Dover, DE 19904, États-Unis</li>
                <li><strong>Depuis votre compte</strong> : section « Confidentialité » des paramètres (lorsque la fonctionnalité sera disponible)</li>
              </ul>

              <h3>14.2 Vérification d&apos;identité</h3>
              <p>
                Pour des raisons de sécurité, nous pouvons vous demander de prouver
                votre identité avant de répondre à votre demande. Cela peut inclure la
                fourniture d&apos;une copie d&apos;une pièce d&apos;identité, dont nous ne
                conservons que le temps nécessaire à la vérification.
              </p>

              <h3>14.3 Délais de réponse</h3>
              <p>
                Nous répondons à vos demandes dans un délai d&apos;un (1) mois à compter de
                leur réception. Ce délai peut être prolongé de deux (2) mois en cas de
                complexité ou de volume important de demandes, auquel cas nous vous en
                informerons.
              </p>

              <h3>14.4 Gratuité</h3>
              <p>
                L&apos;exercice de vos droits est gratuit. Toutefois, en cas de demandes
                manifestement infondées ou excessives (notamment du fait de leur
                caractère répétitif), nous pouvons exiger des frais raisonnables ou
                refuser de donner suite, en justifiant notre décision.
              </p>
            </section>

            <section id="article-15">
              <h2>Article 15 — Mineurs</h2>
              <p>
                Le Service Sellia est exclusivement destiné aux personnes ayant atteint
                l&apos;âge légal de la majorité dans leur pays de résidence (généralement 18
                ans) et disposant de la pleine capacité juridique pour conclure des
                contrats commerciaux.
              </p>
              <p>
                Nous ne collectons pas sciemment de Données personnelles concernant des
                mineurs. Si nous découvrons qu&apos;un mineur nous a fourni des Données
                sans le consentement de ses parents ou tuteurs légaux, nous prendrons
                immédiatement les mesures pour supprimer ces données.
              </p>
              <p>
                Si vous êtes parent ou tuteur et pensez qu&apos;un mineur dont vous avez la
                charge a accédé au Service, contactez-nous immédiatement à <strong>dpo@getsellia.com</strong>.
              </p>
            </section>

            <section id="article-16">
              <h2>Article 16 — Profilage et décision automatisée</h2>
              <p>
                Le Service utilise certains traitements automatisés, notamment :
              </p>
              <ul>
                <li>Détection automatique de fraude sur les transactions (analyse de patterns suspects)</li>
                <li>Génération automatisée de boutiques par intelligence artificielle</li>
                <li>Recommandations personnalisées (suggestions de produits, optimisations marketing)</li>
                <li>Analyse de l&apos;usage à des fins d&apos;amélioration du Service</li>
              </ul>
              <p>
                Aucune décision produisant des effets juridiques ou affectant
                significativement les Utilisateurs n&apos;est prise de manière entièrement
                automatisée sans intervention humaine. En cas de blocage automatique
                pour suspicion de fraude, une revue humaine est systématiquement
                déclenchée avant toute décision définitive.
              </p>
              <p>
                Vous disposez du droit de demander une intervention humaine, d&apos;exprimer
                votre point de vue, et de contester toute décision produisant des
                effets significatifs vous concernant. Pour exercer ce droit, contactez <strong>dpo@getsellia.com</strong>.
              </p>
            </section>

            <section id="article-17">
              <h2>Article 17 — Violations de données</h2>
              <p>
                En cas de violation de Données personnelles susceptible d&apos;engendrer un
                risque pour vos droits et libertés, nous nous engageons à :
              </p>
              <ul>
                <li>Notifier l&apos;autorité de contrôle compétente dans les 72 heures suivant la prise de connaissance de la violation, conformément à l&apos;article 33 du RGPD</li>
                <li>Vous informer sans délai injustifié, par email à l&apos;adresse renseignée dans votre compte, lorsque la violation est susceptible d&apos;engendrer un risque élevé pour vos droits et libertés (article 34 RGPD)</li>
                <li>Documenter chaque violation, son contexte, ses effets et les mesures prises</li>
                <li>Mettre en œuvre les mesures correctrices appropriées</li>
                <li>Coopérer pleinement avec les autorités compétentes</li>
              </ul>
            </section>

            <section id="article-18">
              <h2>Article 18 — Modifications de la politique</h2>
              <p>
                Cette Politique peut être modifiée pour s&apos;adapter aux évolutions
                législatives, réglementaires, jurisprudentielles ou techniques.
              </p>
              <p>
                En cas de modification substantielle, nous vous en informerons :
              </p>
              <ul>
                <li>Par notification visible sur le Service pendant au moins 30 jours</li>
                <li>Par courrier électronique à l&apos;adresse renseignée dans votre compte</li>
                <li>Par mise à jour de la version et de la date en tête du présent document</li>
              </ul>
              <p>
                Lorsque la modification affecte un traitement reposant sur votre
                consentement, nous solliciterons à nouveau votre consentement explicite
                avant de poursuivre le traitement modifié.
              </p>
              <p>
                L&apos;historique des versions est disponible sur demande à <strong>dpo@getsellia.com</strong>.
              </p>
            </section>

            <section id="article-19">
              <h2>Article 19 — Contact et réclamations</h2>
              <p>Pour toute question, demande, ou réclamation relative à la présente Politique :</p>
              <div className="legal-info-block">
                <p>
                  <strong>Contact général</strong> : contact@getsellia.com<br />
                  <strong>Service confidentialité</strong> : privacy@getsellia.com<br />
                  <strong>Délégué à la Protection des Données</strong> : dpo@getsellia.com<br />
                  <strong>Signalement de violation de données</strong> : security@getsellia.com
                </p>
                <p>
                  <strong>Adresse postale</strong> :<br />
                  Fiable Technologies LLC<br />
                  Attn: Data Protection Officer<br />
                  1111B S Governors Ave, Suite 59264<br />
                  Dover, DE 19904<br />
                  États-Unis d&apos;Amérique
                </p>
              </div>
              <p>
                Nous nous engageons à répondre à toutes vos demandes avec diligence et
                transparence.
              </p>
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
