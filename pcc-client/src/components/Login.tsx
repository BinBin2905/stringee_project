import { useCallback, useEffect, useState, type FC, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { getClientToken } from "@/api/auth";
import { storage } from "@/lib/storage";
import { toast } from "@/lib/toast";

const Login: FC = () => {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If a token is already stored, bounce back to the PCC page.
  useEffect(() => {
    if (storage.get()) navigate("/");
  }, [navigate]);

  const submit = useCallback(async () => {
    const trimmed = userId.trim();
    if (!trimmed) {
      toast.warning("User ID required");
      return;
    }
    setLoading(true);
    try {
      const token = await getClientToken(trimmed);
      storage.set({ token, userId: trimmed, savedAt: Date.now() });
      toast.success(`Signed in as ${trimmed}`);
      navigate("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Sign in failed — ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [userId, navigate]);

  const onKey = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") void submit();
  };

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body gap-4">
          <h2 className="card-title text-base">Sign in to Stringee PCC</h2>
          <p className="text-xs text-base-content/60">
            Enter your agent user ID to fetch a PCC token. Tokens carry a
            <code className="mx-1">pcc: true</code>claim.
          </p>

          <label className="form-control">
            <div className="label py-1">
              <span className="label-text text-xs uppercase tracking-wider">
                User ID
              </span>
            </div>
            <input
              type="text"
              className="input input-bordered input-sm font-mono"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              onKeyDown={onKey}
              placeholder="agent_01"
              disabled={loading}
              autoFocus
            />
          </label>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => void submit()}
            disabled={loading || !userId.trim()}
          >
            {loading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              "Sign in"
            )}
          </button>
        </div>
      </div>
    </main>
  );
};

export default Login;
