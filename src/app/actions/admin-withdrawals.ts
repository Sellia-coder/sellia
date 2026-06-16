"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { logAdminAction } from "@/lib/admin/audit-log";
import {
  approveWithdrawalGroup,
  rejectWithdrawalGroup,
  reconcileProcessingWithdrawals,
} from "@/lib/payouts/withdrawal";
import { reconcileSingleWithdrawalGroup } from "@/lib/admin/withdrawal-reconcile";

export async function adminApproveWithdrawalAction(withdrawalGroupId: string) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "Non autorisé" };

  const result = await approveWithdrawalGroup(withdrawalGroupId, admin.id);
  if (!result.ok) return result;

  revalidatePath("/admin/retraits");
  revalidatePath("/admin");

  await logAdminAction({
    admin,
    action: "withdrawal.approve",
    targetType: "withdrawal_group",
    targetId: withdrawalGroupId,
  });

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

  await logAdminAction({
    admin,
    action: "withdrawal.reject",
    targetType: "withdrawal_group",
    targetId: withdrawalGroupId,
    details: reason ? { motif: reason.slice(0, 200) } : undefined,
  });

  return { ok: true as const };
}

export async function adminReconcileWithdrawalGroupAction(
  withdrawalGroupId: string
) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "Non autorisé" };

  const result = await reconcileSingleWithdrawalGroup(withdrawalGroupId);
  if (!result.ok) return result;

  revalidatePath("/admin/retraits");
  revalidatePath(`/admin/retraits/${withdrawalGroupId}`);

  await logAdminAction({
    admin,
    action: "withdrawal.reconcile",
    targetType: "withdrawal_group",
    targetId: withdrawalGroupId,
    details: { outcome: result.outcome },
  });

  return { ok: true as const, outcome: result.outcome };
}

export async function adminReconcilePayoutsAction() {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "Non autorisé" };

  const stats = await reconcileProcessingWithdrawals();

  revalidatePath("/admin/retraits");

  await logAdminAction({
    admin,
    action: "withdrawal.reconcile",
    targetType: "batch",
    details: stats,
  });

  return { ok: true as const, stats };
}
