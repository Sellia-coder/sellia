/** Contexte boutique pour générer les pages légales (templates statiques). */
export type ShopLegalContext = {
  id: string;
  slug: string;
  name: string;
  contactEmail?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  currency?: string | null;
};

const LEGAL_DISCLAIMER =
  "*Modèle fourni à titre indicatif — à faire valider par un conseil juridique. Ce document ne constitue pas un avis juridique.*";

export const SELLIA_LEGAL_ENTITY = "Fiable Technologies LLC";
export const SELLIA_LEGAL_ADDRESS =
  "1111B S Governors Ave, Suite 59264, Dover, DE 19904, États-Unis";

export const LEGAL_TEMPLATE_KEYS = new Set([
  "cgv",
  "privacy",
  "legal",
  "returns",
]);

function merchantBlock(shop: ShopLegalContext) {
  const shopName = shop.name;
  const entityName = shopName;
  const email = shop.contactEmail || shop.email || "[email à compléter]";
  const phone =
    shop.phone || shop.whatsappNumber || "[téléphone à compléter]";
  const address = shop.address
    ? `${shop.address}${shop.city ? `, ${shop.city}` : ""}${shop.country ? `, ${shop.country}` : ""}`
    : "[adresse à compléter]";
  const country = shop.country || "État membre de la CEMAC";
  const currency = shop.currency === "XAF" ? "FCFA (XAF)" : shop.currency || "FCFA (XAF)";
  const shopUrl = `https://${shop.slug}.getsellia.com`;
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return {
    shopName,
    entityName,
    email,
    phone,
    address,
    country,
    currency,
    shopUrl,
    today,
  };
}

