"use client";

import styles from "./CategoryFilter.module.css";

interface Props {
  categories: string[];
  active: string;
  onChange: (cat: string) => void;
}

export default function CategoryFilter({
  categories,
  active,
  onChange,
}: Props) {
  const allCategories = [
    "Tous les produits",
    ...categories.filter(
      (c) =>
        c.toLowerCase() !== "tous" &&
        c.toLowerCase() !== "tous les produits"
    ),
  ];

  return (
    <div className={styles.filterWrap}>
      <div className={styles.filterScroll}>
        {allCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`${styles.pill} ${active === cat ? styles.pillActive : ""}`}
            onClick={() => onChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
