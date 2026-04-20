import type { SavedToken, TokenPayload } from "@/api/types/ITypes";

// ── Storage helper ─────────────────────────────────────────
// const STORAGE_KEY = "stringee_token";

export const storage = {
  get(userId: string): SavedToken | null {
    try {
      const raw = localStorage.getItem(userId);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set(data: SavedToken): void {
    localStorage.setItem(data.userId, JSON.stringify(data));
  },
  remove(userId: string): void {
    localStorage.removeItem(userId);
  },
};

// ── Helpers ────────────────────────────────────────────────
export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
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
