import Link from "next/link";

export default function AdminPagination({
  page,
  totalPages,
  prevHref,
  nextHref,
}: {
  page: number;
  totalPages: number;
  prevHref?: string;
  nextHref?: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="admin-pagination">
      {prevHref ? (
        <Link href={prevHref} className="admin-btn admin-btn--sm">
          ← Précédent
        </Link>
      ) : null}
      <span className="admin-pagination-info">
        Page {page} / {totalPages}
      </span>
      {nextHref ? (
        <Link href={nextHref} className="admin-btn admin-btn--sm">
          Suivant →
        </Link>
      ) : null}
    </div>
  );
}
