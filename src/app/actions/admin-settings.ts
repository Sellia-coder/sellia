"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import {
  upsertPlatformSettings,
  type PlatformSettingsData,
} from "@/lib/admin/platform-settings";

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

  await upsertPlatformSettings(sanitized);

  revalidatePath("/admin/parametres");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
