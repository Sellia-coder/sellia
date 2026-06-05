"use client";

export default function AdminExportButton({
  resource,
  label = "Exporter CSV",
}: {
  resource: "boutiques" | "transactions" | "retraits" | "utilisateurs";
  label?: string;
}) {
  return (
    <a
      href={`/api/admin/export/${resource}`}
      className="admin-btn admin-btn--ghost admin-btn--sm"
      download
    >
      {label}
    </a>
  );
}
