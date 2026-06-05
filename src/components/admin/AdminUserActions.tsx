"use client";

import { useTransition } from "react";
import { adminSetUserRoleAction } from "@/app/actions/admin-platform";

export default function AdminUserActions({
  userId,
  role,
  isSelf,
}: {
  userId: string;
  role: string | null;
  isSelf: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const isAdmin = role === "admin";

  const toggleRole = () => {
    const next = isAdmin ? "user" : "admin";
    const msg = isAdmin
      ? `Rétrograder ce compte au rôle « user » ?`
      : `Promouvoir ce compte en administrateur ?`;
    if (!window.confirm(msg)) return;
    startTransition(async () => {
      const res = await adminSetUserRoleAction(userId, next);
      if (!res.ok) alert(res.error ?? "Erreur");
    });
  };

  return (
    <button
      type="button"
      className="admin-btn"
      onClick={toggleRole}
      disabled={pending || (isSelf && isAdmin)}
      title={
        isSelf && isAdmin
          ? "Vous ne pouvez pas vous rétrograder vous-même"
          : undefined
      }
    >
      {pending ? "…" : isAdmin ? "Rétrograder" : "Promouvoir admin"}
    </button>
  );
}
