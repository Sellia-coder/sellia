"use client";

import { useState } from "react";
import { X } from "@phosphor-icons/react";
import { createPageAction, updatePageAction } from "@/app/actions/shop-pages";
import SuccessModal from "@/components/dashboard/SuccessModal";
import styles from "./pages.module.css";

interface PageRow {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaDescription: string | null;
  isPublished: boolean;
  showInHeader: boolean;
  showInFooter: boolean;
}

interface Props {
  page: PageRow | null;
  onClose: () => void;
  onSaved: () => void;
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function PageEditorModal({ page, onClose, onSaved }: Props) {
  const isEdit = !!page;
  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [content, setContent] = useState(page?.content ?? "");
  const [metaDescription, setMetaDescription] = useState(
    page?.metaDescription ?? ""
  );
  const [isPublished, setIsPublished] = useState(page?.isPublished ?? false);
  const [showInHeader, setShowInHeader] = useState(page?.showInHeader ?? false);
  const [showInFooter, setShowInFooter] = useState(page?.showInFooter ?? true);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!isEdit && !slug) setSlug(slugify(v));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    const payload = {
      slug: slug || slugify(title),
      title,
      content,
      metaDescription: metaDescription || undefined,
      isPublished,
      showInHeader,
      showInFooter,
    };
    const res = isEdit
      ? await updatePageAction(page!.id, payload)
      : await createPageAction(payload);
    setSaving(false);
    if (res.ok) setShowSuccess(true);
    else setError(res.error ?? "Erreur");
  };

  return (
    <>
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalWide} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {isEdit ? "Modifier la page" : "Nouvelle page"}
          </h2>
          <button type="button" onClick={onClose} className={styles.actionBtn}>
            <X size={18} weight="bold" />
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.field}>
            <label>Titre</label>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="À propos"
            />
          </div>
          <div className={styles.field}>
            <label>URL (slug)</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="a-propos"
              disabled={isEdit}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <button
              type="button"
              onClick={() => setPreview((p) => !p)}
              className={styles.btnSecondary}
            >
              {preview ? "Éditer" : "Aperçu"}
            </button>
          </div>
          <div className={styles.field}>
            <label>Contenu (Markdown)</label>
            {preview ? (
              <div
                style={{
                  padding: 16,
                  background: "var(--sellia-ivory)",
                  borderRadius: 10,
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {content}
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
              />
            )}
          </div>
          <div className={styles.field}>
            <label>Meta description (SEO)</label>
            <input
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              maxLength={160}
            />
          </div>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            Publiée
          </label>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={showInHeader}
              onChange={(e) => setShowInHeader(e.target.checked)}
            />
            Afficher dans le header
          </label>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={showInFooter}
              onChange={(e) => setShowInFooter(e.target.checked)}
            />
            Afficher dans le footer
          </label>
          {error && <div className={styles.errorBox}>{error}</div>}
        </div>
        <div className={styles.modalFooter}>
          <button type="button" onClick={onClose} className={styles.btnSecondary}>
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !title.trim()}
            className={styles.btnPrimary}
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
    {showSuccess && (
      <SuccessModal
        title={isEdit ? "Page enregistrée" : "Page créée"}
        description="Votre contenu a été sauvegardé avec succès."
        onClose={() => {
          setShowSuccess(false);
          onSaved();
        }}
      />
    )}
    </>
  );
}
