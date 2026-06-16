"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { logAdminAction } from "@/lib/admin/audit-log";
import {
  upsertPlatformSettings,
  getPlatformSettings,
  type PlatformSettingsData,
} from "@/lib/admin/platform-settings";
import {
  syncPublicMaintenanceCookie,
  invalidateMaintenanceCache,
} from "@/lib/maintenance/public";
import { requireSuperAdmin } from "@/lib/auth/admin";
import {
  invalidateMoneyConfigCache,
  refreshMoneyConfigCache,
  resolveEffectiveMoneyConfig,
  validateMoneySettingsInput,
  type MoneySettingsInput,
  MONEY_DEFAULTS,
} from "@/lib/admin/money-config";

export async function adminUpdatePlatformSettingsAction(
  input: Partial<PlatformSettingsData>
) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "Non autorisé" };

  const sanitized: Partial<PlatformSettingsData> = {};

  if (typeof input.maintenanceMode === "boolean") {
    sanitized.maintenanceMode = input.maintenanceMode;
  }
  if (typeof input.maintenanceMessage === "string") {
    sanitized.maintenanceMessage = input.maintenanceMessage.slice(0, 2000);
  }
  if (typeof input.registrationsOpen === "boolean") {
    sanitized.registrationsOpen = input.registrationsOpen;
  }
  if (typeof input.shopCreationOpen === "boolean") {
    sanitized.shopCreationOpen = input.shopCreationOpen;
  }
  if (typeof input.merchantBannerEnabled === "boolean") {
    sanitized.merchantBannerEnabled = input.merchantBannerEnabled;
  }
  if (typeof input.merchantBannerMessage === "string") {
    sanitized.merchantBannerMessage = input.merchantBannerMessage.slice(0, 500);
  }
  if (typeof input.supportEmail === "string") {
    sanitized.supportEmail = input.supportEmail.trim().slice(0, 200);
  }
  if (typeof input.supportPhone === "string") {
    sanitized.supportPhone = input.supportPhone.trim().slice(0, 40);
  }
  if (typeof input.adminNotifyEmail === "string") {
    sanitized.adminNotifyEmail = input.adminNotifyEmail.trim().slice(0, 200);
  }

  const updated = await upsertPlatformSettings(sanitized);
  invalidateMaintenanceCache();
  await syncPublicMaintenanceCookie(updated.maintenanceMode);

  revalidatePath("/admin/parametres");
  revalidatePath("/dashboard");

  await logAdminAction({
    admin,
    action: "platform.settings",
    targetType: "platform_settings",
    targetId: "default",
    details: { champsModifies: Object.keys(sanitized) },
  });

  return { ok: true as const };
}

export async function adminUpdateMoneySettingsAction(
  input: MoneySettingsInput
) {
  const admin = await requireSuperAdmin();
  if (!admin) return { ok: false as const, error: "Réservé au super administrateur" };

  const validated = validateMoneySettingsInput(input);
  if (!validated.ok) return { ok: false as const, error: validated.error };

  const beforeSettings = await getPlatformSettings();
  const before = resolveEffectiveMoneyConfig(beforeSettings);

  const updated = await upsertPlatformSettings(validated.data);
  invalidateMoneyConfigCache();
  await refreshMoneyConfigCache();
  const after = resolveEffectiveMoneyConfig(updated);

  revalidatePath("/admin/parametres");
  revalidatePath("/dashboard");

  await logAdminAction({
    admin,
    action: "platform.money_settings",
    targetType: "platform_settings",
    targetId: "default",
    details: {
      avant: {
        commissions: before.commissionRates,
        seuilRetrait: before.withdrawalValidationThreshold,
        prixCod: before.codUnlockPrice,
      },
      apres: {
        commissions: after.commissionRates,
        seuilRetrait: after.withdrawalValidationThreshold,
        prixCod: after.codUnlockPrice,
      },
    },
  });

  return { ok: true as const };
}

export async function adminResetMoneySettingsAction() {
  const admin = await requireSuperAdmin();
  if (!admin) return { ok: false as const, error: "Réservé au super administrateur" };

  const beforeSettings = await getPlatformSettings();
  const before = resolveEffectiveMoneyConfig(beforeSettings);

  const updated = await upsertPlatformSettings({
    commissionRateFree: null,
    commissionRatePro: null,
    commissionRateBusiness: null,
    withdrawalValidationThreshold: null,
    codUnlockPrice: null,
  });
  invalidateMoneyConfigCache();
  await refreshMoneyConfigCache();

  revalidatePath("/admin/parametres");
  revalidatePath("/dashboard");

  await logAdminAction({
    admin,
    action: "platform.money_settings_reset",
    targetType: "platform_settings",
    targetId: "default",
    details: {
      avant: {
        commissions: before.commissionRates,
        seuilRetrait: before.withdrawalValidationThreshold,
        prixCod: before.codUnlockPrice,
      },
      apres: {
        commissions: MONEY_DEFAULTS.commissionRates,
        seuilRetrait: MONEY_DEFAULTS.withdrawalValidationThreshold,
        prixCod: MONEY_DEFAULTS.codUnlockPrice,
      },
    },
  });

  return { ok: true as const, settings: updated };
}
