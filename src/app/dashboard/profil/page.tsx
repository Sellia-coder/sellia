import { redirect } from "next/navigation";

export default function ProfilPage() {
  redirect("/dashboard/reglages?tab=profil");
}
