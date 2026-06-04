import { db } from "@/lib/db";

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

const SELLIA_LEGAL_ENTITY = "Fiable Technologies LLC";
const SELLIA_LEGAL_ADDRESS =
  "1111B S Governors Ave, Suite 59264, Dover, DE 19904, États-Unis";

function buildLegalPageContents(shop: ShopLegalContext) {
  const shopName = shop.name;
  const entityName = shopName;
  const email = shop.contactEmail || shop.email || "[email à compléter]";
  const phone =
    shop.phone || shop.whatsappNumber || "[téléphone à compléter]";
  const address = shop.address
    ? `${shop.address}${shop.city ? `, ${shop.city}` : ""}${shop.country ? `, ${shop.country}` : ""}`
    : "[adresse à compléter]";
  const currency = shop.currency === "XAF" ? "FCFA" : shop.currency || "FCFA";
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return [
    {
      slug: "cgv",
      title: "Conditions générales de vente",
      templateKey: "cgv",
      metaDescription: `Conditions générales de vente de ${shopName}.`,
      content: `*Dernière mise à jour : ${today}*

## 1. Préambule

Les présentes conditions générales de vente (CGV) régissent les relations contractuelles entre **${entityName}** (ci-après "le Vendeur"), exploitant la boutique en ligne **${shopName}**, et toute personne (ci-après "le Client") effectuant un achat sur le site **${shop.slug}.getsellia.com**.

Toute commande implique l'acceptation pleine et entière des présentes CGV.

## 2. Identification du vendeur

- **Raison sociale** : ${entityName}
- **Email** : ${email}
- **Téléphone** : ${phone}
- **Adresse** : ${address}

## 3. Produits

Les produits proposés à la vente sont décrits et présentés avec le plus de précision possible.

## 4. Prix

Les prix sont indiqués en **${currency}** toutes taxes comprises.

## 5. Commandes

Toute commande passée sur ${shopName} constitue la formation d'un contrat conclu à distance.

## 6. Paiement

Le paiement s'effectue par Mobile Money, carte bancaire ou paiement à la livraison selon les options disponibles.

## 7. Livraison

Les délais de livraison varient selon la zone choisie lors de la commande.

## 8. Droit de rétractation

Le Client dispose d'un délai de **7 jours** à compter de la réception pour exercer son droit de rétractation.

## 9. Contact

- **Email** : ${email}
- **Téléphone / WhatsApp** : ${phone}`,
    },
    {
      slug: "confidentialite",
      title: "Politique de confidentialité",
      templateKey: "privacy",
      metaDescription: `Comment ${shopName} protège vos données personnelles.`,
      content: `*Dernière mise à jour : ${today}*

## 1. Engagement

**${entityName}**, exploitant ${shopName}, s'engage à protéger la vie privée et les données personnelles de ses clients.

## 2. Données collectées

- **Informations d'identification** : nom, prénom
- **Coordonnées** : email, téléphone, adresse de livraison
- **Informations de commande** : produits achetés, montants

## 3. Finalités

Vos données sont utilisées pour traiter vos commandes, vous informer de leur statut et améliorer notre service.

## 4. Vos droits

Vous disposez d'un droit d'accès, de rectification et de suppression. Contact : **${email}**

## 5. Contact

- **Email** : ${email}
- **Téléphone** : ${phone}
- **Adresse** : ${address}`,
    },
    {
      slug: "mentions-legales",
      title: "Mentions légales",
      templateKey: "legal",
      metaDescription: `Informations légales concernant ${shopName}.`,
      content: `*Dernière mise à jour : ${today}*

## Éditeur du site

**${entityName}**

Boutique en ligne : **https://${shop.slug}.getsellia.com**

## Coordonnées

- **Email** : ${email}
- **Téléphone** : ${phone}
- **Adresse** : ${address}

## Hébergement

Le site est propulsé par **Sellia**, une marque de ${SELLIA_LEGAL_ENTITY}.

- **Adresse** : ${SELLIA_LEGAL_ADDRESS}
- **Site web** : https://getsellia.com
- **Email** : contact@getsellia.com

## Données personnelles

Consultez notre [Politique de confidentialité](/confidentialite).

## Contact

Pour toute question : **${email}**`,
    },
  ];
}

/**
 * Génère les pages légales par défaut (CGV, confidentialité, mentions légales).
 * Idempotent : ne crée pas si le slug existe déjà (ne réécrase pas une page éditée).
 */
export async function generateLegalPagesForShop(
  shop: ShopLegalContext
): Promise<{ createdCount: number }> {
  const pages = buildLegalPageContents(shop);
  let createdCount = 0;

  for (const page of pages) {
    const existing = await db.shopPage.findUnique({
      where: { shopId_slug: { shopId: shop.id, slug: page.slug } },
    });
    if (existing) continue;

    await db.shopPage.create({
      data: {
        shopId: shop.id,
        slug: page.slug,
        title: page.title,
        content: page.content,
        metaDescription: page.metaDescription,
        templateKey: page.templateKey,
        isPublished: true,
        showInFooter: true,
      },
    });
    createdCount++;
  }

  return { createdCount };
}