export function buildCgvContent(shop: ShopLegalContext): string {
  const m = merchantBlock(shop);
  return `${LEGAL_DISCLAIMER}

*Dernière mise à jour : ${m.today}*

## Article 1 — Objet et champ d'application

Les présentes Conditions Générales de Vente (ci-après les « **CGV** ») régissent les relations contractuelles entre **${m.entityName}** (ci-après le « **Vendeur** »), exploitant la boutique en ligne **${m.shopName}**, accessible à l'adresse **${m.shopUrl}**, et toute personne physique ou morale effectuant un achat sur cette boutique (ci-après le « **Client** » ou l'« **Acheteur** »).

Toute commande passée sur la boutique implique l'acceptation pleine, entière et sans réserve des présentes CGV par le Client, sans préjudice des droits impératifs reconnus au consommateur en vertu de la législation applicable dans l'espace CEMAC (notamment au Cameroun et en République du Congo).

## Article 2 — Définitions

- **Boutique** : le site de vente en ligne ${m.shopName}, hébergé sur la plateforme Sellia.
- **Commande** : acte par lequel le Client sélectionne un ou plusieurs Produits et valide son intention d'achat via le processus de commande en ligne.
- **Produit** : tout bien ou service proposé à la vente par le Vendeur sur la Boutique.
- **Plateforme** : l'infrastructure technique Sellia, opérée par ${SELLIA_LEGAL_ENTITY}.
- **Partenaires de paiement** : prestataires agréés (Mobile Money, cartes bancaires, etc.) intervenant pour le traitement sécurisé des paiements effectués **sur le site**.

## Article 3 — Identification du Vendeur

Le Vendeur, seul responsable de la commercialisation des Produits, est identifié comme suit :

- **Dénomination / Raison sociale** : ${m.entityName}
- **Boutique** : ${m.shopName}
- **Adresse** : ${m.address}
- **Pays d'exercice** : ${m.country}
- **Email** : ${m.email}
- **Téléphone / WhatsApp** : ${m.phone}

## Article 4 — Identification de la Plateforme (Sellia)

La Boutique est créée et hébergée via la plateforme **Sellia**, marque exploitée par :

- **${SELLIA_LEGAL_ENTITY}**
- **Adresse** : ${SELLIA_LEGAL_ADDRESS}
- **Site** : https://getsellia.com
- **Contact plateforme** : legal@getsellia.com

Sellia fournit un service d'hébergement et d'outils techniques permettant au Vendeur de présenter ses Produits et de recevoir des commandes en ligne. **Sellia n'est pas le vendeur des Produits** et n'est pas partie au contrat de vente conclu entre le Vendeur et le Client.

## Article 5 — Produits et présentation

Les Produits sont décrits et présentés sur la Boutique avec le plus grand soin. Le Vendeur s'efforce de fournir des informations exactes (caractéristiques, disponibilité, visuels). Toutefois, des variations mineures (couleur, finition) peuvent exister sans engager la responsabilité du Vendeur au-delà des garanties légales.

Les photographies et illustrations n'ont pas de valeur contractuelle supérieure à la description textuelle du Produit.

## Article 6 — Prix

Les prix sont indiqués en **${m.currency}**, toutes taxes comprises lorsque la réglementation locale l'exige, sauf mention contraire.

Le Vendeur se réserve le droit de modifier ses prix à tout moment. Le prix applicable est celui affiché au moment de la validation définitive de la Commande par le Client.

Les frais de livraison, le cas échéant, sont indiqués avant la validation de la Commande.

## Article 7 — Processus de commande

La Commande s'effectue exclusivement via le processus en ligne proposé sur la Boutique :

1. Sélection des Produits et ajout au panier ;
2. Saisie des informations de livraison et de contact ;
3. Choix du mode de livraison et de paiement parmi les options disponibles ;
4. Vérification du récapitulatif et acceptation des présentes CGV ;
5. Paiement sécurisé sur le site ;
6. Confirmation de la Commande par email ou notification.

La vente n'est réputée conclue qu'après confirmation du paiement (ou validation du mode de paiement choisi, selon les règles applicables au mode sélectionné).

## Article 8 — Paiement

**Le paiement s'effectue intégralement sur le site de la Boutique**, via les moyens proposés (Mobile Money — MTN, Orange, Moov, Wave —, cartes Visa/Mastercard, paiement à la livraison lorsque activé par le Vendeur, etc.).

Les transactions sont traitées par des partenaires de paiement sécurisés. Le Vendeur ne demande jamais au Client d'effectuer un paiement par virement non tracé, par transfert personnel non couvert par le site, ou par tout moyen contournant le processus de commande officiel.

En cas de refus de paiement par l'organisme bancaire ou l'opérateur Mobile Money, la Commande est automatiquement annulée.

## Article 9 — Livraison

Les modalités de livraison (zones couvertes, délais indicatifs, frais) sont précisées lors de la Commande et, le cas échéant, sur la page « Livraison » de la Boutique.

Les délais sont communiqués à titre indicatif. Un retard raisonnable, notamment en raison de contraintes logistiques ou douanières dans l'espace CEMAC, ne peut donner lieu à annulation ou indemnisation sauf disposition légale impérative.

Le transfert des risques et de la propriété des Produits physiques intervient à la remise au Client ou au transporteur, selon les conditions convenues.

Pour les Produits numériques ou services, l'accès est fourni selon les modalités indiquées sur la fiche produit.

## Article 10 — Droit de rétractation, retours et remboursements

Sous réserve des dispositions légales impératives applicables dans le pays du Client et du Vendeur, le Client peut bénéficier d'un délai de rétractation ou de retour tel que précisé dans la [Politique de retour et remboursement](/retours) de la Boutique.

Les demandes de retour ou de remboursement doivent être adressées au Vendeur aux coordonnées indiquées à l'Article 3. **Les remboursements validés par le Vendeur sont traités via les canaux de paiement utilisés lors de la Commande sur le site**, dans les délais indiqués dans la politique de retour.

## Article 11 — Obligations et responsabilité du Vendeur

Le Vendeur s'engage à :

- Fournir des Produits conformes à leur description ;
- Traiter les Commandes avec diligence ;
- Répondre aux demandes du Client dans un délai raisonnable ;
- Respecter la réglementation applicable à son activité (déclarations fiscales, conformité des Produits, etc.).

Le Vendeur est seul responsable de la qualité, de la conformité, de la sécurité et de la licéité des Produits vendus, ainsi que du respect des obligations envers le Client.

## Article 12 — Rôle de Sellia et limitation de responsabilité de la Plateforme

**Sellia agit en qualité d'intermédiaire technique et d'hébergeur** de la Boutique. Sellia :

- Met à disposition des outils de création de boutique, de gestion de catalogue et de traitement des commandes ;
- Facilite l'intégration de solutions de paiement sécurisées ;
- **N'est pas partie au contrat de vente** conclu entre le Vendeur et le Client ;
- **Ne garantit pas** l'exécution par le Vendeur de ses obligations (livraison, conformité, SAV) ;
- **N'est pas responsable** des litiges relatifs aux Produits, aux retards, aux défauts ou aux manquements du Vendeur, sauf faute directe et prouvée de Sellia dans la fourniture du service technique.

Dans les limites autorisées par la loi, la responsabilité de ${SELLIA_LEGAL_ENTITY} est limitée aux dommages directs résultant d'un dysfonctionnement avéré et imputable du service technique Sellia.

## Article 13 — Transactions hors site non couvertes

**Toute transaction, commande ou paiement effectué en dehors du site officiel de la Boutique** (notamment via messagerie privée — WhatsApp, SMS, email —, virement direct non tracé par le site, ou tout autre canal non intégré au processus de commande Sellia) **n'est pas couverte, garantie ni sécurisée par Sellia**.

Sellia décline toute responsabilité en cas de fraude, de non-livraison, de litige ou de préjudice résultant de transactions réalisées hors du site. Le Client est invité à **toujours commander et payer via la Boutique officielle**.

## Article 14 — Données personnelles

Le traitement des données personnelles collectées dans le cadre des Commandes est décrit dans la [Politique de confidentialité](/confidentialite) de la Boutique et dans la politique de confidentialité de Sellia accessible sur https://getsellia.com/confidentialite.

## Article 15 — Propriété intellectuelle

L'ensemble des éléments de la Boutique (textes, visuels, marques, logos du Vendeur) sont protégés. Toute reproduction non autorisée est interdite.

La marque Sellia, les logiciels et l'infrastructure de la Plateforme restent la propriété exclusive de ${SELLIA_LEGAL_ENTITY}.

## Article 16 — Réclamations et litiges

**Réclamations relatives aux Produits ou à une Commande** : le Client contacte en priorité le Vendeur à **${m.email}** ou **${m.phone}**.

**Réclamations relatives au fonctionnement technique de la Boutique** : contact@getsellia.com ou legal@getsellia.com.

À défaut de résolution amiable, les litiges relèvent des tribunaux compétents du pays du Vendeur ou du Client, conformément aux règles impératives de protection du consommateur dans l'espace CEMAC et aux conventions applicables.

## Article 17 — Droit applicable

Les présentes CGV sont régies par le droit du pays d'exercice du Vendeur (**${m.country}**), sous réserve des dispositions impératives protectrices du consommateur applicables dans l'espace CEMAC (OHADA, réglementations nationales).

## Article 18 — Contact

**Vendeur (${m.entityName})**  
Email : ${m.email}  
Téléphone : ${m.phone}  
Adresse : ${m.address}

**Plateforme Sellia (${SELLIA_LEGAL_ENTITY})**  
${SELLIA_LEGAL_ADDRESS}  
legal@getsellia.com`;
}

