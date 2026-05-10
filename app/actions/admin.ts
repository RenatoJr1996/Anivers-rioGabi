"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { AdminActionState } from "@/app/actions/action-states";
import {
  clearAdminSessionCookie,
  isAdminAuthenticated,
  isValidAdminPassword,
  setAdminSessionCookie,
} from "@/lib/admin-auth";
import { addGuest } from "@/lib/guests";
import { logger } from "@/lib/logger";
import { getSessionId } from "@/lib/session";

export async function loginAdminAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const sessionId = await getSessionId();
  logger.info("loginAdminAction", sessionId, "Starting admin login flow");

  const adminPassword = formData.get("adminPassword")?.toString() ?? "";

  if (!isValidAdminPassword(adminPassword)) {
    logger.debug("loginAdminAction", sessionId, "Admin password validation failed");
    return {
      status: "error",
      message: "Senha inválida.",
      submittedAt: Date.now(),
    };
  }

  await setAdminSessionCookie();
  logger.info("loginAdminAction", sessionId, "Admin login completed successfully");
  redirect("/admin");
}

export async function logoutAdminAction(): Promise<void> {
  const sessionId = await getSessionId();
  logger.info("logoutAdminAction", sessionId, "Starting admin logout flow");
  await clearAdminSessionCookie();
  logger.info("logoutAdminAction", sessionId, "Admin logout completed successfully");
  redirect("/admin");
}

export async function addGuestAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const sessionId = await getSessionId();
  logger.info("addGuestAction", sessionId, "Starting admin guest creation action");

  const adminAuthenticated = await isAdminAuthenticated();

  if (!adminAuthenticated) {
    logger.debug("addGuestAction", sessionId, "Guest creation blocked because admin is not authenticated");
    return {
      status: "error",
      message: "Acesso administrativo necessário.",
      submittedAt: Date.now(),
    };
  }

  const guestName = formData.get("guestName")?.toString() ?? "";
  const guestMutationResult = await addGuest(guestName, sessionId);

  if (!guestMutationResult.success) {
    logger.debug("addGuestAction", sessionId, "Guest creation returned a business error");
    return {
      status: "error",
      message: guestMutationResult.message,
      submittedAt: Date.now(),
    };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  logger.info("addGuestAction", sessionId, "Admin guest creation action completed successfully");

  return {
    status: "success",
    message: guestMutationResult.message,
    submittedAt: Date.now(),
  };
}
