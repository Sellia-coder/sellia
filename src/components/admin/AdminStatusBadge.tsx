import type { AdminBadgeVariant } from "@/lib/admin/status-badges";

export default function AdminStatusBadge({
  label,
  variant,
}: {
  label: string;
  variant: AdminBadgeVariant;
}) {
  return (
    <span className={`admin-badge admin-badge--${variant}`}>{label}</span>
  );
}
