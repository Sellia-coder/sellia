"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  UploadSimple,
  FileText,
  Check,
  WarningOctagon,
  DownloadSimple,
} from "@phosphor-icons/react";
import styles from "./import-csv-modal.module.css";

interface Props {
  onClose: () => void;
}

interface ImportResult {
  total: number;
  created: number;
  errors: Array<{ row: number; error: string }>;
}

const CSV_TEMPLATE = `nom,prix,prix_barre,description,categorie,stock,sku
Bague en or,25000,30000,Bague en or 18 carats,Bijoux,10,BAG-001
Robe wax,15000,,Robe traditionnelle wax,Mode,5,ROBE-001`;

export default function ImportCsvModal({ onClose }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.name.endsWith(".csv")) {
      setError("Veuillez sélectionner un fichier .csv");
      return;
    }

    if (f.size > 2 * 1024 * 1024) {
      setError("Fichier trop volumineux (max 2MB)");
      return;
    }

    setFile(f);
    setError(null);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/dashboard/products/import-csv", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'import");
        return;
      }

      setResult(data);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Problème réseau");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sellia-template-produits.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Importer des produits</h2>
            <p className={styles.subtitle}>
              Ajoutez plusieurs produits d&apos;un coup avec un fichier CSV.
            </p>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className={styles.body}>
          {!result && (
            <>
              <div className={styles.templateCard}>
                <div className={styles.templateIcon}>
                  <FileText size={18} weight="duotone" />
                </div>
                <div className={styles.templateText}>
                  <strong>Téléchargez le modèle CSV</strong>
                  <span>
                    Format requis : nom, prix, prix_barre, description, categorie,
                    stock, sku
                  </span>
                </div>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className={styles.templateBtn}
                >
                  <DownloadSimple size={14} weight="bold" /> Modèle
                </button>
              </div>

              <div className={styles.uploadZone}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
                {!file ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={styles.uploadBtn}
                  >
                    <UploadSimple size={22} weight="bold" />
                    <strong>Cliquez pour choisir un fichier CSV</strong>
                    <span>Max 2 MB · 200 produits par import</span>
                  </button>
                ) : (
                  <div className={styles.filePreview}>
                    <FileText size={20} weight="duotone" />
                    <div className={styles.filePreviewInfo}>
                      <strong>{file.name}</strong>
                      <span>{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className={styles.filePreviewRemove}
                    >
                      <X size={14} weight="bold" />
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className={styles.errorBox}>
                  <WarningOctagon size={14} weight="duotone" /> {error}
                </div>
              )}
            </>
          )}

          {result && (
            <div className={styles.resultBox}>
              <div className={styles.resultIcon}>
                <Check size={28} weight="bold" />
              </div>
              <h3>Import terminé</h3>
              <p>
                <strong>{result.created}</strong> produit
                {result.created > 1 ? "s" : ""} créé
                {result.created > 1 ? "s" : ""} sur {result.total} ligne
                {result.total > 1 ? "s" : ""}.
              </p>

              {result.errors.length > 0 && (
                <div className={styles.errorList}>
                  <strong>
                    {result.errors.length} erreur
                    {result.errors.length > 1 ? "s" : ""} :
                  </strong>
                  <ul>
                    {result.errors.slice(0, 10).map((e, idx) => (
                      <li key={idx}>
                        Ligne {e.row} : {e.error}
                      </li>
                    ))}
                    {result.errors.length > 10 && (
                      <li>
                        ... et {result.errors.length - 10} autre
                        {result.errors.length - 10 > 1 ? "s" : ""}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {!result ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className={styles.btnSecondary}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || uploading}
                className={styles.btnPrimary}
              >
                {uploading ? "Import en cours..." : "Lancer l'import"}
              </button>
            </>
          ) : (
            <button type="button" onClick={onClose} className={styles.btnPrimary}>
              Terminer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
