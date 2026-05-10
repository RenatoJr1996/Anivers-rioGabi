import crypto from "node:crypto";

import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "birthday_admin_session";

const ADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8;

function getAdminPassword(): string {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD environment variable is required.");
  }

  return adminPassword;
}

function createAdminSessionValue(): string {
  return crypto.createHash("sha256").update(`birthday-admin:${getAdminPassword()}`).digest("hex");
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  return adminSessionCookie === createAdminSessionValue();
}

export async function setAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, createAdminSessionValue(), {
    httpOnly: true,
    maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS,
    path: "/admin",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/admin",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function isValidAdminPassword(password: string): boolean {
  return password === getAdminPassword();
}