export function buildPrivacyContent(shop: ShopLegalContext): string {
  const m = merchantBlock(shop);
  return `${LEGAL_DISCLAIMER}

*Dernière mise à jour : ${m.today}*

## Article 1 — Introduction

La présente Politique de confidentialité décrit comment **${m.entityName}** (le « **Vendeur** »), exploitant la boutique **${m.shopName}**, et la plateforme **Sellia** (${SELLIA_LEGAL_ENTITY}) traitent les données personnelles des visiteurs et clients de la Boutique **${m.shopUrl}**.

## Article 2 — Responsables du traitement

**Responsable du traitement pour les données liées à la relation commerciale (commandes, livraison, SAV)** :  
${m.entityName} — ${m.email} — ${m.address}

**Responsable du traitement pour les données liées au fonctionnement technique de la plateforme** :  
${SELLIA_LEGAL_ENTITY}, ${SELLIA_LEGAL_ADDRESS} — privacy@getsellia.com

Selon les opérations effectuées, le Vendeur et Sellia peuvent agir en co-responsabilité ou en qualité de sous-traitant l'un de l'autre, conformément aux accords contractuels les liant.

## Article 3 — Données collectées

Dans le cadre de l'utilisation de la Boutique, peuvent être collectées :

- **Données d'identification** : nom, prénom ;
- **Coordonnées** : adresse email, numéro de téléphone, adresse de livraison ;
- **Données de commande** : produits achetés, montants, historique, statut de livraison ;
- **Données de paiement** : traitées par les partenaires de paiement (Sellia ne stocke pas les numéros de carte complets) ;
- **Données techniques** : cookies, identifiants de session, pages consultées, pays de connexion (via en-têtes réseau anonymisés) ;
- **Données de messagerie** : échanges via le widget de chat de la boutique, le cas échéant.

## Article 4 — Finalités du traitement

Les données sont traitées pour :

- Traiter et suivre les commandes ;
- Assurer la livraison et le service après-vente ;
- Gérer les paiements et la prévention de la fraude ;
- Communiquer avec le Client (confirmations, notifications) ;
- Améliorer la Boutique et mesurer l'audience (statistiques agrégées et anonymisées) ;
- Respecter les obligations légales (comptabilité, lutte contre la fraude, KYC des partenaires paiement).

## Article 5 — Base légale

Les traitements reposent sur : l'exécution du contrat de vente, le consentement (cookies non essentiels, marketing), l'intérêt légitime (sécurité, amélioration du service) et les obligations légales.

## Article 6 — Destinataires et sous-traitants

Les données peuvent être communiquées à :

- Le **Vendeur** et son personnel autorisé ;
- **Sellia** (${SELLIA_LEGAL_ENTITY}) pour l'hébergement et l'exploitation technique ;
- Les **partenaires de paiement** (Mobile Money, cartes bancaires) ;
- Les prestataires de **livraison** mandatés par le Vendeur ;
- Les autorités compétentes sur réquisition légale.

Les sous-traitants sont contractuellement tenus à la confidentialité et à la sécurité des données.

## Article 7 — Transferts hors de l'espace CEMAC

Certains prestataires techniques (hébergement, paiement) peuvent être situés hors de la zone CEMAC. Les transferts sont encadrés par des garanties appropriées (clauses contractuelles types, certifications).

## Article 8 — Durées de conservation

- **Données de commande** : durée légale de conservation comptable et fiscale (généralement 10 ans) ;
- **Données de compte client** : durée de la relation commerciale + délais légaux ;
- **Cookies** : selon la [politique cookies de Sellia](https://getsellia.com/cookies) ;
- **Statistiques de visite** : données agrégées, identifiants de session anonymisés, conservation limitée.

## Article 9 — Sécurité

Le Vendeur et Sellia mettent en œuvre des mesures techniques et organisationnelles appropriées (chiffrement TLS, contrôle d'accès, journalisation) pour protéger les données contre l'accès non autorisé, la perte ou l'altération.

## Article 10 — Droits des personnes

Conformément aux lois applicables (RGPD pour les résidents UE, lois nationales CEMAC, etc.), vous disposez des droits suivants :

- Droit d'accès, de rectification et d'effacement ;
- Droit à la limitation et à l'opposition ;
- Droit à la portabilité (le cas échéant) ;
- Droit de retirer votre consentement ;
- Droit d'introduire une réclamation auprès de l'autorité de protection des données compétente.

**Pour exercer vos droits auprès du Vendeur** : ${m.email}  
**Pour exercer vos droits auprès de Sellia** : privacy@getsellia.com

## Article 11 — Cookies

La Boutique utilise des cookies essentiels au fonctionnement (panier, session) et, avec votre consentement, des cookies de mesure d'audience ou marketing. Vous pouvez gérer vos préférences via le bandeau cookies ou les paramètres de votre navigateur.

## Article 12 — Mineurs

La Boutique n'est pas destinée aux personnes de moins de 18 ans sans autorisation parentale. Nous ne collectons pas sciemment de données concernant des mineurs.

## Article 13 — Modifications

La présente Politique peut être mise à jour. La date de dernière mise à jour figure en tête de document. Les modifications substantielles seront portées à votre attention lorsque la réglementation l'exige.

## Article 14 — Contact

**Vendeur** : ${m.email} — ${m.phone}  
**Sellia** : privacy@getsellia.com — ${SELLIA_LEGAL_ADDRESS}`;
}

