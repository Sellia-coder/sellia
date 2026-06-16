import Link from "next/link";

export default function AdminShopLink({
  shopId,
  name,
  slug,
  className = "admin-table-link",
}: {
  shopId: string;
  name: string;
  slug?: string;
  className?: string;
}) {
  return (
    <Link href={`/admin/boutiques/${shopId}`} className={className}>
      {name}
      {slug ? (
        <span className="admin-muted-text" style={{ display: "block" }}>
          {slug}
        </span>
      ) : null}
    </Link>
  );
}
