"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { addGuestAction } from "@/app/actions/admin";
import { initialAdminActionState } from "@/app/actions/action-states";

export function AddGuestForm() {
  const router = useRouter();
  const [actionState, formAction, isPending] = useActionState(addGuestAction, initialAdminActionState);

  useEffect(() => {
    if (actionState.status === "success") {
      router.refresh();
    }
  }, [actionState.status, actionState.submittedAt, router]);

  return (
    <form action={formAction} className="admin-form add-guest-form">
      <label htmlFor="guestName">Novo convidado</label>
      <div className="inline-form-row">
        <input id="guestName" name="guestName" type="text" autoComplete="off" />
        <button type="submit" disabled={isPending}>
          Adicionar
        </button>
      </div>
      {actionState.message ? (
        <p className={`form-message ${actionState.status === "error" ? "form-message-error" : "form-message-success"}`}>
          {actionState.message}
        </p>
      ) : null}
    </form>
  );
}
