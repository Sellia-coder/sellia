"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import type { Prisma } from "@prisma/client";
import { assertShopNameAvailable } from "@/lib/shop-name";

interface ProfileUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  city?: string;
  bio?: string;
  avatarUrl?: string | null;
  language?: string;
  timezone?: string;
}

export async function updateProfileAction(input: ProfileUpdate) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Non autorisé" };

    await db.user.update({
      where: { id: user.id },
      data: {
        firstName: input.firstName?.trim() || null,
        lastName: input.lastName?.trim() || null,
        phone: input.phone?.trim() || null,
        country: input.country?.trim() || "CM",
        city: input.city?.trim() || null,
        bio: input.bio?.trim() || null,
        ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl || null } : {}),
        language: input.language || "fr",
        timezone: input.timezone?.trim() || null,
      },
    });

    revalidatePath("/dashboard/reglages");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

interface ShopBasicsUpdate {
  name?: string;
  tagline?: string;
  description?: string;
  contactEmail?: string;
  phone?: string;
  whatsappNumber?: string;
  address?: string;
  instagramUrl?: string;
  facebookUrl?: string;
}

export async function updateShopBasicsAction(input: ShopBasicsUpdate) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Non autorisé" };

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: { id: true, slug: true },
    });
    if (!shop) return { ok: false, error: "Boutique introuvable" };

    const updates: Prisma.ShopUpdateInput = {};
    if (input.name !== undefined) {
      const nameCheck = await assertShopNameAvailable(input.name, shop.id);
      if (!nameCheck.ok) {
        return {
          ok: false,
          error: nameCheck.suggestion
            ? `${nameCheck.error} Essayez « ${nameCheck.suggestion} ».`
            : nameCheck.error,
        };
      }
      updates.name = nameCheck.normalizedName;
    }
    if (input.tagline !== undefined) updates.tagline = input.tagline.trim() || null;
    if (input.description !== undefined) updates.description = input.description.trim() || null;
    if (input.contactEmail !== undefined) updates.contactEmail = input.contactEmail.trim() || null;
    if (input.phone !== undefined) updates.phone = input.phone.trim() || null;
    if (input.whatsappNumber !== undefined) updates.whatsappNumber = input.whatsappNumber.trim() || null;
    if (input.address !== undefined) updates.address = input.address.trim() || null;
    if (input.instagramUrl !== undefined) updates.instagramUrl = input.instagramUrl.trim() || null;
    if (input.facebookUrl !== undefined) updates.facebookUrl = input.facebookUrl.trim() || null;

    await db.shop.update({
      where: { id: shop.id },
      data: updates,
    });

    revalidatePath("/dashboard/reglages");
    revalidatePath(`/shop/${shop.slug}`, "page");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function updatePasswordAction(currentPassword: string, newPassword: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Non autorisé" };

    if (newPassword.length < 8) {
      return { ok: false, error: "Le nouveau mot de passe doit faire au moins 8 caractères" };
    }

    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true, authProvider: true },
    });
    if (!fullUser) return { ok: false, error: "Utilisateur introuvable" };

    if (fullUser.authProvider !== "email") {
      return {
        ok: false,
        error: "Vous vous êtes connecté avec Google. Modifiez votre mot de passe Google directement.",
      };
    }

    if (!fullUser.passwordHash) {
      return { ok: false, error: "Aucun mot de passe défini" };
    }

    const valid = await bcrypt.compare(currentPassword, fullUser.passwordHash);
    if (!valid) {
      return { ok: false, error: "Mot de passe actuel incorrect" };
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function toggleTwoFactorAction(enable: boolean) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Non autorisé" };

    await db.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: enable },
    });

    revalidatePath("/dashboard/reglages");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function revokeSessionAction(sessionId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Non autorisé" };

    const session = await db.session.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });
    if (!session || session.userId !== user.id) {
      return { ok: false, error: "Session introuvable" };
    }

    await db.session.delete({ where: { id: sessionId } });
    revalidatePath("/dashboard/reglages");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function updateNotificationPrefsAction(prefs: Record<string, boolean>) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Non autorisé" };

    await db.user.update({
      where: { id: user.id },
      data: { notificationPrefs: prefs as Prisma.InputJsonValue },
    });

    revalidatePath("/dashboard/reglages");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function deleteAccountAction(confirmEmail: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Non autorisé" };

    if (confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
      return { ok: false, error: "L'email de confirmation ne correspond pas à votre adresse" };
    }

    const cookieStore = await cookies();
    cookieStore.delete("sellia_session");

    await db.user.delete({ where: { id: user.id } });

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}
