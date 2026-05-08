"use client";

import { useRef, useState } from "react";
import { Plus, X, Info } from "lucide-react";
import { compressImage, dataUrlByteSize, formatFileSize } from "@/lib/image-compression";

interface Props {
  imageUrl: string | null;
  galleryUrls: string[];
  onChange: (next: { imageUrl: string | null; galleryUrls: string[] }) => void;
}

const MAX_GALLERY = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ProductGallery({ imageUrl, galleryUrls, onChange }: Props) {
  const fileInputs = useRef<(HTMLInputElement | null)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const slots: (string | null)[] = [imageUrl];
  for (let i = 0; i < MAX_GALLERY; i++) {
    slots.push(galleryUrls[i] ?? null);
  }

  const totalImages = (imageUrl ? 1 : 0) + galleryUrls.length;

  const handleSlotClick = (index: number) => {
    fileInputs.current[index]?.click();
  };

  const handleFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError("Image trop lourde (max 5 Mo en entrée)");
      e.target.value = "";
      return;
    }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Format accepté : PNG, JPG ou WEBP");
      e.target.value = "";
      return;
    }

    setError(null);
    setUploadingIndex(index);

    try {
      const compressed = await compressImage(file, {
        maxDimension: 1200,
        quality: 0.85,
        format: "image/jpeg",
      });

      if (index === 0) {
        onChange({ imageUrl: compressed, galleryUrls });
      } else {
        const galleryIndex = index - 1;
        const next = [...galleryUrls];
        next[galleryIndex] = compressed;
        const compact = next.filter(Boolean) as string[];
        onChange({ imageUrl, galleryUrls: compact });
      }
    } catch (err) {
      console.error("[ProductGallery]", err);
      setError("Échec du traitement de l'image. Réessaye.");
    } finally {
      setUploadingIndex(null);
      e.target.value = "";
    }
  };

  const handleRemove = (index: number) => {
    if (index === 0) {
      onChange({ imageUrl: null, galleryUrls });
    } else {
      const galleryIndex = index - 1;
      const next = galleryUrls.filter((_, i) => i !== galleryIndex);
      onChange({ imageUrl, galleryUrls: next });
    }
  };

  const totalBytes =
    (imageUrl ? dataUrlByteSize(imageUrl) : 0) + galleryUrls.reduce((sum, url) => sum + dataUrlByteSize(url), 0);

  return (
    <div>
      <div className="perso-gallery">
        {slots.map((url, index) => {
          const isMain = index === 0;
          const isFilled = !!url;
          const isUploading = uploadingIndex === index;
          const previousFilled = slots.slice(0, index).every(Boolean);
          const isDisabled = !isFilled && !previousFilled;

          return (
            <div key={index}>
              <div
                className={`perso-gallery-slot ${isFilled ? "is-filled" : ""}`}
                onClick={() => {
                  if (isUploading || isDisabled) return;
                  handleSlotClick(index);
                }}
                style={{
                  opacity: isDisabled ? 0.4 : 1,
                  cursor: isDisabled ? "not-allowed" : "pointer",
                }}
              >
                {isFilled ? (
                  <>
                    <img src={url!} alt="" className="perso-gallery-slot-img" />
                    {isMain && <span className="perso-gallery-slot-main-badge">Principale</span>}
                    <button
                      type="button"
                      className="perso-gallery-slot-remove"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        handleRemove(index);
                      }}
                      aria-label="Retirer"
                    >
                      <X size={12} strokeWidth={2.5} />
                    </button>
                  </>
                ) : isUploading ? (
                  <div className="perso-gallery-slot-empty">
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid #E5E2DA",
                        borderTopColor: "#E84B1F",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "persoSpin 0.7s linear infinite",
                      }}
                    />
                  </div>
                ) : (
                  <div className="perso-gallery-slot-empty">
                    <Plus size={20} strokeWidth={1.8} />
                  </div>
                )}
              </div>
              {!isFilled && !isUploading && (
                <div className="perso-gallery-slot-label">{isMain ? "Principale" : `Photo ${index + 1}`}</div>
              )}

              <input
                ref={(el) => {
                  fileInputs.current[index] = el;
                }}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(ev) => handleFileChange(index, ev)}
                style={{ display: "none" }}
              />
            </div>
          );
        })}
      </div>

      <div className="perso-gallery-meta">
        <Info size={12} strokeWidth={2} />
        {totalImages} / {MAX_GALLERY + 1} photos
        {totalBytes > 0 && ` · ${formatFileSize(totalBytes)} après compression`}
      </div>

      {error && (
        <div className="perso-alert-error perso-alert-error-inline" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}
    </div>
  );
}
