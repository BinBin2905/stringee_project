import type { FC, KeyboardEvent } from "react";
import type { TokenPayload } from "@/types";
import { formatTime } from "@/lib/jwt";

type Props = {
  serverUrl: string;
  onServerUrlChange: (v: string) => void;
  userId: string;
  onUserIdChange: (v: string) => void;
  loading: boolean;
  error: string;
  onFetch: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  token: string | null;
  tokenInfo: TokenPayload | null;
  isExpired: boolean;
  copied: boolean;
  onCopy: () => void;
  onClear: () => void;
  pcc: boolean;
  onPccChange: (v: boolean) => void;
};

const TokenCard: FC<Props> = (p) => (
  <div className="card bg-base-100 border border-base-300 shadow-sm">
    <div className="card-body gap-4">
      <h2 className="card-title text-base">Connection</h2>

      <label className="form-control">
        <div className="label py-1">
          <span className="label-text text-xs uppercase tracking-wider">
            Server URL
          </span>
        </div>
        <input
          type="text"
          className="input input-bordered input-sm font-mono"
          value={p.serverUrl}
          onChange={(e) => p.onServerUrlChange(e.target.value)}
          placeholder="http://localhost:3000"
        />
      </label>

      <label className="form-control">
        <div className="label py-1">
          <span className="label-text text-xs uppercase tracking-wider">
            User ID
          </span>
        </div>
        <div className="join w-full">
          <input
            type="text"
            className="input input-bordered input-sm join-item w-full font-mono"
            value={p.userId}
            onChange={(e) => p.onUserIdChange(e.target.value)}
            onKeyDown={p.onKeyDown}
            placeholder="agent_01"
            disabled={p.loading}
          />
          <button
            className="btn btn-primary btn-sm join-item"
            onClick={p.onFetch}
            disabled={p.loading || !p.userId.trim()}
          >
            {p.loading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              "Fetch Token"
            )}
          </button>
        </div>
      </label>

      <label className="label cursor-pointer justify-start gap-2 py-0">
        <input
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={p.pcc}
          onChange={(e) => p.onPccChange(e.target.checked)}
          disabled={p.loading}
        />
        <span className="label-text text-xs">
          PCC agent token
          <span className="text-base-content/50"> — adds <code>pcc: true</code> claim, required to enter /pcc and the PCC REST tabs.</span>
        </span>
      </label>

      {p.error && (
        <div role="alert" className="alert alert-error text-xs py-2">
          <span>{p.error}</span>
        </div>
      )}

      {p.token && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-base-content/60">
              Token
            </span>
            <div className="join">
              <button
                className="btn btn-ghost btn-xs join-item"
                onClick={p.onCopy}
              >
                {p.copied ? "Copied" : "Copy"}
              </button>
              <button
                className="btn btn-ghost btn-xs join-item"
                onClick={p.onClear}
                aria-label="Clear token"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="font-mono text-[11px] leading-relaxed break-all bg-base-200 rounded-box p-3 max-h-24 overflow-auto">
            {p.token}
          </div>

          {p.tokenInfo && (
            <div className="stats stats-horizontal bg-base-200 w-full overflow-x-auto">
              <div className="stat py-2 px-3">
                <div className="stat-title text-[10px]">User</div>
                <div className="stat-value text-sm flex items-center gap-2">
                  {p.tokenInfo.userId ?? "—"}
                  {p.tokenInfo.pcc && (
                    <span className="badge badge-primary badge-sm">PCC</span>
                  )}
                </div>
              </div>
              <div className="stat py-2 px-3">
                <div className="stat-title text-[10px]">Issued</div>
                <div className="stat-value text-sm">
                  {formatTime(p.tokenInfo.iat)}
                </div>
              </div>
              <div className="stat py-2 px-3">
                <div className="stat-title text-[10px]">Expires</div>
                <div
                  className={`stat-value text-sm ${p.isExpired ? "text-error" : ""}`}
                >
                  {formatTime(p.tokenInfo.exp)}
                </div>
              </div>
            </div>
          )}

          {p.isExpired && (
            <div className="alert alert-warning text-xs py-2">
              <span>Token expired — fetch again to renew.</span>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);

export default TokenCard;
