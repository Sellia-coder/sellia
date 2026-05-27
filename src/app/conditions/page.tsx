import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description: "Conditions générales d'utilisation du service Sellia, opéré par Fiable Technologies LLC",
  robots: { index: false, follow: false },
};

export default function Conditions() {
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
            <h1 className="legal-title">Conditions générales <em>d&apos;utilisation</em></h1>
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

          <div className="legal-toc">
            <h3>Sommaire</h3>
            <ol>
              <li><a href="#article-1">Définitions</a></li>
              <li><a href="#article-2">Objet et acceptation</a></li>
              <li><a href="#article-3">Description du service</a></li>
              <li><a href="#article-4">Conditions d&apos;accès et inscription</a></li>
              <li><a href="#article-5">Compte utilisateur et sécurité</a></li>
              <li><a href="#article-6">Vérification d&apos;identité (KYC)</a></li>
              <li><a href="#article-7">Obligations des utilisateurs</a></li>
              <li><a href="#article-8">Contenus interdits et activités prohibées</a></li>
              <li><a href="#article-9">Conditions applicables aux vendeurs</a></li>
              <li><a href="#article-10">Conditions applicables aux acheteurs</a></li>
              <li><a href="#article-11">Tarifs et modalités de paiement</a></li>
              <li><a href="#article-12">Commissions sur ventes</a></li>
              <li><a href="#article-13">Versement des produits des ventes</a></li>
              <li><a href="#article-14">Droit de rétractation et remboursements</a></li>
              <li><a href="#article-15">Propriété intellectuelle</a></li>
              <li><a href="#article-16">Données personnelles</a></li>
              <li><a href="#article-17">Disponibilité du service</a></li>
              <li><a href="#article-18">Limitation de responsabilité</a></li>
              <li><a href="#article-19">Suspension et résiliation</a></li>
              <li><a href="#article-20">Modification des CGU</a></li>
              <li><a href="#article-21">Force majeure</a></li>
              <li><a href="#article-22">Loi applicable et juridiction</a></li>
              <li><a href="#article-23">Dispositions diverses</a></li>
              <li><a href="#article-24">Contact</a></li>
            </ol>
          </div>

          <div className="legal-content">
            <section className="legal-preamble">
              <h2>Préambule</h2>
              <p>
                Les présentes Conditions Générales d&apos;Utilisation (ci-après les « <strong>CGU</strong> ») constituent un contrat juridiquement contraignant entre :
              </p>
              <p>
                <strong>Fiable Technologies LLC</strong>, société de droit américain immatriculée dans l&apos;État du Delaware, dont le siège social est sis 1111B S Governors Ave, Suite 59264, Dover, DE 19904, États-Unis d&apos;Amérique (ci-après « <strong>Fiable</strong> » ou « <strong>nous</strong> »),
              </p>
              <p>
                d&apos;une part, et
              </p>
              <p>
                toute personne physique ou morale qui accède au service Sellia, accessible à l&apos;adresse <strong>https://getsellia.com</strong> (ci-après « <strong>l&apos;Utilisateur</strong> » ou « <strong>vous</strong> »),
              </p>
              <p>
                d&apos;autre part.
              </p>
              <p>
                Les CGU régissent l&apos;ensemble des relations entre Fiable et l&apos;Utilisateur dans le cadre de l&apos;utilisation du service Sellia. L&apos;accès et l&apos;utilisation du Service impliquent l&apos;acceptation pleine, entière et sans réserve des présentes CGU.
              </p>
              <p>
                Si vous n&apos;acceptez pas les présentes CGU, vous devez vous abstenir d&apos;utiliser le Service.
              </p>
            </section>

            <section id="article-1">
              <h2>Article 1 — Définitions</h2>
              <p>Aux fins des présentes CGU, les termes suivants ont la signification ci-après :</p>
              <ul>
                <li><strong>« Service » ou « Sellia »</strong> : la plateforme SaaS accessible à <strong>https://getsellia.com</strong> et ses sous-domaines, permettant la création et la gestion de boutiques en ligne assistée par intelligence artificielle.</li>
                <li><strong>« Boutique »</strong> : site marchand généré et hébergé via Sellia pour le compte d&apos;un Vendeur, accessible via un sous-domaine personnalisé (par exemple : maboutique.getsellia.com) ou un nom de domaine propre.</li>
                <li><strong>« Compte »</strong> : espace personnel sécurisé créé par l&apos;Utilisateur sur le Service pour accéder aux fonctionnalités.</li>
                <li><strong>« Vendeur »</strong> : Utilisateur, personne physique ou morale, qui crée et exploite une Boutique via le Service pour commercialiser ses produits ou services.</li>
                <li><strong>« Acheteur »</strong> : Utilisateur qui visite ou effectue des achats sur une Boutique générée via le Service.</li>
                <li><strong>« Contenu »</strong> : tout élément (texte, image, vidéo, son, code, donnée) publié, téléchargé ou créé via le Service.</li>
                <li><strong>« Contenu Utilisateur »</strong> : Contenu créé ou téléchargé par l&apos;Utilisateur (notamment : descriptions de produits, photos, textes marketing).</li>
                <li><strong>« Plan »</strong> : formule tarifaire à laquelle l&apos;Utilisateur souscrit (Free, Starter, Pro, Business).</li>
                <li><strong>« Commission »</strong> : pourcentage prélevé par Fiable sur chaque vente effectuée via une Boutique, dont le taux dépend du Plan choisi.</li>
                <li><strong>« KYC »</strong> : « Know Your Customer », procédure de vérification d&apos;identité obligatoire pour les Vendeurs.</li>
                <li><strong>« Force Majeure »</strong> : tout événement extérieur, imprévisible et irrésistible empêchant l&apos;exécution normale des obligations contractuelles.</li>
              </ul>
            </section>

            <section id="article-2">
              <h2>Article 2 — Objet et acceptation</h2>

              <h3>2.1 Objet</h3>
              <p>
                Les présentes CGU ont pour objet de définir les conditions dans
                lesquelles Fiable met le Service à disposition de l&apos;Utilisateur, ainsi
                que les droits et obligations réciproques des parties.
              </p>

              <h3>2.2 Acceptation</h3>
              <p>
                L&apos;acceptation des CGU est matérialisée par :
              </p>
              <ul>
                <li>La case à cocher lors de la création d&apos;un Compte (« J&apos;ai lu et j&apos;accepte les Conditions Générales d&apos;Utilisation »)</li>
                <li>L&apos;utilisation effective du Service</li>
                <li>La conclusion de toute transaction via le Service</li>
              </ul>
              <p>
                Cette acceptation vaut signature électronique au sens des législations
                applicables (notamment le Règlement (UE) n° 910/2014 dit « eIDAS » et le
                U.S. Electronic Signatures in Global and National Commerce Act).
              </p>

              <h3>2.3 Capacité juridique</h3>
              <p>
                L&apos;Utilisateur déclare et garantit :
              </p>
              <ul>
                <li>Avoir atteint l&apos;âge légal de la majorité dans son pays de résidence (généralement 18 ans)</li>
                <li>Disposer de la pleine capacité juridique pour conclure des contrats</li>
                <li>Si Utilisateur agit pour le compte d&apos;une personne morale, disposer du pouvoir de représentation nécessaire</li>
              </ul>

              <h3>2.4 Contrat global</h3>
              <p>
                Les CGU forment, avec les <Link href="/mentions-legales" className="legal-link">Mentions Légales</Link>, la <Link href="/confidentialite" className="legal-link">Politique de Confidentialité</Link> et la <Link href="/cookies" className="legal-link">Politique de Cookies</Link>, l&apos;intégralité de l&apos;accord entre les parties relativement à l&apos;objet du Service.
              </p>
            </section>

            <section id="article-3">
              <h2>Article 3 — Description du service</h2>

              <h3>3.1 Présentation</h3>
              <p>
                Sellia est une plateforme SaaS qui permet aux Vendeurs de créer
                automatiquement une Boutique en ligne complète à partir d&apos;une simple
                description textuelle de leur activité, sans compétences techniques
                requises.
              </p>

              <h3>3.2 Fonctionnalités principales</h3>
              <ul>
                <li>Génération automatisée de Boutique par intelligence artificielle</li>
                <li>Gestion du catalogue de produits ou services</li>
                <li>Intégration de moyens de paiement multiples (Mobile Money, cartes bancaires)</li>
                <li>Configuration de la livraison locale et internationale</li>
                <li>Outils marketing (descriptions optimisées, intégrations réseaux sociaux)</li>
                <li>Tableau de bord analytique</li>
                <li>Espace membre et abonnements (Plans Pro et Business)</li>
                <li>Support client multi-canal</li>
              </ul>

              <h3>3.3 Statut bêta privée</h3>
              <p>
                À la date de publication des présentes, le Service est proposé en bêta
                privée sur invitation. Certaines fonctionnalités peuvent être
                progressivement activées. Les éventuelles limitations sont communiquées
                via le Service ou par email.
              </p>
              <p>
                Pendant la phase bêta, Fiable se réserve le droit d&apos;ajuster les
                fonctionnalités, les tarifs et les modalités du Service, dans le
                respect des conditions de modification prévues à l&apos;Article 20.
              </p>

              <h3>3.4 Évolutivité</h3>
              <p>
                Le Service est évolutif. Fiable peut ajouter, modifier ou supprimer des
                fonctionnalités à tout moment, dans une logique d&apos;amélioration
                continue. Les modifications majeures font l&apos;objet d&apos;une communication
                préalable.
              </p>
            </section>

            <section id="article-4">
              <h2>Article 4 — Conditions d&apos;accès et inscription</h2>

              <h3>4.1 Conditions techniques</h3>
              <p>
                L&apos;accès au Service nécessite :
              </p>
              <ul>
                <li>Un appareil connecté à Internet (ordinateur, smartphone, tablette)</li>
                <li>Un navigateur web récent (Chrome, Firefox, Safari, Edge dans leurs versions actuelles ou des deux versions précédentes)</li>
                <li>L&apos;activation de JavaScript et des cookies essentiels</li>
                <li>Une connexion Internet stable</li>
              </ul>
              <p>
                L&apos;Utilisateur est seul responsable de son équipement et de sa connexion
                Internet.
              </p>

              <h3>4.2 Création de compte</h3>
              <p>
                L&apos;utilisation des fonctionnalités du Service nécessite la création
                d&apos;un Compte. Lors de l&apos;inscription, l&apos;Utilisateur s&apos;engage à fournir
                des informations exactes, à jour et complètes.
              </p>

              <h3>4.3 Refus d&apos;inscription</h3>
              <p>
                Fiable se réserve le droit de refuser ou suspendre toute inscription,
                sans avoir à justifier sa décision, notamment si :
              </p>
              <ul>
                <li>Les informations fournies sont incomplètes, inexactes ou frauduleuses</li>
                <li>L&apos;Utilisateur a fait l&apos;objet d&apos;une précédente résiliation pour manquement</li>
                <li>L&apos;activité envisagée est incompatible avec les CGU ou la loi</li>
                <li>L&apos;Utilisateur figure sur des listes de sanctions internationales (OFAC, UE, ONU)</li>
              </ul>
            </section>

            <section id="article-5">
              <h2>Article 5 — Compte utilisateur et sécurité</h2>

              <h3>5.1 Identifiants</h3>
              <p>
                L&apos;Utilisateur choisit un identifiant (adresse email) et un mot de passe
                strictement personnels et confidentiels. Le mot de passe doit respecter
                les exigences minimales de sécurité communiquées (longueur, complexité).
              </p>

              <h3>5.2 Confidentialité</h3>
              <p>
                L&apos;Utilisateur s&apos;engage à :
              </p>
              <ul>
                <li>Maintenir la confidentialité de ses identifiants</li>
                <li>Ne jamais les partager avec un tiers</li>
                <li>Utiliser des mots de passe robustes et uniques</li>
                <li>Activer l&apos;authentification à deux facteurs lorsqu&apos;elle sera disponible</li>
                <li>Notifier immédiatement Fiable en cas de soupçon d&apos;utilisation non autorisée du Compte</li>
              </ul>

              <h3>5.3 Responsabilité</h3>
              <p>
                L&apos;Utilisateur est seul responsable de toutes les actions effectuées
                depuis son Compte, qu&apos;elles soient de son fait ou non. Fiable ne saurait
                être tenu responsable des conséquences résultant d&apos;une utilisation
                frauduleuse du Compte par un tiers.
              </p>

              <h3>5.4 Comptes multiples</h3>
              <p>
                Sauf accord exprès de Fiable, chaque Utilisateur ne peut créer qu&apos;un
                seul Compte. La création de multiples comptes pour contourner les
                limitations du Service ou les présentes CGU peut entraîner la
                résiliation immédiate de tous les comptes concernés.
              </p>
            </section>

            <section id="article-6">
              <h2>Article 6 — Vérification d&apos;identité (KYC)</h2>

              <h3>6.1 Obligation KYC</h3>
              <p>
                Conformément aux obligations anti-blanchiment et anti-financement du
                terrorisme applicables aux services de paiement, tous les Vendeurs
                doivent compléter une procédure de vérification d&apos;identité (KYC)
                avant de pouvoir recevoir les produits de leurs ventes.
              </p>

              <h3>6.2 Documents requis</h3>
              <p>Pour les personnes physiques :</p>
              <ul>
                <li>Pièce d&apos;identité officielle en cours de validité (CNI, passeport)</li>
                <li>Justificatif de domicile de moins de 3 mois</li>
                <li>Selfie ou vérification vidéo</li>
              </ul>
              <p>Pour les personnes morales :</p>
              <ul>
                <li>Extrait de registre du commerce de moins de 3 mois</li>
                <li>Statuts à jour</li>
                <li>Pièce d&apos;identité du représentant légal</li>
                <li>Justificatif d&apos;adresse du siège</li>
                <li>Liste des bénéficiaires effectifs détenant plus de 25%</li>
              </ul>

              <h3>6.3 Délais et conséquences</h3>
              <p>
                Tant que la procédure KYC n&apos;est pas validée, le Vendeur peut utiliser
                le Service mais ne peut pas recevoir de versement. En cas d&apos;échec de
                la procédure ou de fourniture de documents falsifiés, le Compte sera
                immédiatement suspendu.
              </p>

              <h3>6.4 Mise à jour</h3>
              <p>
                L&apos;Utilisateur s&apos;engage à informer Fiable de tout changement substantiel
                de sa situation (changement de représentant légal, modification des
                statuts, transfert de siège) et à fournir les justificatifs actualisés
                sur demande.
              </p>
            </section>

            <section id="article-7">
              <h2>Article 7 — Obligations des utilisateurs</h2>
              <p>L&apos;Utilisateur s&apos;engage à :</p>
              <ul>
                <li>Respecter les présentes CGU et les autres documents contractuels</li>
                <li>Respecter les lois et règlements en vigueur dans son pays de résidence et dans les pays où il exerce son activité commerciale</li>
                <li>Respecter les droits des tiers (propriété intellectuelle, vie privée, droit à l&apos;image)</li>
                <li>Ne pas porter atteinte au bon fonctionnement du Service</li>
                <li>Ne pas tenter de contourner les mesures de sécurité ou les limitations techniques</li>
                <li>Coopérer de bonne foi avec Fiable en cas de demande relative au Compte ou à l&apos;activité</li>
                <li>S&apos;acquitter des sommes dues selon le Plan choisi</li>
                <li>Maintenir à jour les informations de son Compte</li>
              </ul>
            </section>

            <section id="article-8">
              <h2>Article 8 — Contenus interdits et activités prohibées</h2>

              <h3>8.1 Principes</h3>
              <p>
                Le Service ne peut être utilisé pour des activités illégales,
                contraires aux bonnes mœurs, ou portant atteinte aux droits des tiers.
              </p>

              <h3>8.2 Contenus interdits</h3>
              <p>Sont strictement interdits, sans que cette liste soit exhaustive :</p>
              <ul>
                <li>Contenus à caractère pédopornographique, pornographique non-consenti, ou portant atteinte à la dignité humaine</li>
                <li>Contenus haineux, racistes, discriminatoires, ou incitant à la violence</li>
                <li>Contenus diffamatoires ou portant atteinte à l&apos;honneur d&apos;une personne</li>
                <li>Contenus contrefaisants (violation de droits d&apos;auteur, marques, dessins et modèles)</li>
                <li>Contenus glorifiant le terrorisme ou les organisations criminelles</li>
                <li>Contenus mensongers, trompeurs ou frauduleux</li>
                <li>Photos ou identités de personnes utilisées sans leur consentement</li>
              </ul>

              <h3>8.3 Activités prohibées</h3>
              <p>L&apos;Utilisateur s&apos;interdit notamment de :</p>
              <ul>
                <li>Vendre des produits ou services illégaux dans son pays ou les pays de ses clients (drogues, armes, médicaments sous prescription, espèces protégées, etc.)</li>
                <li>Vendre des produits dangereux ou non conformes aux normes</li>
                <li>Pratiquer le blanchiment d&apos;argent ou financer des activités illicites</li>
                <li>Pratiquer des escroqueries ou ventes pyramidales</li>
                <li>Usurper l&apos;identité d&apos;une autre personne ou organisation</li>
                <li>Utiliser le Service à des fins de harcèlement</li>
                <li>Tenter de pirater, scraper massivement, ou effectuer du reverse engineering du Service</li>
                <li>Envoyer du spam ou des communications non sollicitées en masse</li>
                <li>Diffuser des virus, malwares ou code malveillant</li>
                <li>Contourner les commissions ou utiliser le Service pour effectuer des transactions hors-plateforme dans le but de frauder Fiable</li>
              </ul>

              <h3>8.4 Sanctions</h3>
              <p>
                Toute violation des présentes dispositions peut entraîner :
              </p>
              <ul>
                <li>Le retrait immédiat du Contenu litigieux</li>
                <li>La suspension ou la résiliation du Compte sans préavis</li>
                <li>Le signalement aux autorités compétentes le cas échéant</li>
                <li>Des poursuites judiciaires en cas de préjudice subi par Fiable ou des tiers</li>
                <li>La rétention des sommes dues, le cas échéant, pour couvrir les préjudices et frais engagés</li>
              </ul>
            </section>

            <section id="article-9">
              <h2>Article 9 — Conditions applicables aux vendeurs</h2>

              <h3>9.1 Statut</h3>
              <p>
                Le Vendeur exerce son activité commerciale en qualité d&apos;entrepreneur
                indépendant, en son nom et pour son propre compte. Il n&apos;existe aucun
                lien de subordination, de mandat, de partenariat formel ou de société
                entre Fiable et le Vendeur.
              </p>

              <h3>9.2 Obligations du vendeur</h3>
              <p>Le Vendeur s&apos;engage à :</p>
              <ul>
                <li>Disposer de tous les droits, autorisations et licences nécessaires pour exercer son activité</li>
                <li>Respecter les obligations fiscales, sociales et comptables applicables dans son pays</li>
                <li>Fournir aux Acheteurs des informations exactes sur ses produits ou services (description, prix, frais de livraison, modalités)</li>
                <li>Honorer les commandes reçues dans les délais annoncés</li>
                <li>Assurer le service après-vente et le traitement des réclamations</li>
                <li>Respecter le droit de rétractation des Acheteurs lorsqu&apos;applicable</li>
                <li>Établir et conserver les factures conformément à la législation applicable</li>
                <li>Souscrire les assurances nécessaires (notamment responsabilité civile professionnelle)</li>
              </ul>

              <h3>9.3 Responsabilité commerciale</h3>
              <p>
                Le Vendeur est seul responsable de la relation commerciale avec ses
                Acheteurs. Fiable n&apos;intervient pas dans les transactions et ne saurait
                être considéré comme partie au contrat de vente conclu entre le Vendeur
                et l&apos;Acheteur.
              </p>
            </section>

            <section id="article-10">
              <h2>Article 10 — Conditions applicables aux acheteurs</h2>

              <h3>10.1 Statut</h3>
              <p>
                L&apos;Acheteur conclut le contrat de vente directement avec le Vendeur.
                Fiable agit uniquement en tant qu&apos;intermédiaire technique fournissant
                la plateforme.
              </p>

              <h3>10.2 Obligations de l&apos;acheteur</h3>
              <p>L&apos;Acheteur s&apos;engage à :</p>
              <ul>
                <li>Fournir des informations exactes lors de ses commandes</li>
                <li>Régler le prix des produits ou services commandés</li>
                <li>Respecter les conditions générales de vente du Vendeur</li>
                <li>Ne pas effectuer de commandes frauduleuses ou trompeuses</li>
              </ul>

              <h3>10.3 Litiges acheteur-vendeur</h3>
              <p>
                En cas de litige avec un Vendeur, l&apos;Acheteur s&apos;engage à tenter une
                résolution amiable directement avec lui. Fiable peut, à titre purement
                facultatif, faciliter la médiation entre les parties, sans pour autant
                que cela constitue une obligation contractuelle.
              </p>
            </section>

            <section id="article-11">
              <h2>Article 11 — Tarifs et modalités de paiement</h2>

              <h3>11.1 Plans tarifaires</h3>
              <p>
                Le Service est proposé selon plusieurs Plans, dont les caractéristiques
                et tarifs sont détaillés sur la page <Link href="/#tarifs" className="legal-link">Tarifs</Link> :
              </p>
              <ul>
                <li><strong>Plan Free</strong> : 0 FCFA/mois, sans engagement, avec commission de 4% sur les ventes</li>
                <li><strong>Plan Starter</strong> : 9 900 FCFA/mois</li>
                <li><strong>Plan Pro</strong> : 29 900 FCFA/mois</li>
                <li><strong>Plan Business</strong> : 39 900 FCFA/mois</li>
              </ul>

              <h3>11.2 Modalités de facturation</h3>
              <ul>
                <li>Les Plans payants sont facturés mensuellement, par avance</li>
                <li>L&apos;abonnement se renouvelle tacitement, sauf résiliation</li>
                <li>Les paiements sont prélevés via le moyen de paiement enregistré</li>
                <li>Les factures sont émises sous format électronique et accessibles depuis le Compte</li>
              </ul>

              <h3>11.3 Devises</h3>
              <p>
                Les tarifs sont libellés en Franc CFA (XAF/XOF) pour les marchés
                d&apos;Afrique francophone. Des équivalents en EUR ou USD peuvent être
                proposés selon le pays de résidence de l&apos;Utilisateur. Les conversions
                sont effectuées au taux de change applicable au jour de la transaction.
              </p>

              <h3>11.4 TVA et taxes</h3>
              <p>
                Les tarifs affichés peuvent être hors taxes ou toutes taxes comprises
                selon la juridiction. Les éventuelles taxes applicables (TVA, taxes
                locales) sont à la charge de l&apos;Utilisateur et seront ajoutées au prix
                lorsque requis par la loi.
              </p>

              <h3>11.5 Défaut de paiement</h3>
              <p>
                En cas de défaut de paiement, Fiable se réserve le droit de :
              </p>
              <ul>
                <li>Suspendre l&apos;accès aux fonctionnalités payantes après notification</li>
                <li>Résilier le Compte après un délai de 30 jours de défaut persistant</li>
                <li>Recouvrer les sommes dues par toute voie légale</li>
                <li>Facturer des frais de recouvrement et intérêts de retard conformément à la loi applicable</li>
              </ul>
            </section>

            <section id="article-12">
              <h2>Article 12 — Commissions sur ventes</h2>

              <h3>12.1 Principe</h3>
              <p>
                Outre l&apos;abonnement éventuel au Plan, Fiable prélève une commission sur
                chaque vente effectuée via une Boutique. Le taux de commission dépend
                du Plan choisi :
              </p>
              <ul>
                <li><strong>Plan Free</strong> : 4% par vente</li>
                <li><strong>Plan Starter</strong> : 2,5% par vente</li>
                <li><strong>Plan Pro</strong> : 1,5% par vente</li>
                <li><strong>Plan Business</strong> : 0,9% par vente</li>
              </ul>

              <h3>12.2 Frais des partenaires de paiement</h3>
              <p>
                Les frais des partenaires de paiement (Afribapay, CinetPay, Stripe)
                sont distincts de la Commission de Fiable et viennent s&apos;ajouter à
                celle-ci. Ces frais varient selon le moyen de paiement utilisé et la
                devise. Ils sont communiqués au Vendeur lors de la configuration des
                paiements.
              </p>

              <h3>12.3 Calcul et prélèvement</h3>
              <p>
                La Commission est calculée sur le montant TTC de la vente et prélevée
                automatiquement avant versement du solde au Vendeur. Le détail de
                chaque transaction est disponible dans le tableau de bord du Vendeur.
              </p>
            </section>

            <section id="article-13">
              <h2>Article 13 — Versement des produits des ventes</h2>

              <h3>13.1 Conditions préalables</h3>
              <p>Le versement des produits des ventes est conditionné par :</p>
              <ul>
                <li>La validation de la procédure KYC</li>
                <li>L&apos;enregistrement d&apos;un compte bancaire ou Mobile Money valide</li>
                <li>Un montant minimum de versement fixé selon le pays</li>
                <li>L&apos;absence de litige en cours susceptible d&apos;affecter les sommes concernées</li>
              </ul>

              <h3>13.2 Périodicité</h3>
              <p>
                Les versements sont effectués selon une périodicité définie par le
                Vendeur (quotidienne, hebdomadaire ou mensuelle) parmi les options
                disponibles dans son tableau de bord.
              </p>

              <h3>13.3 Délai de mise à disposition</h3>
              <p>
                Les sommes encaissées sont mises à disposition du Vendeur après un
                délai de sécurité de 2 à 7 jours ouvrés selon le moyen de paiement et
                le profil de risque, afin de couvrir les éventuelles contestations,
                impayés ou demandes de remboursement.
              </p>

              <h3>13.4 Rétention en cas de litige</h3>
              <p>
                Fiable se réserve le droit de retenir tout ou partie des sommes en cas
                de :
              </p>
              <ul>
                <li>Litige client en cours</li>
                <li>Suspicion de fraude</li>
                <li>Demande de remboursement non traitée</li>
                <li>Procédure judiciaire ou administrative</li>
                <li>Manquement aux présentes CGU</li>
              </ul>
            </section>

            <section id="article-14">
              <h2>Article 14 — Droit de rétractation et remboursements</h2>

              <h3>14.1 Abonnement Sellia (relation Vendeur-Fiable)</h3>
              <p>
                Pour les Vendeurs personnes physiques agissant à des fins
                non-professionnelles et résidant dans l&apos;Union Européenne, un droit de
                rétractation de 14 jours s&apos;applique à compter de la souscription au
                Plan, sauf renonciation expresse en cas d&apos;exécution immédiate du
                Service.
              </p>
              <p>
                Pour les Vendeurs professionnels, aucun droit de rétractation ne
                s&apos;applique, conformément aux usages B2B.
              </p>

              <h3>14.2 Ventes via les Boutiques (relation Acheteur-Vendeur)</h3>
              <p>
                Le droit de rétractation et la politique de remboursement applicable aux
                ventes effectuées via les Boutiques relèvent de la responsabilité
                exclusive du Vendeur, qui doit les communiquer clairement à ses
                Acheteurs conformément à la législation applicable. Le Vendeur peut
                définir ses propres conditions générales de vente, dans le respect du
                droit applicable et notamment du droit de la consommation.
              </p>

              <h3>14.3 Remboursements via la plateforme</h3>
              <p>
                Lorsqu&apos;un remboursement est dû à un Acheteur, le Vendeur peut le
                déclencher depuis son tableau de bord. Les frais de transaction
                initialement prélevés peuvent ne pas être remboursés par les
                partenaires de paiement, selon leurs propres conditions.
              </p>
            </section>

            <section id="article-15">
              <h2>Article 15 — Propriété intellectuelle</h2>

              <h3>15.1 Droits de Fiable</h3>
              <p>
                Tous les éléments du Service (marque Sellia, logos, code source,
                charte graphique, modèles, contenus éditoriaux) sont la propriété
                exclusive de Fiable Technologies LLC, conformément à l&apos;Article 5 des <Link href="/mentions-legales" className="legal-link">Mentions Légales</Link>.
              </p>

              <h3>15.2 Licence d&apos;utilisation accordée à l&apos;Utilisateur</h3>
              <p>
                Sous réserve du respect des présentes CGU et du paiement des sommes
                dues, Fiable accorde à l&apos;Utilisateur une licence personnelle, non
                exclusive, non cessible et révocable, limitée à l&apos;usage du Service
                pour les finalités prévues.
              </p>

              <h3>15.3 Contenus Utilisateur</h3>
              <p>
                L&apos;Utilisateur conserve la propriété de ses Contenus Utilisateur. Il
                concède à Fiable une licence non-exclusive, mondiale et gratuite, pour
                la durée d&apos;utilisation du Service, aux seules fins de fournir le
                Service (hébergement, affichage, sauvegarde, adaptation technique).
              </p>

              <h3>15.4 Garanties de l&apos;Utilisateur</h3>
              <p>
                L&apos;Utilisateur garantit qu&apos;il dispose de tous les droits nécessaires
                sur ses Contenus Utilisateur et qu&apos;ils ne portent atteinte à aucun
                droit de tiers. Il s&apos;engage à indemniser Fiable de tout préjudice
                résultant d&apos;une violation de cette garantie.
              </p>
            </section>

            <section id="article-16">
              <h2>Article 16 — Données personnelles</h2>
              <p>
                Le traitement des données personnelles est intégralement régi par notre <Link href="/confidentialite" className="legal-link">Politique de Confidentialité</Link>, qui fait partie intégrante des présentes CGU et que l&apos;Utilisateur déclare avoir lue et acceptée.
              </p>
            </section>

            <section id="article-17">
              <h2>Article 17 — Disponibilité du service</h2>

              <h3>17.1 Engagement</h3>
              <p>
                Fiable s&apos;efforce d&apos;assurer une disponibilité du Service de 99,5% sur
                base mensuelle, hors interruptions programmées et cas de force majeure.
              </p>

              <h3>17.2 Maintenance</h3>
              <p>
                Fiable peut être amené à interrompre temporairement l&apos;accès au Service
                pour des opérations de maintenance, mises à jour ou amélioration. Les
                maintenances programmées sont annoncées au moins 48 heures à l&apos;avance,
                sauf urgence de sécurité.
              </p>

              <h3>17.3 Limitations</h3>
              <p>
                Le fonctionnement du Service dépend de prestataires tiers (hébergeurs,
                fournisseurs Internet, partenaires de paiement). Fiable ne peut garantir
                la disponibilité absolue de ces services tiers, mais s&apos;engage à choisir
                des prestataires fiables et à mettre en place des solutions de secours
                lorsque possible.
              </p>
            </section>

            <section id="article-18">
              <h2>Article 18 — Limitation de responsabilité</h2>

              <h3>18.1 Principe général</h3>
              <p>
                Dans la mesure permise par la loi applicable, la responsabilité de
                Fiable envers l&apos;Utilisateur, toutes causes confondues, est limitée au
                montant des sommes effectivement versées par l&apos;Utilisateur au titre du
                Service durant les 12 mois précédant le fait générateur de
                responsabilité.
              </p>

              <h3>18.2 Exclusions</h3>
              <p>Fiable ne saurait être tenu responsable :</p>
              <ul>
                <li>Des dommages indirects (perte de chiffre d&apos;affaires, perte de clientèle, atteinte à la réputation)</li>
                <li>Des conséquences résultant de l&apos;usage frauduleux du Compte par un tiers</li>
                <li>Des contenus publiés par les Utilisateurs sur leurs Boutiques</li>
                <li>Des transactions et relations commerciales entre Vendeurs et Acheteurs</li>
                <li>Des défaillances des prestataires tiers (paiement, livraison, hébergement secondaire)</li>
                <li>De la perte de données résultant d&apos;une négligence de l&apos;Utilisateur (mot de passe compromis, suppression accidentelle de contenu)</li>
                <li>Des erreurs ou imprécisions dans les contenus générés par intelligence artificielle, l&apos;Utilisateur étant tenu de vérifier et adapter les contenus avant publication</li>
              </ul>

              <h3>18.3 Cas non limités</h3>
              <p>
                Les présentes limitations ne s&apos;appliquent pas en cas de faute lourde
                ou intentionnelle de Fiable, ni dans les cas où la loi applicable
                interdit toute limitation de responsabilité (notamment en matière de
                dommage corporel, garantie légale de conformité dans certaines
                juridictions, etc.).
              </p>
            </section>

            <section id="article-19">
              <h2>Article 19 — Suspension et résiliation</h2>

              <h3>19.1 Résiliation par l&apos;Utilisateur</h3>
              <p>
                L&apos;Utilisateur peut résilier son Compte à tout moment depuis son espace
                personnel ou par demande écrite à <strong>contact@getsellia.com</strong>.
                La résiliation prend effet à la fin de la période de facturation en
                cours pour les Plans payants. Aucun remboursement prorata temporis
                n&apos;est dû, sauf disposition légale impérative contraire.
              </p>

              <h3>19.2 Résiliation par Fiable</h3>
              <p>
                Fiable peut suspendre ou résilier le Compte de l&apos;Utilisateur, avec ou
                sans préavis selon la gravité, en cas de :
              </p>
              <ul>
                <li>Manquement aux présentes CGU ou aux autres documents contractuels</li>
                <li>Fourniture d&apos;informations fausses ou trompeuses</li>
                <li>Activité frauduleuse, illégale ou contraire aux bonnes mœurs</li>
                <li>Défaut de paiement persistant</li>
                <li>Atteinte aux droits de tiers ou à l&apos;intégrité du Service</li>
                <li>Inactivité prolongée du Compte (12 mois sans connexion)</li>
                <li>Pour des raisons stratégiques majeures (par exemple, arrêt définitif du Service), avec un préavis de 90 jours</li>
              </ul>

              <h3>19.3 Conséquences de la résiliation</h3>
              <p>Lors de la résiliation :</p>
              <ul>
                <li>L&apos;accès au Compte est désactivé</li>
                <li>Les Données personnelles sont supprimées selon les durées indiquées dans la <Link href="/confidentialite" className="legal-link">Politique de Confidentialité</Link></li>
                <li>Les sommes éventuellement dues à l&apos;Utilisateur lui sont versées sous 30 jours, après déduction des éventuelles sommes dues à Fiable</li>
                <li>L&apos;Utilisateur peut, avant la résiliation, exporter ses données via les fonctionnalités prévues à cet effet</li>
                <li>Les obligations qui par nature survivent à la résiliation (propriété intellectuelle, confidentialité, responsabilité, droit applicable) restent en vigueur</li>
              </ul>
            </section>

            <section id="article-20">
              <h2>Article 20 — Modification des CGU</h2>

              <h3>20.1 Droit de modification</h3>
              <p>
                Fiable se réserve le droit de modifier les présentes CGU à tout moment,
                notamment pour les adapter aux évolutions législatives, réglementaires,
                techniques ou commerciales.
              </p>

              <h3>20.2 Information préalable</h3>
              <p>
                En cas de modification substantielle, Fiable informera les Utilisateurs :
              </p>
              <ul>
                <li>Par email à l&apos;adresse renseignée dans le Compte, au moins 30 jours avant l&apos;entrée en vigueur des nouvelles CGU</li>
                <li>Par notification visible dans le Service</li>
                <li>Par mise à jour du numéro de version et de la date en tête du présent document</li>
              </ul>

              <h3>20.3 Acceptation</h3>
              <p>
                La poursuite de l&apos;utilisation du Service après l&apos;entrée en vigueur des
                modifications vaut acceptation tacite des nouvelles CGU. L&apos;Utilisateur
                qui refuse les modifications peut résilier son Compte sans frais avant
                leur entrée en vigueur.
              </p>
            </section>

            <section id="article-21">
              <h2>Article 21 — Force majeure</h2>
              <p>
                Aucune des parties ne saurait être tenue responsable d&apos;un manquement à
                ses obligations résultant d&apos;un cas de Force Majeure, tel que défini par
                la jurisprudence applicable, notamment :
              </p>
              <ul>
                <li>Catastrophes naturelles (séismes, inondations, ouragans, etc.)</li>
                <li>Conflits armés, attentats, troubles graves à l&apos;ordre public</li>
                <li>Pandémies et mesures sanitaires gouvernementales</li>
                <li>Pannes massives des infrastructures Internet ou télécoms</li>
                <li>Décisions gouvernementales rendant impossible l&apos;exécution du contrat</li>
                <li>Cyberattaques d&apos;une ampleur exceptionnelle</li>
              </ul>
              <p>
                La partie affectée doit notifier l&apos;autre partie dans un délai
                raisonnable et mettre en œuvre tous les moyens raisonnables pour
                reprendre l&apos;exécution de ses obligations dès que possible.
              </p>
            </section>

            <section id="article-22">
              <h2>Article 22 — Loi applicable et juridiction</h2>

              <h3>22.1 Droit applicable</h3>
              <p>
                Les présentes CGU sont régies par le droit de l&apos;État du Delaware,
                États-Unis d&apos;Amérique, sans égard à ses règles de conflit de lois.
              </p>
              <p>
                Toutefois, les Utilisateurs résidant dans l&apos;Union Européenne, en
                Suisse, au Royaume-Uni, ou dans tout pays appliquant des règles
                impératives de protection du consommateur, conservent le bénéfice des
                dispositions impératives de leur droit national. De même, les
                Utilisateurs résidant dans les pays de l&apos;OHADA bénéficient des
                dispositions impératives de l&apos;Acte uniforme applicable.
              </p>

              <h3>22.2 Juridiction</h3>
              <p>
                Sous réserve des règles de compétence impératives applicables aux
                consommateurs, tout litige relatif aux présentes CGU sera soumis :
              </p>
              <ul>
                <li>Pour les Utilisateurs commerçants ou professionnels : à la compétence exclusive des tribunaux de l&apos;État du Delaware (Court of Chancery), avec faculté de recours à l&apos;arbitrage selon les règles de l&apos;American Arbitration Association (AAA)</li>
                <li>Pour les Utilisateurs consommateurs : aux juridictions compétentes selon les règles impératives applicables dans leur pays de résidence</li>
              </ul>

              <h3>22.3 Résolution amiable préalable</h3>
              <p>
                Avant toute action contentieuse, les parties s&apos;engagent à rechercher
                une solution amiable du litige par voie de négociation directe. À
                défaut, une médiation pourra être proposée.
              </p>

              <h3>22.4 Plateforme européenne ODR</h3>
              <p>
                Les Utilisateurs consommateurs résidant dans l&apos;Union Européenne peuvent
                recourir à la plateforme européenne de règlement en ligne des litiges,
                accessible à : <strong>https://ec.europa.eu/consumers/odr</strong>
              </p>
            </section>

            <section id="article-23">
              <h2>Article 23 — Dispositions diverses</h2>

              <h3>23.1 Intégralité de l&apos;accord</h3>
              <p>
                Les présentes CGU, ensemble avec les Mentions Légales, la Politique de
                Confidentialité et la Politique de Cookies, constituent l&apos;intégralité
                de l&apos;accord entre les parties et remplacent tout accord antérieur.
              </p>

              <h3>23.2 Nullité partielle</h3>
              <p>
                Si une disposition des CGU est déclarée nulle, illégale ou
                inapplicable par une juridiction compétente, les autres dispositions
                conservent leur pleine validité. La disposition nulle sera remplacée
                par une disposition valable poursuivant le même objectif dans la
                mesure du possible.
              </p>

              <h3>23.3 Non-renonciation</h3>
              <p>
                Le fait pour une partie de ne pas se prévaloir d&apos;un manquement de
                l&apos;autre partie à l&apos;une de ses obligations ne saurait être interprété
                comme une renonciation à se prévaloir ultérieurement de ce manquement.
              </p>

              <h3>23.4 Cession</h3>
              <p>
                L&apos;Utilisateur ne peut céder ses droits et obligations au titre des
                présentes sans l&apos;accord préalable écrit de Fiable. Fiable peut céder
                les présentes à tout tiers, notamment dans le cadre d&apos;une cession
                d&apos;activité, d&apos;une fusion ou d&apos;une réorganisation.
              </p>

              <h3>23.5 Notifications</h3>
              <p>
                Toute notification au titre des présentes doit être effectuée par
                email aux adresses indiquées dans le Compte ou à l&apos;adresse <strong>legal@getsellia.com</strong> pour Fiable. Les notifications par courrier postal restent possibles aux adresses indiquées dans les Mentions Légales.
              </p>

              <h3>23.6 Langue</h3>
              <p>
                Les présentes CGU sont rédigées en français. Une traduction anglaise
                peut être disponible à titre informatif. En cas de divergence
                d&apos;interprétation, la version française fait foi.
              </p>
            </section>

            <section id="article-24">
              <h2>Article 24 — Contact</h2>
              <p>Pour toute question relative aux présentes CGU :</p>
              <div className="legal-info-block">
                <p>
                  <strong>Service juridique</strong> : legal@getsellia.com<br />
                  <strong>Support général</strong> : contact@getsellia.com<br />
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
