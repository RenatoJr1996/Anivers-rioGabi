"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { initialRsvpActionState } from "@/app/actions/action-states";
import { updateAttendanceAction } from "@/app/actions/guests";

export function RsvpForm() {
  const router = useRouter();
  const [actionState, formAction, isPending] = useActionState(updateAttendanceAction, initialRsvpActionState);

  useEffect(() => {
    if (actionState.status === "success") {
      router.refresh();
    }
  }, [actionState.status, actionState.submittedAt, router]);

  return (
    <section className="rsvp-panel" aria-labelledby="rsvp-title">
      <p className="section-kicker">Confirme sua presença</p>
      <h2 id="rsvp-title">Vai comemorar comigo?</h2>
      <form action={formAction} className="rsvp-form">
        <label htmlFor="guestName">Seu nome</label>
        <input id="guestName" name="guestName" type="text" autoComplete="name" placeholder="Digite seu nome" />

        <div className="rsvp-actions">
          <button type="submit" disabled={isPending}>
            Confirmar presença
          </button>
        </div>
      </form>

      {actionState.message ? (
        <p className={`form-message ${actionState.status === "error" ? "form-message-error" : "form-message-success"}`}>
          {actionState.message}
        </p>
      ) : null}
    </section>
  );
}
