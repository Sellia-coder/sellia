import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

/** Redirige vers le panier en mode passage de commande (formulaire). */
export default async function CommanderPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/shop/${slug}/panier?checkout=1`);
}
