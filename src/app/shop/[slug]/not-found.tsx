import NotFoundPremium from "@/components/NotFoundPremium";

export default function ShopNotFound() {
  return (
    <NotFoundPremium
      code="404"
      title="Boutique introuvable"
      message="Cette boutique n'existe pas ou n'est plus disponible. Découvrez d'autres vendeurs sur Sellia ou retournez à l'accueil."
      primaryHref="https://getsellia.com"
      primaryLabel="Découvrir Sellia"
      secondaryHref="/"
      secondaryLabel="Retour à l'accueil"
    />
  );
}
