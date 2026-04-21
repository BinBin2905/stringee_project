import type { SavedToken, TokenPayload } from "@/api/types/ITypes";

const TOKEN_PREFIX = "stringee_token:";
const ACTIVE_USER_KEY = "stringee_active_user";

const tokenKey = (userId: string): string => `${TOKEN_PREFIX}${userId}`;

export const storage = {
  get(userId: string): SavedToken | null {
    try {
      const raw = localStorage.getItem(tokenKey(userId));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set(data: SavedToken): void {
    localStorage.setItem(tokenKey(data.userId), JSON.stringify(data));
  },
  remove(userId: string): void {
    localStorage.removeItem(tokenKey(userId));
  },
  // Per-tab active user (sessionStorage is scoped to a single tab)
  getActiveUserId(): string | null {
    return sessionStorage.getItem(ACTIVE_USER_KEY);
  },
  setActiveUserId(userId: string): void {
    sessionStorage.setItem(ACTIVE_USER_KEY, userId);
  },
  clearActiveUserId(): void {
    sessionStorage.removeItem(ACTIVE_USER_KEY);
  },
  getActive(): SavedToken | null {
    const id = sessionStorage.getItem(ACTIVE_USER_KEY);
    return id ? storage.get(id) : null;
  },
};

export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function formatTime(unix: number | undefined): string {
  if (!unix) return "—";
  return new Date(unix * 1000).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
