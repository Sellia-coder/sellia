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
  contact: {
    slug: "contact",
    title: "Contact",
    content: `## Nous contacter

Nous sommes à votre écoute pour toute question concernant nos produits ou votre commande.

**Email** : [votre@email.com]
**Téléphone** : [+237 XXX XX XX XX]
**WhatsApp** : [+237 XXX XX XX XX]

## Horaires

- Lundi - Vendredi : 8h - 18h
- Samedi : 9h - 14h
- Dimanche : Fermé`,
    metaDescription: "Contactez notre équipe pour toute question.",
  },
  cgv: {
    slug: "cgv",
    title: "Conditions générales de vente",
    content: `## 1. Préambule

Les présentes conditions générales de vente s'appliquent à toutes les ventes conclues sur notre boutique en ligne.

## 2. Produits

Les produits proposés sont décrits et présentés avec la plus grande exactitude possible.

## 3. Prix

Les prix sont indiqués en FCFA toutes taxes comprises.

## 4. Commandes

Toute commande passée sur notre site constitue la formation d'un contrat conclu à distance.

## 5. Paiement

Le paiement s'effectue par Mobile Money, carte bancaire ou virement.

## 6. Livraison

Les délais de livraison sont indiqués lors de la commande.

## 7. Droit de rétractation

Vous disposez d'un délai de 14 jours pour vous rétracter.`,
    metaDescription: "Conditions générales de vente de notre boutique.",
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

    await Promise.all(
      faqIds.map((id, idx) =>
        db.shopFaq.updateMany({
          where: { id, shopId: shop.id },
          data: { order: idx },
        })
      )
    );

    revalidatePath("/dashboard/pages");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}
