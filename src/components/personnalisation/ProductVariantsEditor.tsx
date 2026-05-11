"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  X,
  Trash2,
  Image as ImageIcon,
  Copy,
  Layers,
  AlertCircle,
} from "lucide-react";
import type { VariantAxisInput, VariantInput } from "@/lib/validations/personnalisation";
import styles from "./ProductVariantsEditor.module.css";

interface Props {
  productType: string;
  basePrice: number;
  globalStock: number | null;
  hasVariants: boolean;
  axes: VariantAxisInput[];
  variants: VariantInput[];
  onChange: (data: {
    hasVariants: boolean;
    axes: VariantAxisInput[];
    variants: VariantInput[];
  }) => void;
}

const AXIS_PRESETS = [
  { name: "Taille", suggestions: ["S", "M", "L", "XL", "XXL"], isColor: false },
  { name: "Couleur", suggestions: ["Noir", "Blanc", "Rouge", "Bleu", "Vert", "Beige"], isColor: true },
  { name: "Matériel", suggestions: ["Coton", "Lin", "Cuir", "Synthétique"], isColor: false },
  { name: "Style", suggestions: ["Casual", "Élégant", "Sport"], isColor: false },
] as const;

const DEFAULT_COLOR_MAP: Record<string, string> = {
  noir: "#0A0E13", blanc: "#FFFFFF", rouge: "#DC2626", bleu: "#1E40AF",
  vert: "#16A34A", beige: "#D6BFA0", jaune: "#F59E0B", rose: "#EC4899",
  violet: "#7C3AED", gris: "#6B7280", marron: "#78350F", orange: "#EA580C",
};

function generateCombinations(axes: VariantAxisInput[]): Record<string, string>[] {
  if (axes.length === 0) return [];
  if (axes.length === 1) return axes[0].values.map((v) => ({ [axes[0].name]: v }));
  const combos: Record<string, string>[] = [];
  for (const v1 of axes[0].values) {
    for (const v2 of axes[1].values) {
      combos.push({ [axes[0].name]: v1, [axes[1].name]: v2 });
    }
  }
  return combos;
}

function attributesKey(attrs: Record<string, string>): string {
  return Object.entries(attrs)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
}

function attributesToLabel(attrs: Record<string, string>): string {
  return Object.values(attrs).join(" / ");
}