export function buildLegalMentionsContent(shop: ShopLegalContext): string {
  const m = merchantBlock(shop);
  return `${LEGAL_DISCLAIMER}

*Dernière mise à jour : ${m.today}*

## Article 1 — Éditeur de la Boutique

Conformément aux dispositions relatives à la confiance dans l'économie numérique applicables dans l'espace CEMAC et en droit international, les informations suivantes sont portées à la connaissance des utilisateurs.

**Éditeur / Exploitant de la boutique en ligne** :

- **Dénomination** : ${m.entityName}
- **Boutique** : ${m.shopName}
- **URL** : ${m.shopUrl}
- **Adresse** : ${m.address}
- **Pays** : ${m.country}
- **Email** : ${m.email}
- **Téléphone** : ${m.phone}

L'éditeur est seul responsable du contenu éditorial, des produits proposés et des informations commerciales publiées sur la Boutique.

## Article 2 — Directeur de la publication

Le directeur de la publication est le représentant légal ou le responsable désigné par ${m.entityName}. Contact : **${m.email}**.

## Article 3 — Hébergeur et plateforme technique

La Boutique est créée, hébergée et distribuée via la plateforme **Sellia**, opérée par :

- **${SELLIA_LEGAL_ENTITY}**
- **Forme juridique** : Limited Liability Company (Delaware, États-Unis)
- **Adresse du siège** : ${SELLIA_LEGAL_ADDRESS}
- **Site web** : https://getsellia.com
- **Email** : contact@getsellia.com / legal@getsellia.com

Sellia fournit l'infrastructure technique (hébergement, paiement intégré, outils de gestion). **Sellia n'est pas le vendeur des produits** présentés sur cette Boutique.

## Article 4 — Propriété intellectuelle

L'ensemble des éléments composant la Boutique (structure, textes, graphismes, logos du Vendeur, photographies de produits) est protégé par le droit de la propriété intellectuelle.

Toute reproduction, représentation ou exploitation non autorisée est interdite et susceptible de constituer une contrefaçon.

La marque **Sellia**, le logo Sellia, les logiciels et l'architecture de la plateforme sont la propriété exclusive de ${SELLIA_LEGAL_ENTITY}.

## Article 5 — Données personnelles

Le traitement des données personnelles est décrit dans la [Politique de confidentialité](/confidentialite) de cette Boutique.

Pour les données traitées par Sellia en tant qu'opérateur de plateforme : https://getsellia.com/confidentialite

## Article 6 — Cookies

L'utilisation de cookies est décrite dans la politique cookies de Sellia : https://getsellia.com/cookies

## Article 7 — Limitation de responsabilité

Le Vendeur s'efforce d'assurer l'exactitude des informations publiées. Toutefois, il ne saurait garantir l'absence d'erreurs ou d'omissions.

${SELLIA_LEGAL_ENTITY} agit en qualité d'hébergeur technique et ne peut être tenue responsable du contenu publié par le Vendeur, ni des transactions réalisées hors du site officiel de la Boutique.

## Article 8 — Liens hypertextes

La Boutique peut contenir des liens vers des sites tiers. Le Vendeur et Sellia déclinent toute responsabilité quant au contenu de ces sites externes.

## Article 9 — Droit applicable

Les présentes mentions légales sont régies par le droit applicable au Vendeur (**${m.country}**), sans préjudice des dispositions impératives protectrices des consommateurs.

## Article 10 — Contact

**Vendeur (${m.entityName})** : ${m.email} — ${m.phone}  
**Plateforme Sellia** : legal@getsellia.com — ${SELLIA_LEGAL_ADDRESS}`;
}

