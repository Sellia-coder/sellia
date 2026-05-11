"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { COUNTRIES } from "@/lib/validations/personnalisation";
import CountryFlag from "./CountryFlag";
import styles from "./CountrySelect.module.css";

interface Props {
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function CountrySelect({
  value,
  onChange,
  placeholder = "Sélectionner un pays",
  disabled = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isOpen]);

  const selected = COUNTRIES.find((c) => c.code === value);

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ""} ${disabled ? styles.triggerDisabled : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selected ? (
          <>
            <CountryFlag code={selected.code} size="md" />
            <span className={styles.triggerLabel}>{selected.name}</span>
          </>
        ) : (
          <span className={styles.triggerPlaceholder}>{placeholder}</span>
        )}
        <ChevronDown size={16} strokeWidth={2.2} className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`} />
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="listbox">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              type="button"
              className={`${styles.option} ${value === c.code ? styles.optionActive : ""}`}
              onClick={() => { onChange(c.code); setIsOpen(false); }}
              role="option"
              aria-selected={value === c.code}
            >
              <CountryFlag code={c.code} size="md" />
              <span className={styles.optionLabel}>{c.name}</span>
              {value === c.code && <Check size={14} strokeWidth={2.5} className={styles.optionCheck} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
