import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminSignalementsPage() {
  const reports = await db.productReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      product: { select: { name: true } },
      shop: { select: { name: true, slug: true } },
    },
  });

  const REASON_LABELS: Record<string, string> = {
    COUNTERFEIT: "Contrefaçon",
    INAPPROPRIATE: "Inapproprié",
    MISLEADING: "Trompeur",
    SCAM: "Arnaque",
    PROHIBITED: "Interdit",
    OTHER: "Autre",
  };

  return (
    <div>
      <h1
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: "28px",
          color: "#0E1116",
          marginBottom: "8px",
        }}
      >
        Signalements
      </h1>
      <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px" }}>
        {reports.length} signalement(s)
      </p>

      {reports.length === 0 ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "#9CA3AF",
            background: "white",
            borderRadius: "12px",
            border: "1px solid #E5E5E0",
          }}
        >
          Aucun signalement pour le moment
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {reports.map((r) => (
            <div
              key={r.id}
              style={{
                background: "white",
                border: "1px solid #E5E5E0",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <strong style={{ fontSize: "14px", color: "#0E1116" }}>
                  {r.product.name}
                </strong>
                <span
                  style={{
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    background: "#FEE2E2",
                    color: "#B91C1C",
                    fontWeight: 600,
                  }}
                >
                  {REASON_LABELS[r.reason] || r.reason}
                </span>
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#6B7280",
                  marginBottom: "8px",
                }}
              >
                Boutique : {r.shop.name} ·{" "}
                {new Date(r.createdAt).toLocaleDateString("fr-FR")} · Statut :{" "}
                {r.status}
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "#404552",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {r.description}
              </p>
              {r.reporterEmail && (
                <div
                  style={{
                    fontSize: "11px",
                    color: "#9CA3AF",
                    marginTop: "6px",
                  }}
                >
                  Signalé par : {r.reporterName || "Anonyme"} ({r.reporterEmail})
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
