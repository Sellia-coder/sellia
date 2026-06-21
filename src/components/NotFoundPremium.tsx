import Link from "next/link";
import { Compass, House, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import styles from "./NotFoundPremium.module.css";

interface Props {
  code?: string;
  title?: string;
  message?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

function PrimaryAction({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  if (href.startsWith("http")) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default function NotFoundPremium({
  code = "404",
  title = "Page introuvable",
  message = "Cette page n'existe pas ou a été déplacée. Pas de panique — vous pouvez revenir à l'accueil et continuer votre navigation.",
  primaryHref = "/",
  primaryLabel = "Retour à l'accueil",
  secondaryHref = "/connexion",
  secondaryLabel = "Se connecter",
}: Props) {
  return (
    <main className={styles.page}>
      <div className={styles.bgOrb1} aria-hidden />
      <div className={styles.bgOrb2} aria-hidden />

      <div className={styles.inner}>
        <div className={styles.visual} aria-hidden>
          <div className={styles.ring} />
          <div className={styles.ringInner} />
          <div className={styles.iconWrap}>
            <Compass size={36} weight="duotone" />
          </div>
        </div>

        <p className={styles.code}>{code}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <PrimaryAction href={primaryHref} className={styles.primaryBtn}>
            <House size={18} weight="bold" />
            {primaryLabel}
          </PrimaryAction>
          {secondaryHref ? (
            <PrimaryAction href={secondaryHref} className={styles.secondaryBtn}>
              <ArrowLeft size={16} weight="bold" />
              {secondaryLabel}
            </PrimaryAction>
          ) : null}
        </div>
      </div>
    </main>
  );
}
