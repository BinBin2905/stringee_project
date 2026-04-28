import { useCallback, useEffect, useState, type FC } from "react";
import { useNavigate } from "react-router";
import { adminApi } from "@/api/admin";
import { decodeToken, formatTime } from "@/lib/jwt";
import {
  restTokenStorage,
  storage,
  STORAGE_CHANGED,
} from "@/lib/storage";
import { toast } from "@/lib/toast";
import type { SavedToken, TokenPayload } from "@/types";

// Fixed left-side info panel — shows the current client token, lets you
// fetch / clear the REST token, and logs out of the client session.
// Hidden until a client token exists.

type Snapshot = {
  client: (SavedToken & { info: TokenPayload | null }) | null;
  rest: ReturnType<typeof restTokenStorage.get>;
};

const read = (): Snapshot => {
  const active = storage.getActive();
  return {
    client: active
      ? { ...active, info: decodeToken(active.token) }
      : null,
    rest: restTokenStorage.get(),
  };
};

const initial = (userId: string): string =>
  userId ? userId.slice(0, 2).toUpperCase() : "??";

const remaining = (expEpoch: number): string => {
  const secs = Math.max(0, Math.floor((expEpoch - Date.now()) / 1000));
  if (secs === 0) return "expired";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const TokenStatusPanel: FC = () => {
  const [snap, setSnap] = useState<Snapshot>(read);
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Re-read storage whenever any component writes to it.
  useEffect(() => {
    const refresh = (): void => setSnap(read());
    window.addEventListener(STORAGE_CHANGED, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(STORAGE_CHANGED, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // Tick every second so the countdown stays live.
  useEffect(() => {
    const id = setInterval(() => setSnap((s) => ({ ...s })), 1000);
    return () => clearInterval(id);
  }, []);

  const fetchRest = useCallback(async () => {
    setBusy(true);
    setError("");
    const res = await adminApi.restToken();
    setBusy(false);
    if (res.status >= 200 && res.status < 300) {
      const body = res.data as { token: string; expiresIn: number };
      restTokenStorage.set(body.token, body.expiresIn);
      toast.success("REST token fetched");
    } else {
      setError(`HTTP ${res.status}`);
      toast.error(`REST token fetch failed — HTTP ${res.status}`);
    }
  }, []);

  const logout = useCallback(() => {
    const id = storage.getActiveUserId();
    if (id) storage.remove(id);
    storage.clearActiveUserId();
    restTokenStorage.clear();
    navigate("/");
    toast.info("Logged out");
  }, [navigate]);

  const client = snap.client;
  if (!client) return null;

  const clientExp = client.info?.exp ? client.info.exp * 1000 : 0;
  const clientExpired = clientExp > 0 && clientExp < Date.now();

  return (
    <aside className="fixed left-3 bottom-3 z-40 w-72 max-w-[calc(100vw-1.5rem)]">
      {/* Avatar toggle (always rendered, collapses the panel) */}
      <button
        className="absolute -top-2 -right-2 z-10 avatar placeholder rounded-full ring ring-base-300"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Collapse token panel" : "Expand token panel"}
      >
        <div className="bg-neutral text-neutral-content w-10 rounded-full">
          <span className="text-xs font-semibold">
            {initial(client.userId)}
          </span>
        </div>
      </button>

      {open && (
        <div className="card bg-base-100 border border-base-300 shadow-lg">
          <div className="card-body gap-3 p-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Signed in</h3>
              <span className="badge badge-ghost badge-sm">Client</span>
              <button
                className="btn btn-ghost btn-xs ml-auto"
                onClick={() => setOpen(false)}
                aria-label="Hide"
              >
                ✕
              </button>
            </div>

            {/* ── Client token ── */}
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-base-content/50">
                Client token
              </div>
              <div className="text-sm font-mono">{client.userId}</div>
              <div className="text-xs text-base-content/60">
                exp {formatTime(client.info?.exp)} ·{" "}
                <span className={clientExpired ? "text-error" : ""}>
                  {clientExpired ? "expired" : remaining(clientExp)}
                </span>
              </div>
            </div>

            {/* ── REST token ── */}
            <div className="space-y-1 pt-2 border-t border-base-200">
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-wider text-base-content/50">
                  REST token
                </div>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={fetchRest}
                  disabled={busy}
                >
                  {busy ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : snap.rest ? (
                    "Refresh"
                  ) : (
                    "Fetch"
                  )}
                </button>
              </div>
              {snap.rest ? (
                <div className="text-xs text-base-content/60">
                  exp {new Date(snap.rest.expiresAt).toLocaleTimeString()} ·{" "}
                  <span
                    className={
                      snap.rest.expiresAt < Date.now() ? "text-error" : ""
                    }
                  >
                    {snap.rest.expiresAt < Date.now()
                      ? "expired"
                      : remaining(snap.rest.expiresAt)}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-base-content/40">
                  not fetched
                </div>
              )}
              {error && <div className="text-xs text-error">{error}</div>}
            </div>

            <button className="btn btn-outline btn-xs" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default TokenStatusPanel;
