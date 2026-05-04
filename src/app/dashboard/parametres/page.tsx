import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import ParametresClient from "./ParametresClient";

export default async function ParametresPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  return <ParametresClient twoFactorEnabled={user.twoFactorEnabled} />;
}
