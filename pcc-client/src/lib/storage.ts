import type { SavedToken } from "@/types";

const TOKEN_KEY = "pcc_token";

// Custom event so same-tab components can react to mutations
// (the native `storage` event only fires cross-tab).
export const STORAGE_CHANGED = "pcc:storage-changed";
const notify = (): void => {
  window.dispatchEvent(new Event(STORAGE_CHANGED));
};

export const storage = {
  get(): SavedToken | null {
    try {
      const raw = sessionStorage.getItem(TOKEN_KEY);
      return raw ? (JSON.parse(raw) as SavedToken) : null;
    } catch {
      return null;
    }
  },
  set(data: SavedToken): void {
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify(data));
    notify();
  },
  clear(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    notify();
  },
};
