import { getCurrentUser } from "@/lib/auth/session";
import HomeClient from "./HomeClient";

export default async function DashboardHomePage() {
  const user = await getCurrentUser();
  return <HomeClient firstName={user?.firstName || ""} />;
}
