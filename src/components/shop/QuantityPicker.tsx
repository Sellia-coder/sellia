"use client";

import { Minus, Plus } from "lucide-react";

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export default function QuantityPicker({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
}: Props) {
  return (
    <div className={`shop-qty ${disabled ? "is-disabled" : ""}`}>
      <button
        type="button"
        className="shop-qty-btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        aria-label="Diminuer la quantité"
      >
        <Minus size={14} strokeWidth={2.5} />
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
        }}
        className="shop-qty-input"
        min={min}
        max={max}
        disabled={disabled}
      />
      <button
        type="button"
        className="shop-qty-btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label="Augmenter la quantité"
      >
        <Plus size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}
