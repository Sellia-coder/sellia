import { notFound } from "next/navigation";
import { MessageCircle, Mail, MapPin, Instagram, Facebook } from "lucide-react";
import { getPublishedShopBySlug } from "@/lib/shop-data";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ContactPage({ params }: Props) {
  const { slug } = await params;
  const shop = await getPublishedShopBySlug(slug);
  if (!shop) notFound();

  return (
    <section className="shop-page">
      <div className="shop-container shop-container-narrow">
        <h1 className="shop-page-title">Nous contacter</h1>
        <p className="shop-page-tagline">
          Une question ? Un produit qui t&apos;intéresse ? Écris-nous directement.
        </p>

        <div className="shop-contact-list">
          {shop.whatsappNumber && (
            <a
              href={`https://wa.me/${shop.whatsappNumber.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shop-contact-card"
            >
              <div className="shop-contact-icon" style={{ background: "#25D366", color: "#FFFFFF" }}>
                <MessageCircle size={20} strokeWidth={2} color="#FFFFFF" />
              </div>
              <div className="shop-contact-info">
                <div className="shop-contact-label">WhatsApp</div>
                <div className="shop-contact-value">{shop.whatsappNumber}</div>
              </div>
            </a>
          )}

          {shop.contactEmail && (
            <a href={`mailto:${shop.contactEmail}`} className="shop-contact-card">
              <div className="shop-contact-icon">
                <Mail size={20} strokeWidth={2} />
              </div>
              <div className="shop-contact-info">
                <div className="shop-contact-label">Email</div>
                <div className="shop-contact-value">{shop.contactEmail}</div>
              </div>
            </a>
          )}

          {shop.city && (
            <div className="shop-contact-card">
              <div className="shop-contact-icon">
                <MapPin size={20} strokeWidth={2} />
              </div>
              <div className="shop-contact-info">
                <div className="shop-contact-label">Localisation</div>
                <div className="shop-contact-value">
                  {shop.address ? `${shop.address}, ${shop.city}` : shop.city}
                </div>
              </div>
            </div>
          )}

          {shop.instagramUrl && (
            <a
              href={shop.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shop-contact-card"
            >
              <div className="shop-contact-icon">
                <Instagram size={20} strokeWidth={2} />
              </div>
              <div className="shop-contact-info">
                <div className="shop-contact-label">Instagram</div>
                <div className="shop-contact-value">Voir le profil</div>
              </div>
            </a>
          )}

          {shop.facebookUrl && (
            <a
              href={shop.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shop-contact-card"
            >
              <div className="shop-contact-icon">
                <Facebook size={20} strokeWidth={2} />
              </div>
              <div className="shop-contact-info">
                <div className="shop-contact-label">Facebook</div>
                <div className="shop-contact-value">Voir la page</div>
              </div>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
