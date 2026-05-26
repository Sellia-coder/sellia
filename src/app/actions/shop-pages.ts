"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";

export interface PageInput {
  slug: string;
  title: string;
  content: string;
  metaDescription?: string;
  isPublished?: boolean;
  showInHeader?: boolean;
  showInFooter?: boolean;
  templateKey?: string;
}

const TEMPLATES: Record<
  string,
  { slug: string; title: string; content: string; metaDescription: string }
> = {
  about: {
    slug: "a-propos",
    title: "À propos",
    content: `## Notre histoire

[Présentez votre boutique en quelques phrases. Quand avez-vous démarré ? Quelle est votre passion ?]

## Notre mission

[Expliquez ce qui vous différencie. Quels produits proposez-vous et pourquoi sont-ils uniques ?]

## Nos valeurs

- **Qualité** : [Décrivez votre engagement qualité]
- **Service** : [Comment vous accompagnez vos clients]
- **Authenticité** : [Ce qui rend votre boutique unique]`,
    metaDescription: "Découvrez notre histoire, notre mission et nos valeurs.",
  },
  shipping: {
    slug: "livraison",
    title: "Livraison",
    content: `## Modes de livraison

Nous proposons plusieurs options de livraison adaptées à vos besoins.

## Délais

- **Express** : 24h
- **Standard national** : 2-5 jours
- **International** : 7-14 jours

## Tarifs

Les frais de livraison sont calculés en fonction de votre zone.`,
    metaDescription: "Modes, délais et tarifs de livraison.",
  },
  returns: {
    slug: "retours",
    title: "Politique de retour",
    content: `## Délai de rétractation

Vous disposez de **14 jours** à compter de la réception de votre commande pour exercer votre droit de rétractation.

## Conditions de retour

Le produit doit être dans son emballage d'origine, non utilisé et non endommagé.

## Procédure

1. Contactez notre service client
2. Renvoyez le colis dans les 14 jours
3. Recevez votre remboursement sous 7 jours ouvrés`,
    metaDescription: "Tout savoir sur nos retours et remboursements.",
  },
};

