import type { SavedToken } from "@/types";

const TOKEN_PREFIX = "stringee_token:";
const ACTIVE_USER_KEY = "stringee_active_user";
const REST_TOKEN_KEY = "stringee_rest_token";

// Custom event — same-tab components listen for this to re-read storage
// after a mutation. (`storage` events only fire cross-tab.)
export const STORAGE_CHANGED = "stringee:storage-changed";
const notify = (): void => {
  window.dispatchEvent(new Event(STORAGE_CHANGED));
};

const tokenKey = (userId: string): string => `${TOKEN_PREFIX}${userId}`;

interface RestTokenCache {
  token: string;
  expiresAt: number; // epoch ms
  fetchedAt: number; // epoch ms
}

export const storage = {
  get(userId: string): SavedToken | null {
    try {
      const raw = localStorage.getItem(tokenKey(userId));
      return raw ? (JSON.parse(raw) as SavedToken) : null;
    } catch {
      return null;
    }
  },
  set(data: SavedToken): void {
    localStorage.setItem(tokenKey(data.userId), JSON.stringify(data));
    notify();
  },
  remove(userId: string): void {
    localStorage.removeItem(tokenKey(userId));
    notify();
  },
  getActiveUserId: (): string | null => sessionStorage.getItem(ACTIVE_USER_KEY),
  setActiveUserId: (userId: string): void => {
    sessionStorage.setItem(ACTIVE_USER_KEY, userId);
    notify();
  },
  clearActiveUserId: (): void => {
    sessionStorage.removeItem(ACTIVE_USER_KEY);
    notify();
  },
  getActive(): SavedToken | null {
    const id = sessionStorage.getItem(ACTIVE_USER_KEY);
    return id ? storage.get(id) : null;
  },
};

// ── REST token cache (session-scoped) ─────────────────────────────────
// Stored in sessionStorage so closing the tab forgets it — we only hold
// it long enough for the info panel to show an "active" indicator.
export const restTokenStorage = {
  get(): RestTokenCache | null {
    try {
      const raw = sessionStorage.getItem(REST_TOKEN_KEY);
      return raw ? (JSON.parse(raw) as RestTokenCache) : null;
    } catch {
      return null;
    }
  },
  set(token: string, expiresInSec: number): void {
    const rec: RestTokenCache = {
      token,
      expiresAt: Date.now() + expiresInSec * 1000,
      fetchedAt: Date.now(),
    };
    sessionStorage.setItem(REST_TOKEN_KEY, JSON.stringify(rec));
    notify();
  },
  clear(): void {
    sessionStorage.removeItem(REST_TOKEN_KEY);
    notify();
  },
};
