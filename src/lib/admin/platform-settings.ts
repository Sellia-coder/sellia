import { db } from "@/lib/db";

export type PlatformSettingsData = {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  registrationsOpen: boolean;
  shopCreationOpen: boolean;
  merchantBannerEnabled: boolean;
  merchantBannerMessage: string;
  supportEmail: string;
  supportPhone: string;
  adminNotifyEmail: string;
};

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettingsData = {
  maintenanceMode: false,
  maintenanceMessage:
    "Sellia est en maintenance. Nous revenons très vite.",
  registrationsOpen: true,
  shopCreationOpen: true,
  merchantBannerEnabled: false,
  merchantBannerMessage: "",
  supportEmail: "support@getsellia.com",
  supportPhone: "",
  adminNotifyEmail: "",
};

const SETTINGS_ID = "default";

function rowToData(row: {
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  registrationsOpen: boolean;
  shopCreationOpen: boolean;
  merchantBannerEnabled: boolean;
  merchantBannerMessage: string | null;
  supportEmail: string | null;
  supportPhone: string | null;
  adminNotifyEmail: string | null;
}): PlatformSettingsData {
  return {
    maintenanceMode: row.maintenanceMode,
    maintenanceMessage:
      row.maintenanceMessage?.trim() || DEFAULT_PLATFORM_SETTINGS.maintenanceMessage,
    registrationsOpen: row.registrationsOpen,
    shopCreationOpen: row.shopCreationOpen,
    merchantBannerEnabled: row.merchantBannerEnabled,
    merchantBannerMessage: row.merchantBannerMessage?.trim() ?? "",
    supportEmail: row.supportEmail?.trim() || DEFAULT_PLATFORM_SETTINGS.supportEmail,
    supportPhone: row.supportPhone?.trim() ?? "",
    adminNotifyEmail: row.adminNotifyEmail?.trim() ?? "",
  };
}

/** Lecture fail-safe : défauts si table absente ou vide. */
export async function getPlatformSettings(): Promise<PlatformSettingsData> {
  try {
    const row = await db.platformSettings.findUnique({
      where: { id: SETTINGS_ID },
    });
    if (!row) return { ...DEFAULT_PLATFORM_SETTINGS };
    return rowToData(row);
  } catch {
    return { ...DEFAULT_PLATFORM_SETTINGS };
  }
}

export async function upsertPlatformSettings(
  input: Partial<PlatformSettingsData>
): Promise<PlatformSettingsData> {
  const current = await getPlatformSettings();
  const merged: PlatformSettingsData = { ...current, ...input };

  const row = await db.platformSettings.upsert({
    where: { id: SETTINGS_ID },
    create: {
      id: SETTINGS_ID,
      maintenanceMode: merged.maintenanceMode,
      maintenanceMessage: merged.maintenanceMessage,
      registrationsOpen: merged.registrationsOpen,
      shopCreationOpen: merged.shopCreationOpen,
      merchantBannerEnabled: merged.merchantBannerEnabled,
      merchantBannerMessage: merged.merchantBannerMessage,
      supportEmail: merged.supportEmail,
      supportPhone: merged.supportPhone,
      adminNotifyEmail: merged.adminNotifyEmail,
    },
    update: {
      maintenanceMode: merged.maintenanceMode,
      maintenanceMessage: merged.maintenanceMessage,
      registrationsOpen: merged.registrationsOpen,
      shopCreationOpen: merged.shopCreationOpen,
      merchantBannerEnabled: merged.merchantBannerEnabled,
      merchantBannerMessage: merged.merchantBannerMessage,
      supportEmail: merged.supportEmail,
      supportPhone: merged.supportPhone,
      adminNotifyEmail: merged.adminNotifyEmail,
    },
  });

  return rowToData(row);
}
