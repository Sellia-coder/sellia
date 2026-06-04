import { redirect } from "next/navigation";

/** Entrée admin : redirige vers la première section (stub signalements). */
export default function AdminIndexPage() {
  redirect("/admin/signalements");
}