export async function createPageFromTemplateAction(templateKey: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });
    if (!shop) return { ok: false, error: "Boutique introuvable" };

    const template = TEMPLATES[templateKey];
    if (!template) return { ok: false, error: "Template invalide" };

    const existing = await db.shopPage.findUnique({
      where: { shopId_slug: { shopId: shop.id, slug: template.slug } },
    });
    if (existing) return { ok: false, error: "Cette page existe déjà" };

    const page = await db.shopPage.create({
      data: {
        shopId: shop.id,
        slug: template.slug,
        title: template.title,
        content: template.content,
        metaDescription: template.metaDescription,
        templateKey,
        isPublished: false,
        showInFooter: true,
      },
    });

    revalidatePath("/dashboard/pages");
    return { ok: true, pageId: page.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function createPageAction(input: PageInput) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });
    if (!shop) return { ok: false, error: "Boutique introuvable" };

    const slug = input.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!slug || slug.length < 2) return { ok: false, error: "Slug invalide" };
    if (!input.title.trim()) return { ok: false, error: "Titre requis" };

    const existing = await db.shopPage.findUnique({
      where: { shopId_slug: { shopId: shop.id, slug } },
    });
    if (existing) return { ok: false, error: "Cette URL existe déjà" };

    const page = await db.shopPage.create({
      data: {
        shopId: shop.id,
        slug,
        title: input.title.trim(),
        content: input.content,
        metaDescription: input.metaDescription?.trim() || null,
        isPublished: input.isPublished ?? false,
        showInHeader: input.showInHeader ?? false,
        showInFooter: input.showInFooter ?? true,
      },
    });

    revalidatePath("/dashboard/pages");
    return { ok: true, pageId: page.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function updatePageAction(
  pageId: string,
  input: Partial<PageInput>
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const page = await db.shopPage.findUnique({
      where: { id: pageId },
      include: { shop: { select: { ownerId: true, slug: true } } },
    });
    if (!page || page.shop.ownerId !== user.id) {
      return { ok: false, error: "Page introuvable" };
    }

    await db.shopPage.update({
      where: { id: pageId },
      data: {
        ...(input.title !== undefined && { title: input.title.trim() }),
        ...(input.content !== undefined && { content: input.content }),
        ...(input.metaDescription !== undefined && {
          metaDescription: input.metaDescription?.trim() || null,
        }),
        ...(input.isPublished !== undefined && { isPublished: input.isPublished }),
        ...(input.showInHeader !== undefined && {
          showInHeader: input.showInHeader,
        }),
        ...(input.showInFooter !== undefined && {
          showInFooter: input.showInFooter,
        }),
      },
    });

    revalidatePath("/dashboard/pages");
    if (page.shop.slug) revalidatePath(`/shop/${page.shop.slug}/${page.slug}`);

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function deletePageAction(pageId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const page = await db.shopPage.findUnique({
      where: { id: pageId },
      include: { shop: { select: { ownerId: true } } },
    });
    if (!page || page.shop.ownerId !== user.id) {
      return { ok: false, error: "Page introuvable" };
    }

    await db.shopPage.delete({ where: { id: pageId } });
    revalidatePath("/dashboard/pages");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function createFaqAction(
  question: string,
  answer: string,
  category?: string
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });
    if (!shop) return { ok: false, error: "Boutique introuvable" };

    if (!question.trim() || !answer.trim()) {
      return { ok: false, error: "Question et réponse requises" };
    }

    const maxOrder = await db.shopFaq.aggregate({
      where: { shopId: shop.id },
      _max: { order: true },
    });

    const faq = await db.shopFaq.create({
      data: {
        shopId: shop.id,
        question: question.trim(),
        answer: answer.trim(),
        category: category?.trim() || null,
        order: (maxOrder._max.order ?? 0) + 1,
        isPublished: true,
      },
    });

    revalidatePath("/dashboard/pages");
    return { ok: true, faqId: faq.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function updateFaqAction(
  faqId: string,
  question: string,
  answer: string,
  category?: string
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const faq = await db.shopFaq.findUnique({
      where: { id: faqId },
      include: { shop: { select: { ownerId: true } } },
    });
    if (!faq || faq.shop.ownerId !== user.id) {
      return { ok: false, error: "FAQ introuvable" };
    }

    await db.shopFaq.update({
      where: { id: faqId },
      data: {
        question: question.trim(),
        answer: answer.trim(),
        category: category?.trim() || null,
      },
    });

    revalidatePath("/dashboard/pages");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function deleteFaqAction(faqId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const faq = await db.shopFaq.findUnique({
      where: { id: faqId },
      include: { shop: { select: { ownerId: true } } },
    });
    if (!faq || faq.shop.ownerId !== user.id) {
      return { ok: false, error: "FAQ introuvable" };
    }

    await db.shopFaq.delete({ where: { id: faqId } });
    revalidatePath("/dashboard/pages");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function reorderFaqsAction(faqIds: string[]) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });
    if (!shop) return { ok: false, error: "Boutique introuvable" };

    revalidatePath("/dashboard/pages");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function generateLegalPagesAction() {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: {
        id: true,
        slug: true,
        name: true,
        contactEmail: true,
        email: true,
        phone: true,
        whatsappNumber: true,
        address: true,
        city: true,
        country: true,
        currency: true,
      },
    });
    if (!shop) return { ok: false, error: "Boutique introuvable" };

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

    const pages = [
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

Le site est propulsé par **Sellia**, une marque de Rollo Technologies Inc.

- **Site web** : https://getsellia.com
- **Email** : contact@getsellia.com

## Données personnelles

Consultez notre [Politique de confidentialité](/confidentialite).

## Contact

Pour toute question : **${email}**`,
      },
    ];

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

    revalidatePath("/dashboard/pages");
    if (shop.slug) revalidatePath(`/shop/${shop.slug}`, "page");
    return { ok: true, createdCount };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}
