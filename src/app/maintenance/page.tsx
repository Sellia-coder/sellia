import { getPlatformSettings } from "@/lib/admin/platform-settings";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const settings = await getPlatformSettings();

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        background: "#FAFAF7",
        color: "#0E1116",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <h1
          style={{
            fontFamily: "Manrope, sans-serif",
            fontSize: 32,
            marginBottom: 16,
          }}
        >
          Maintenance
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: "#6B7280" }}>
          {settings.maintenanceMessage}
        </p>
      </div>
    </main>
  );
}
