"use server";

import { getCurrentUser } from "@/lib/auth/session";

export async function checkAuthStatusAction(): Promise<{ loggedIn: boolean }> {
  try {
    const user = await getCurrentUser();
    return { loggedIn: !!user };
  } catch {
    return { loggedIn: false };
  }
}
