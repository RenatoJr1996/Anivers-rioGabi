export const SESSION_COOKIE_NAME = "birthday_session_id";

export async function getSessionId(): Promise<string | undefined> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}