export default function ProductVariantsEditor({
  productType,
  basePrice,
  globalStock,
  hasVariants,
  axes,
  variants,
  onChange,
}: Props) {
  const [bulkStock, setBulkStock] = useState("");
  const [bulkPriceDelta, setBulkPriceDelta] = useState("");

  if (productType !== "physical") {
    return (
      <div className={styles.notPhysicalNotice}>
        <AlertCircle size={16} strokeWidth={2.2} />
        <span>Les variantes sont disponibles uniquement pour les produits physiques.</span>
      </div>
    );
  }

  const handleToggle = (enabled: boolean) => {
    if (!enabled && (variants.length > 0 || axes.length > 0)) {
      if (!window.confirm("Supprimer toutes les variantes définies ?")) return;
    }
    onChange({ hasVariants: enabled, axes: enabled ? axes : [], variants: enabled ? variants : [] });
  };

  const handleAddAxis = (preset?: (typeof AXIS_PRESETS)[number]) => {
    if (axes.length >= 2) return;
    const newAxis: VariantAxisInput = {
      name: preset?.name ?? "",
      values: [],
      ...(preset?.isColor ? { swatches: [] } : {}),
    };
    onChange({ hasVariants, axes: [...axes, newAxis], variants });
  };

  const handleRemoveAxis = (i: number) => {
    onChange({ hasVariants, axes: axes.filter((_, idx) => idx !== i), variants: [] });
  };

  const handleRenameAxis = (i: number, name: string) => {
    const next = [...axes];
    next[i] = { ...next[i], name };
    onChange({ hasVariants, axes: next, variants });
  };

  const handleAddValue = (axisIdx: number, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const axis = axes[axisIdx];
    if (axis.values.includes(trimmed) || axis.values.length >= 20) return;
    const next = [...axes];
    const newSwatches = axis.swatches
      ? [...axis.swatches, DEFAULT_COLOR_MAP[trimmed.toLowerCase()] ?? "#8A8D95"]
      : undefined;
    next[axisIdx] = { ...axis, values: [...axis.values, trimmed], swatches: newSwatches };
    onChange({ hasVariants, axes: next, variants });
  };

  const handleRemoveValue = (axisIdx: number, valIdx: number) => {
    const next = [...axes];
    const axis = next[axisIdx];
    next[axisIdx] = {
      ...axis,
      values: axis.values.filter((_, i) => i !== valIdx),
      swatches: axis.swatches?.filter((_, i) => i !== valIdx),
    };
    onChange({ hasVariants, axes: next, variants });
  };

  const handleSwatchChange = (axisIdx: number, valIdx: number, hex: string) => {
    const next = [...axes];
    const axis = next[axisIdx];
    if (!axis.swatches) return;
    const sw = [...axis.swatches];
    sw[valIdx] = hex;
    next[axisIdx] = { ...axis, swatches: sw };
    onChange({ hasVariants, axes: next, variants });
  };

  const handleToggleSwatches = (axisIdx: number) => {
    const next = [...axes];
    const axis = next[axisIdx];
    next[axisIdx] = axis.swatches
      ? { ...axis, swatches: undefined }
      : { ...axis, swatches: axis.values.map((v) => DEFAULT_COLOR_MAP[v.toLowerCase()] ?? "#8A8D95") };
    onChange({ hasVariants, axes: next, variants });
  };

  const handleGenerate = () => {
    const combos = generateCombinations(axes);
    if (combos.length === 0) return;
    const existing = new Map(variants.map((v) => [attributesKey(v.attributes), v]));
    const next: VariantInput[] = combos.map((attrs, i) => {
      const key = attributesKey(attrs);
      return existing.get(key) ?? {
        attributes: attrs,
        label: attributesToLabel(attrs),
        stock: null,
        priceDelta: 0,
        imageUrl: null,
        sku: null,
        isActive: true,
        position: i,
      };
    });
    onChange({ hasVariants, axes, variants: next });
  };

  const handleVariantPatch = (i: number, patch: Partial<VariantInput>) => {
    const next = [...variants];
    next[i] = { ...next[i], ...patch };
    onChange({ hasVariants, axes, variants: next });
  };

  const handleRemoveVariant = (i: number) => {
    onChange({ hasVariants, axes, variants: variants.filter((_, idx) => idx !== i) });
  };

  const handleBulkStock = () => {
    const v = bulkStock.trim();
    if (!v) return;
    const stock = v === "null" ? null : Math.max(0, parseInt(v, 10));
    if (stock !== null && isNaN(stock)) return;
    onChange({ hasVariants, axes, variants: variants.map((vr) => ({ ...vr, stock })) });
    setBulkStock("");
  };

  const handleBulkDelta = () => {
    const v = bulkPriceDelta.trim();
    if (!v) return;
    const delta = parseInt(v, 10);
    if (isNaN(delta)) return;
    onChange({ hasVariants, axes, variants: variants.map((vr) => ({ ...vr, priceDelta: delta })) });
    setBulkPriceDelta("");
  };

  const totalCombos = useMemo(() => generateCombinations(axes).length, [axes]);
  const allAxesReady = axes.length > 0 && axes.every((a) => a.values.length > 0 && a.name.trim() !== "");
  const isStale = allAxesReady && totalCombos !== variants.length;

  return (
    <div className={styles.variantsEditor}>
      <div className={styles.toggleCard}>
        <div className={styles.toggleHeader}>
          <div className={styles.toggleIcon}>
            <Layers size={18} strokeWidth={2} />
          </div>
          <div className={styles.toggleText}>
            <h3 className={styles.toggleTitle}>Variantes du produit</h3>
            <p className={styles.toggleDesc}>
              Active si ce produit existe en plusieurs versions (tailles, couleurs…)
            </p>
          </div>
          <label className={styles.switch}>
            <input type="checkbox" checked={hasVariants} onChange={(e) => handleToggle(e.target.checked)} />
            <span className={styles.slider} />
          </label>
        </div>
      </div>

      {hasVariants && (
        <>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.stepBadge}>1</span>
              <div>
                <h4 className={styles.sectionTitle}>Critères de différenciation</h4>
                <p className={styles.sectionDesc}>Choisis jusqu'à 2 critères (ex : Taille et Couleur)</p>
              </div>
            </div>

            <div className={styles.axesList}>
              {axes.map((axis, ai) => (
                <AxisEditor
                  key={ai}
                  axis={axis}
                  onRename={(n) => handleRenameAxis(ai, n)}
                  onAddValue={(v) => handleAddValue(ai, v)}
                  onRemoveValue={(vi) => handleRemoveValue(ai, vi)}
                  onSwatchChange={(vi, hex) => handleSwatchChange(ai, vi, hex)}
                  onToggleSwatches={() => handleToggleSwatches(ai)}
                  onRemoveAxis={() => handleRemoveAxis(ai)}
                />
              ))}
            </div>

            {axes.length < 2 && (
              <div className={styles.axisPresets}>
                <span className={styles.axisPresetsLabel}>Ajouter un critère :</span>
                {AXIS_PRESETS.filter((p) => !axes.some((a) => a.name === p.name)).map((preset) => (
                  <button key={preset.name} type="button" className={styles.axisPresetBtn} onClick={() => handleAddAxis(preset)}>
                    <Plus size={13} strokeWidth={2.4} />
                    {preset.name}
                  </button>
                ))}
                <button type="button" className={styles.axisPresetBtnGhost} onClick={() => handleAddAxis()}>
                  + Personnalisé
                </button>
              </div>
            )}
          </section>

          {allAxesReady && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.stepBadge}>2</span>
                <div className={styles.sectionHeaderText}>
                  <h4 className={styles.sectionTitle}>
                    {totalCombos} combinaison{totalCombos > 1 ? "s" : ""}
                  </h4>
                  <p className={styles.sectionDesc}>
                    {variants.length === 0
                      ? "Clique pour générer la grille"
                      : isStale
                        ? "Critères modifiés — régénère pour appliquer"
                        : "Personnalise stock, prix et image par variante"}
                  </p>
                </div>
                <button type="button" className={styles.generateBtn} onClick={handleGenerate}>
                  {variants.length === 0 ? "Générer" : "Régénérer"}
                </button>
              </div>

              {variants.length > 0 && (
                <div className={styles.bulkActions}>
                  <span className={styles.bulkLabel}>
                    <Copy size={13} strokeWidth={2.2} /> Actions groupées
                  </span>
                  <div className={styles.bulkRow}>
                    <input type="number" min="0" className={styles.bulkInput} placeholder="Stock" value={bulkStock} onChange={(e) => setBulkStock(e.target.value)} />
                    <button type="button" className={styles.bulkApplyBtn} onClick={handleBulkStock} disabled={!bulkStock.trim()}>Appliquer à toutes</button>
                  </div>
                  <div className={styles.bulkRow}>
                    <input type="number" className={styles.bulkInput} placeholder="+/- FCFA" value={bulkPriceDelta} onChange={(e) => setBulkPriceDelta(e.target.value)} />
                    <button type="button" className={styles.bulkApplyBtn} onClick={handleBulkDelta} disabled={!bulkPriceDelta.trim()}>Appliquer à toutes</button>
                  </div>
                </div>
              )}

              {variants.length > 0 && (
                <div className={styles.variantsGrid}>
                  <div className={styles.variantsGridHeader}>
                    <span>Variante</span>
                    <span>Stock</span>
                    <span>Prix</span>
                    <span>Image</span>
                    <span />
                  </div>
                  {variants.map((variant, i) => (
                    <VariantRow
                      key={i}
                      variant={variant}
                      basePrice={basePrice}
                      globalStock={globalStock}
                      axes={axes}
                      onChange={(patch) => handleVariantPatch(i, patch)}
                      onRemove={() => handleRemoveVariant(i)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}

/* ========== AxisEditor ========== */

function AxisEditor({
  axis,
  onRename,
  onAddValue,
  onRemoveValue,
  onSwatchChange,
  onToggleSwatches,
  onRemoveAxis,
}: {
  axis: VariantAxisInput;
  onRename: (n: string) => void;
  onAddValue: (v: string) => void;
  onRemoveValue: (i: number) => void;
  onSwatchChange: (i: number, hex: string) => void;
  onToggleSwatches: () => void;
  onRemoveAxis: () => void;
}) {
  const [newVal, setNewVal] = useState("");
  const submit = () => {
    if (!newVal.trim()) return;
    onAddValue(newVal);
    setNewVal("");
  };

  return (
    <div className={styles.axisCard}>
      <div className={styles.axisHeader}>
        <input
          type="text"
          className={styles.axisNameInput}
          placeholder="Ex : Taille, Couleur…"
          value={axis.name}
          onChange={(e) => onRename(e.target.value)}
          maxLength={40}
        />
        <label className={styles.axisColorToggle}>
          <input type="checkbox" checked={!!axis.swatches} onChange={onToggleSwatches} />
          <span>Couleurs visuelles</span>
        </label>
        <button type="button" className={styles.axisDeleteBtn} onClick={onRemoveAxis} aria-label="Supprimer">
          <Trash2 size={14} strokeWidth={2.2} />
        </button>
      </div>

      <div className={styles.axisValues}>
        {axis.values.map((val, vi) => (
          <div key={vi} className={styles.valueTag}>
            {axis.swatches && (
              <span className={styles.valueSwatch} style={{ backgroundColor: axis.swatches[vi] }}>
                <input type="color" value={axis.swatches[vi]} onChange={(e) => onSwatchChange(vi, e.target.value)} className={styles.valueSwatchInput} />
              </span>
            )}
            <span className={styles.valueLabel}>{val}</span>
            <button type="button" className={styles.valueRemove} onClick={() => onRemoveValue(vi)} aria-label={`Retirer ${val}`}>
              <X size={11} strokeWidth={2.5} />
            </button>
          </div>
        ))}
        <div className={styles.valueAdd}>
          <input
            type="text"
            className={styles.valueAddInput}
            placeholder="Ajouter + Entrée"
            value={newVal}
            onChange={(e) => setNewVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }}
            maxLength={40}
          />
          {newVal.trim() && (
            <button type="button" className={styles.valueAddBtn} onClick={submit}>
              <Plus size={13} strokeWidth={2.4} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ========== VariantRow ========== */

function VariantRow({
  variant,
  basePrice,
  globalStock,
  axes,
  onChange,
  onRemove,
}: {
  variant: VariantInput;
  basePrice: number;
  globalStock: number | null;
  axes: VariantAxisInput[];
  onChange: (patch: Partial<VariantInput>) => void;
  onRemove: () => void;
}) {
  const finalPrice = basePrice + variant.priceDelta;
  const isInherited = variant.stock == null;
  const colorAxis = axes.find((a) => a.swatches);
  const colorVal = colorAxis ? variant.attributes[colorAxis.name] : null;
  const colorIdx = colorAxis ? colorAxis.values.indexOf(colorVal ?? "") : -1;
  const swatchHex = colorAxis?.swatches?.[colorIdx];

  return (
    <div className={styles.variantRow}>
      <div className={styles.variantLabel}>
        {swatchHex && <span className={styles.variantSwatch} style={{ backgroundColor: swatchHex }} />}
        <span className={styles.variantLabelText}>{variant.label}</span>
      </div>

      <div className={styles.variantField}>
        <input
          type="number"
          min="0"
          className={styles.variantInput}
          placeholder={isInherited ? `${globalStock ?? 0} (global)` : ""}
          value={variant.stock ?? ""}
          onChange={(e) => onChange({ stock: e.target.value === "" ? null : Math.max(0, parseInt(e.target.value, 10) || 0) })}
        />
        {!isInherited && (
          <button type="button" className={styles.variantInheritBtn} onClick={() => onChange({ stock: null })} title="Hériter du stock global">↺</button>
        )}
      </div>

      <div className={styles.variantField}>
        <input
          type="number"
          className={styles.variantInput}
          placeholder="+/- 0"
          value={variant.priceDelta === 0 ? "" : variant.priceDelta}
          onChange={(e) => onChange({ priceDelta: e.target.value === "" ? 0 : parseInt(e.target.value, 10) || 0 })}
        />
        <span className={styles.variantPriceHint}>= {finalPrice.toLocaleString("fr-FR")} FCFA</span>
      </div>

      <div className={styles.variantField}>
        <button
          type="button"
          className={styles.variantImageBtn}
          onClick={() => {
            const url = prompt("URL de l'image :", variant.imageUrl ?? "");
            if (url !== null) onChange({ imageUrl: url.trim() || null });
          }}
        >
          {variant.imageUrl ? <img src={variant.imageUrl} alt="" className={styles.variantImageThumb} /> : <ImageIcon size={16} strokeWidth={2} />}
        </button>
      </div>

      <button type="button" className={styles.variantRemoveBtn} onClick={onRemove} aria-label="Supprimer">
        <Trash2 size={14} strokeWidth={2.2} />
      </button>
    </div>
  );
}