export function buildReturnsContent(shop: ShopLegalContext): string {
  const m = merchantBlock(shop);
  return `${LEGAL_DISCLAIMER}

*Dernière mise à jour : ${m.today}*

## Article 1 — Objet

La présente Politique de retour et de remboursement définit les conditions dans lesquelles le Client de la boutique **${m.shopName}** (${m.shopUrl}), exploité par **${m.entityName}**, peut retourner un Produit ou demander un remboursement.

## Article 2 — Champ d'application

Cette politique s'applique aux achats effectués **exclusivement via le site de la Boutique**. Les achats réalisés en dehors du site (messagerie privée, paiement direct) ne bénéficient pas des garanties Sellia ni des procédures décrites ci-après.

## Article 3 — Délai de rétractation ou de retour

Sous réserve des dispositions légales impératives applicables dans le pays du Client :

- Le Client dispose d'un délai de **14 jours calendaires** à compter de la réception du Produit pour exercer son droit de rétractation ou demander un retour, sauf exclusion légale (produits personnalisés, denrées périssables, contenus numériques descellés, etc.).
- Pour les Produits défectueux ou non conformes, le Client dispose des garanties légales de conformité et des vices cachés prévues par la loi applicable.

## Article 4 — Conditions de retour

Pour être accepté, un retour doit respecter les conditions suivantes :

- Le Produit est retourné dans son **emballage d'origine**, en parfait état de revente ;
- Le Produit n'a pas été utilisé, porté, lavé ou endommagé par le Client ;
- Tous les accessoires, notices et étiquettes sont inclus ;
- La demande est formulée dans le délai imparti auprès du Vendeur.

Le Vendeur se réserve le droit de refuser un retour ne respectant pas ces conditions.

## Article 5 — Procédure de retour

1. **Contacter le Vendeur** à **${m.email}** ou **${m.phone}** en indiquant le numéro de commande, le motif du retour et, le cas échéant, des photos ;
2. **Obtenir l'accord** du Vendeur et les instructions d'expédition ;
3. **Renvoyer le colis** dans le délai indiqué, en recommandé si possible ;
4. **Attendre la vérification** du Produit par le Vendeur à réception.

Les frais de retour sont à la charge du Client, sauf en cas de Produit défectueux, non conforme ou erreur imputable au Vendeur.

## Article 6 — Remboursement

Après validation du retour par le Vendeur :

- Le remboursement est effectué **via le même moyen de paiement** utilisé lors de la Commande sur le site (Mobile Money, carte bancaire, etc.), dans un délai maximal de **14 jours ouvrés** à compter de la réception et de la vérification du Produit ;
- Le montant remboursé correspond au prix du Produit retourné, hors frais de livraison initiaux sauf disposition légale contraire ;
- En cas de paiement à la livraison, le remboursement s'effectue selon les modalités convenues avec le Vendeur via les canaux sécurisés du site.

**Sellia facilite le traitement technique des remboursements** lorsque le paiement a été effectué via la plateforme, mais la décision de remboursement appartient au Vendeur, seul responsable de la relation commerciale.

## Article 7 — Échanges

Le Vendeur peut, à sa discrétion, proposer un échange plutôt qu'un remboursement. Contactez **${m.email}**.

## Article 8 — Produits exclus

Sont notamment exclus du droit de retour (sous réserve des garanties légales) :

- Produits personnalisés ou fabriqués sur mesure ;
- Produits descellés ne pouvant être renvoyés pour des raisons d'hygiène ou de santé ;
- Contenus numériques fournis immédiatement après accord exprès du Client ;
- Produits périssables.

## Article 9 — Rôle de Sellia

Sellia (${SELLIA_LEGAL_ENTITY}) n'est pas partie au contrat de vente. En cas de litige relatif à un retour ou remboursement, le Client contacte en priorité le Vendeur. Sellia peut intervenir en médiation technique uniquement pour les commandes passées et payées sur le site, sans garantir l'issue du litige.

## Article 10 — Contact

**${m.entityName}**  
Email : ${m.email}  
Téléphone : ${m.phone}  
Adresse : ${m.address}`;
}

export function buildLegalPageContents(shop: ShopLegalContext) {
  return [
    {
      slug: "cgv",
      title: "Conditions générales de vente",
      templateKey: "cgv",
      metaDescription: `Conditions générales de vente de ${shop.name}.`,
      content: buildCgvContent(shop),
    },
    {
      slug: "confidentialite",
      title: "Politique de confidentialité",
      templateKey: "privacy",
      metaDescription: `Comment ${shop.name} protège vos données personnelles.`,
      content: buildPrivacyContent(shop),
    },
    {
      slug: "mentions-legales",
      title: "Mentions légales",
      templateKey: "legal",
      metaDescription: `Informations légales concernant ${shop.name}.`,
      content: buildLegalMentionsContent(shop),
    },
    {
      slug: "retours",
      title: "Politique de retour et remboursement",
      templateKey: "returns",
      metaDescription: `Conditions de retour et remboursement de ${shop.name}.`,
      content: buildReturnsContent(shop),
    },
  ];
}
