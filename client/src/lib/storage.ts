import type { SavedToken } from "@/types";

const TOKEN_PREFIX = "stringee_token:";
const ACTIVE_USER_KEY = "stringee_active_user";

const tokenKey = (userId: string): string => `${TOKEN_PREFIX}${userId}`;

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
  },
  remove(userId: string): void {
    localStorage.removeItem(tokenKey(userId));
  },
  getActiveUserId: (): string | null => sessionStorage.getItem(ACTIVE_USER_KEY),
  setActiveUserId: (userId: string): void =>
    sessionStorage.setItem(ACTIVE_USER_KEY, userId),
  clearActiveUserId: (): void => sessionStorage.removeItem(ACTIVE_USER_KEY),
  getActive(): SavedToken | null {
    const id = sessionStorage.getItem(ACTIVE_USER_KEY);
    return id ? storage.get(id) : null;
  },
};
