"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Article,
  Question,
  PencilSimple,
  Trash,
  Eye,
  EyeSlash,
  ArrowSquareOut,
  CheckCircle,
  BookOpen,
  Phone,
  FileText,
  Truck,
  ArrowUUpLeft,
} from "@phosphor-icons/react";
import {
  createPageFromTemplateAction,
  deletePageAction,
  updatePageAction,
  deleteFaqAction,
} from "@/app/actions/shop-pages";
import PageEditorModal from "./PageEditorModal";
import FaqEditorModal from "./FaqEditorModal";
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
  templateKey: string | null;
  createdAt: string;
}

interface FaqRow {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  order: number;
  isPublished: boolean;
}

interface Props {
  shopSlug: string;
  pages: PageRow[];
  faqs: FaqRow[];
}

const TEMPLATES = [
  { key: "about", title: "À propos", icon: BookOpen, color: "#9333EA", description: "Présentez votre boutique" },
  { key: "contact", title: "Contact", icon: Phone, color: "#1D4ED8", description: "Coordonnées et horaires" },
  { key: "cgv", title: "CGV", icon: FileText, color: "#0A0E13", description: "Conditions générales" },
  { key: "shipping", title: "Livraison", icon: Truck, color: "#15803D", description: "Modes et délais" },
  { key: "returns", title: "Retours", icon: ArrowUUpLeft, color: "#DC2626", description: "Politique de retour" },
];

