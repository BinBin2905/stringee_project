import type { FC, KeyboardEvent, RefObject } from "react";
import type { SccoAction } from "@/types";

type Props = {
  callee: string;
  onCalleeChange: (v: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  inCall: boolean;
  callStatus: string;
  incomingCall: StringeeCall | null;
  onMakeCall: () => void;
  onAnswer: () => void;
  onReject: () => void;
  onHangup: () => void;
  scco: SccoAction[];
  remoteAudioRef: RefObject<HTMLAudioElement | null>;
};

const CallCard: FC<Props> = (p) => {
  const active = p.inCall || p.callStatus === "Answered";

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body gap-3">
        <div className="flex items-center justify-between">
          <h2 className="card-title text-base">Call</h2>
          {p.callStatus && (
            <span className="badge badge-ghost text-xs">{p.callStatus}</span>
          )}
        </div>

        <label className="form-control">
          <div className="label py-1">
            <span className="label-text text-xs uppercase tracking-wider">
              Callee ID
            </span>
          </div>
          <input
            type="text"
            className="input input-bordered input-sm font-mono"
            value={p.callee}
            onChange={(e) => p.onCalleeChange(e.target.value)}
            onKeyDown={p.onKeyDown}
            placeholder="callee"
          />
        </label>

        {active ? (
          <button className="btn btn-error btn-sm" onClick={p.onHangup}>
            Hang up
          </button>
        ) : p.incomingCall ? (
          <>
            <div className="alert alert-info text-xs py-2">
              <span>
                Incoming call from{" "}
                <span className="font-semibold">{p.incomingCall.from}</span>
              </span>
            </div>
            <div className="join">
              <button
                className="btn btn-success btn-sm join-item flex-1"
                onClick={p.onAnswer}
              >
                Answer
              </button>
              <button
                className="btn btn-error btn-sm join-item flex-1"
                onClick={p.onReject}
              >
                Reject
              </button>
            </div>
          </>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={p.onMakeCall}
            disabled={!p.callee.trim()}
          >
            Make call
          </button>
        )}

        <div className="collapse collapse-arrow bg-base-200 text-xs">
          <input type="checkbox" />
          <div className="collapse-title text-xs font-medium">
            SCCO preview
          </div>
          <div className="collapse-content">
            <pre className="font-mono text-[11px] max-h-56 overflow-auto">
              {JSON.stringify(p.scco, null, 2)}
            </pre>
          </div>
        </div>

        <audio
          ref={p.remoteAudioRef}
          autoPlay
          playsInline
          className="hidden"
        />
      </div>
    </div>
  );
};

export default CallCard;
