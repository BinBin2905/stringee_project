import { useEffect, useState, type FC, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { decodeToken } from "@/lib/jwt";
import {
  restTokenStorage,
  storage,
  STORAGE_CHANGED,
} from "@/lib/storage";

// Guards PCC-only surfaces (/pcc route + AdminPage PCCRestApi subsection).
// Allows render only when the active client token carries `pcc: true`.
// Otherwise renders a block card with "Logout & get PCC token".

const read = (): { userId: string | null; pcc: boolean } => {
  const active = storage.getActive();
  if (!active) return { userId: null, pcc: false };
  const info = decodeToken(active.token);
  return { userId: active.userId, pcc: !!info?.pcc };
};

const PCCGuard: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState(read);
  const navigate = useNavigate();

  useEffect(() => {
    const refresh = (): void => setState(read());
    window.addEventListener(STORAGE_CHANGED, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(STORAGE_CHANGED, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (state.pcc) return <>{children}</>;

  const relog = (): void => {
    const id = storage.getActiveUserId();
    if (id) storage.remove(id);
    storage.clearActiveUserId();
    restTokenStorage.clear();
    navigate("/");
  };

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body gap-3">
          <h2 className="card-title text-base">PCC access required</h2>
          {state.userId ? (
            <p className="text-sm text-base-content/70">
              Signed in as <code>{state.userId}</code> with a regular client
              token. PCC pages and the PCC REST tabs require a token with the{" "}
              <code>pcc: true</code> claim. Log out and fetch a new token with{" "}
              <b>PCC agent token</b> checked.
            </p>
          ) : (
            <p className="text-sm text-base-content/70">
              No client token in this session. Go to the Client page, fetch a
              token with <b>PCC agent token</b> checked, then come back.
            </p>
          )}
          <div className="flex gap-2">
            {state.userId ? (
              <button className="btn btn-primary btn-sm" onClick={relog}>
                Logout & get PCC token
              </button>
            ) : (
              <Link to="/" className="btn btn-primary btn-sm">
                Go to Client
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default PCCGuard;