export default function PagesClient({ shopSlug, pages, faqs }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"pages" | "faq">("pages");
  const [editingPage, setEditingPage] = useState<PageRow | null | "new">(null);
  const [editingFaq, setEditingFaq] = useState<FaqRow | null | "new">(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const existingTemplateKeys = new Set(
    pages.map((p) => p.templateKey).filter(Boolean)
  );

  const handleCreateFromTemplate = async (templateKey: string) => {
    setBusyId(templateKey);
    const res = await createPageFromTemplateAction(templateKey);
    if (res.ok) router.refresh();
    else alert(res.error ?? "Erreur");
    setBusyId(null);
  };

  const handleDeletePage = async (page: PageRow) => {
    if (!confirm(`Supprimer la page "${page.title}" ?`)) return;
    setBusyId(page.id);
    await deletePageAction(page.id);
    router.refresh();
    setBusyId(null);
  };

  const handleTogglePublish = async (page: PageRow) => {
    setBusyId(page.id);
    await updatePageAction(page.id, { isPublished: !page.isPublished });
    router.refresh();
    setBusyId(null);
  };

  const handleDeleteFaq = async (faq: FaqRow) => {
    if (!confirm("Supprimer cette question ?")) return;
    setBusyId(faq.id);
    await deleteFaqAction(faq.id);
    router.refresh();
    setBusyId(null);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>— BOUTIQUE</span>
        <h1 className={styles.title}>Pages & Contenu</h1>
        <p className={styles.subtitle}>
          Créez les pages essentielles de votre boutique : À propos, Contact,
          CGV, FAQ et plus.
        </p>
      </div>

      <div className={styles.tabs}>
        <button
          type="button"
          onClick={() => setActiveTab("pages")}
          className={`${styles.tab} ${activeTab === "pages" ? styles.tabActive : ""}`}
        >
          <Article size={14} weight="duotone" /> Pages
          <span className={styles.tabCount}>{pages.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("faq")}
          className={`${styles.tab} ${activeTab === "faq" ? styles.tabActive : ""}`}
        >
          <Question size={14} weight="duotone" /> Questions fréquentes
          <span className={styles.tabCount}>{faqs.length}</span>
        </button>
      </div>

      {activeTab === "pages" && (
        <>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Modèles prédéfinis</h2>
                <p className={styles.sectionSubtitle}>
                  Démarrez avec une page pré-remplie que vous pourrez
                  personnaliser.
                </p>
              </div>
            </div>
            <div className={styles.templatesGrid}>
              {TEMPLATES.map((t) => {
                const exists = existingTemplateKeys.has(t.key);
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => !exists && handleCreateFromTemplate(t.key)}
                    disabled={exists || busyId === t.key}
                    className={`${styles.templateCard} ${exists ? styles.templateExists : ""}`}
                  >
                    <div
                      className={styles.templateIcon}
                      style={{ background: `${t.color}15`, color: t.color }}
                    >
                      <Icon size={22} weight="duotone" />
                    </div>
                    <div>
                      <div className={styles.templateTitle}>{t.title}</div>
                      <div className={styles.templateDescription}>
                        {t.description}
                      </div>
                      {exists ? (
                        <span className={styles.templateBadge}>
                          <CheckCircle size={12} weight="fill" /> Créée
                        </span>
                      ) : (
                        <span className={styles.templateCta}>+ Créer</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Toutes mes pages</h2>
                <p className={styles.sectionSubtitle}>
                  Modifiez, publiez ou créez de nouvelles pages.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingPage("new")}
                className={styles.btnPrimary}
              >
                <Plus size={15} weight="bold" /> Nouvelle page
              </button>
            </div>

            {pages.length === 0 ? (
              <div className={styles.emptyState}>
                <Article size={56} weight="duotone" color="var(--sellia-subtle)" />
                <h3>Aucune page</h3>
                <p>Démarrez avec un modèle ou créez une page personnalisée.</p>
              </div>
            ) : (
              <div className={styles.pagesList}>
                {pages.map((p) => (
                  <div key={p.id} className={styles.pageRow}>
                    <div className={styles.pageRowMain}>
                      <Article size={18} weight="duotone" color="#E84B1F" />
                      <div>
                        <div className={styles.pageRowTitle}>{p.title}</div>
                        <div className={styles.pageRowMeta}>
                          <span className={styles.pageRowSlug}>/{p.slug}</span>
                          <span className={styles.metaDot}>·</span>
                          <span>{p.isPublished ? "Publiée" : "Brouillon"}</span>
                          {p.showInFooter && (
                            <>
                              <span className={styles.metaDot}>·</span>
                              <span>Footer</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={styles.pageRowActions}>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(p)}
                        disabled={busyId === p.id}
                        className={styles.actionBtn}
                      >
                        {p.isPublished ? (
                          <Eye size={14} />
                        ) : (
                          <EyeSlash size={14} />
                        )}
                      </button>
                      <a
                        href={`https://${shopSlug}.getsellia.com/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.actionBtn}
                      >
                        <ArrowSquareOut size={14} />
                      </a>
                      <button
                        type="button"
                        onClick={() => setEditingPage(p)}
                        className={styles.actionBtn}
                      >
                        <PencilSimple size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePage(p)}
                        disabled={busyId === p.id}
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "faq" && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Questions fréquentes</h2>
              <p className={styles.sectionSubtitle}>
                Aidez vos clients à trouver des réponses rapidement.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditingFaq("new")}
              className={styles.btnPrimary}
            >
              <Plus size={15} weight="bold" /> Nouvelle question
            </button>
          </div>

          {faqs.length === 0 ? (
            <div className={styles.emptyState}>
              <Question size={56} weight="duotone" color="var(--sellia-subtle)" />
              <h3>Aucune question</h3>
              <p>Ajoutez les questions que vos clients posent le plus souvent.</p>
            </div>
          ) : (
            <div className={styles.faqList}>
              {faqs.map((f) => (
                <div key={f.id} className={styles.faqRow}>
                  <div>
                    <div className={styles.faqRowQuestion}>{f.question}</div>
                    <div className={styles.faqRowAnswer}>
                      {f.answer.slice(0, 120)}
                      {f.answer.length > 120 ? "…" : ""}
                    </div>
                    {f.category && (
                      <div className={styles.faqRowCategory}>{f.category}</div>
                    )}
                  </div>
                  <div className={styles.pageRowActions}>
                    <button
                      type="button"
                      onClick={() => setEditingFaq(f)}
                      className={styles.actionBtn}
                    >
                      <PencilSimple size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFaq(f)}
                      disabled={busyId === f.id}
                      className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {editingPage && (
        <PageEditorModal
          page={editingPage === "new" ? null : editingPage}
          onClose={() => setEditingPage(null)}
          onSaved={() => {
            setEditingPage(null);
            router.refresh();
          }}
        />
      )}
      {editingFaq && (
        <FaqEditorModal
          faq={editingFaq === "new" ? null : editingFaq}
          onClose={() => setEditingFaq(null)}
          onSaved={() => {
            setEditingFaq(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
