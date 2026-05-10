"use server";

import { revalidatePath } from "next/cache";

import type { RsvpActionState } from "@/app/actions/action-states";
import { confirmGuestByName } from "@/lib/guests";
import { logger } from "@/lib/logger";
import { getSessionId } from "@/lib/session";

export async function updateAttendanceAction(
  _previousState: RsvpActionState,
  formData: FormData,
): Promise<RsvpActionState> {
  const sessionId = await getSessionId();
  logger.info("updateAttendanceAction", sessionId, "Starting RSVP action flow");

  const guestName = formData.get("guestName")?.toString() ?? "";

  if (!guestName.trim()) {
    logger.debug("updateAttendanceAction", sessionId, "RSVP payload validation failed");
    return {
      status: "error",
      message: "Informe seu nome antes de continuar.",
      submittedAt: Date.now(),
    };
  }

  logger.debug("updateAttendanceAction", sessionId, "RSVP payload validated successfully");
  const guestMutationResult = await confirmGuestByName(guestName, sessionId);

  if (!guestMutationResult.success) {
    logger.debug("updateAttendanceAction", sessionId, "RSVP update returned a business error");
    return {
      status: "error",
      message: guestMutationResult.message,
      submittedAt: Date.now(),
    };
  }

  revalidatePath("/");
  logger.info("updateAttendanceAction", sessionId, "RSVP action flow completed successfully");

  return {
    status: "success",
    message: guestMutationResult.message,
    submittedAt: Date.now(),
  };
}
