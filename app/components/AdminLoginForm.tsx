"use client";

import { useActionState } from "react";

import { loginAdminAction } from "@/app/actions/admin";
import { initialAdminActionState } from "@/app/actions/action-states";

export function AdminLoginForm() {
  const [actionState, formAction, isPending] = useActionState(loginAdminAction, initialAdminActionState);

  return (
    <form action={formAction} className="admin-form">
      <label htmlFor="adminPassword">Senha do admin</label>
      <input id="adminPassword" name="adminPassword" type="password" autoComplete="current-password" />
      <button type="submit" disabled={isPending}>
        Entrar
      </button>
      {actionState.message ? <p className="form-message form-message-error">{actionState.message}</p> : null}
    </form>
  );
}
