import type { AuthResponse } from "@coffee-lovers/shared";

const STORAGE_KEY = "coffee_lovers_auth";

export type AuthSession = AuthResponse;

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (
      !parsed?.accessToken ||
      typeof parsed.accessToken !== "string" ||
      !parsed?.user?.id
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function getAccessToken(): string {
  return getSession()?.accessToken ?? "";
}

export function getUserId(): string | null {
  return getSession()?.user.id ?? null;
}

/** Storage key for E2E / tests that need to seed a session. */
export const AUTH_STORAGE_KEY = STORAGE_KEY;
