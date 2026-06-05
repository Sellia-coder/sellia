"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import {
  approveWithdrawalGroup,
  rejectWithdrawalGroup,
  reconcileProcessingWithdrawals,
} from "@/lib/payouts/withdrawal";

export async function adminApproveWithdrawalAction(withdrawalGroupId: string) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "Non autorisé" };

  const result = await approveWithdrawalGroup(withdrawalGroupId, admin.id);
  if (!result.ok) return result;

  revalidatePath("/admin/retraits");
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function adminRejectWithdrawalAction(
  withdrawalGroupId: string,
  reason?: string
) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "Non autorisé" };

  const result = await rejectWithdrawalGroup(
    withdrawalGroupId,
    admin.id,
    reason
  );
  if (!result.ok) return result;

  revalidatePath("/admin/retraits");
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function adminReconcilePayoutsAction() {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "Non autorisé" };

  const stats = await reconcileProcessingWithdrawals();

  revalidatePath("/admin/retraits");
  return { ok: true as const, stats };
}
