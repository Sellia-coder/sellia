import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  items: Crumb[];
}

export default function Breadcrumbs({ items }: Props) {
  return (
    <nav className="shop-breadcrumbs" aria-label={`Fil d'Ariane`}>
      <ol>
        {items.map((item, idx) => (
          <li key={idx} className="shop-breadcrumb-item">
            {item.href ? (
              <Link href={item.href}>
                {idx === 0 ? (
                  <Home size={11} strokeWidth={2} />
                ) : (
                  item.label
                )}
                {idx === 0 && <span className="shop-sr-only">{item.label}</span>}
              </Link>
            ) : (
              <span className="shop-breadcrumb-current">{item.label}</span>
            )}
            {idx < items.length - 1 && (
              <ChevronRight size={11} strokeWidth={2} className="shop-breadcrumb-sep" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
