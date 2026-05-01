import {
  useCallback,
  useRef,
  useState,
  type FC,
  type KeyboardEvent,
} from "react";
import { getClientToken } from "@/api/auth";
import { pcc } from "@/api/pcc";
import { toast } from "@/lib/toast";
import {
  loadSoftphone,
  type StringeeSoftPhone,
  type StringeeSoftPhoneConfig,
  type StringeeSoftPhoneFromNumber,
} from "@/lib/stringeeSdk";

// Slice of the documented `/v1/number` list response we actually consume.
interface NumberListResponse {
  r: number;
  message?: string;
  data?: {
    numbers?: { number: string; nickname?: string }[];
  };
}

// One row in the live activity feed. Cap the buffer so the panel doesn't
// grow unbounded.
interface ActivityEntry {
  id: number;
  ts: number;
  event: string;
  detail?: string;
}
const ACTIVITY_LIMIT = 30;

async function fetchFromNumbers(): Promise<StringeeSoftPhoneFromNumber[]> {
  // Pull all numbers in one shot — PCC accounts rarely exceed a handful.
  const res = await pcc.number.list<NumberListResponse>("page=1&limit=100");
  if (res.status >= 400 || res.data?.r !== 0) {
    throw new Error(
      res.data?.message ?? `Number list failed (status=${res.status})`,
    );
  }
  const numbers = res.data?.data?.numbers ?? [];
  return numbers
    .filter((n) => !!n.number)
    .map((n) => ({ alias: n.nickname?.trim() || n.number, number: n.number }));
}

const summarize = (v: unknown): string | undefined => {
  if (v === undefined || v === null) return undefined;
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    const s = JSON.stringify(v);
    return s.length > 80 ? s.slice(0, 77) + "…" : s;
  } catch {
    return undefined;
  }
};

const SoftphonePage: FC = () => {
  const [userId, setUserId] = useState("");
  const [enableVideo, setEnableVideo] = useState(false);
  const [askCallType, setAskCallType] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const [signalState, setSignalState] = useState<string>("idle");
  const [authState, setAuthState] = useState<string>("—");
  const [activity, setActivity] = useState<ActivityEntry[]>([]);

  // Hold the widget instance + the latest token so requestNewToken can
  // refresh without re-running the whole connect flow.
  const phoneRef = useRef<StringeeSoftPhone | null>(null);
  const tokenRef = useRef<string>("");
  const idRef = useRef(0);

  const log = useCallback((event: string, detail?: string): void => {
    idRef.current += 1;
    const entry: ActivityEntry = {
      id: idRef.current,
      ts: Date.now(),
      event,
      ...(detail !== undefined ? { detail } : {}),
    };
    setActivity((prev) => [entry, ...prev].slice(0, ACTIVITY_LIMIT));
  }, []);

  const start = useCallback(async () => {
    const trimmed = userId.trim();
    if (!trimmed) {
      toast.warning("Agent user ID required");
      return;
    }
    setLoading(true);
    try {
      const [StringeeSoftPhone, accessToken, fromNumbers] = await Promise.all([
        loadSoftphone(),
        getClientToken(trimmed),
        fetchFromNumbers(),
      ]);
      phoneRef.current = StringeeSoftPhone;
      tokenRef.current = accessToken;

      if (fromNumbers.length === 0) {
        toast.warning("No PCC numbers found — outbound dialing will be empty");
      }

      const config: StringeeSoftPhoneConfig = {
        showMode: "full",
        top: 45,
        left: 50,
        arrowLeft: 155,
        arrowDisplay: "top",
        fromNumbers,
        enableVideoCall: enableVideo,
        askCallTypeWhenMakeCall: askCallType,
        ...(enableVideo
          ? { iframeVideoCallSize: { width: 480, height: 360 } }
          : {}),
      };
      StringeeSoftPhone.init(config);

      // ── UI / lifecycle ───────────────────────────────────────────────
      StringeeSoftPhone.on("displayModeChange", (mode) => {
        const m = String(mode);
        log("displayModeChange", m);
        if (m === "min") {
          StringeeSoftPhone.config({ arrowLeft: 75 });
        } else if (m === "full") {
          StringeeSoftPhone.config({ arrowLeft: 155 });
        }
      });

      StringeeSoftPhone.on("requestNewToken", () => {
        log("requestNewToken", "refreshing");
        // The widget's token has expired — re-mint and reconnect.
        getClientToken(trimmed)
          .then((fresh) => {
            tokenRef.current = fresh;
            StringeeSoftPhone.connect(fresh);
            log("token", "refreshed");
          })
          .catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : String(err);
            toast.error(`Token refresh failed — ${msg}`);
          });
      });

      // ── Auth + signaling state ──────────────────────────────────────
      StringeeSoftPhone.on("authen", (...args) => {
        const payload = args[0];
        const status = summarize(payload) ?? "ok";
        setAuthState(status);
        log("authen", status);
      });

      StringeeSoftPhone.on("signalingstate", (...args) => {
        const state = String(args[0] ?? "?");
        setSignalState(state);
        log("signalingstate", state);
      });

      StringeeSoftPhone.on("disconnect", () => {
        setSignalState("disconnected");
        setConnected(false);
        log("disconnect");
        toast.warning("Softphone disconnected");
      });

      // ── Outgoing call ───────────────────────────────────────────────
      StringeeSoftPhone.on("beforeMakeCall", (...args) => {
        log("beforeMakeCall", summarize(args[0]));
      });
      StringeeSoftPhone.on("makeOutgoingCallBtnClick", (...args) => {
        log("makeOutgoingCallBtnClick", summarize(args[0]));
      });
      StringeeSoftPhone.on("endCallBtnClick", (...args) => {
        log("endCallBtnClick", summarize(args[0]));
      });

      // ── Incoming call ───────────────────────────────────────────────
      StringeeSoftPhone.on("incomingCall", (...args) => {
        const payload = args[0] as
          | { fromNumber?: string; isVideoCall?: boolean }
          | undefined;
        const from = payload?.fromNumber ?? "?";
        log("incomingCall", `from ${from}`);
        toast.info(
          `Incoming ${payload?.isVideoCall ? "video" : "voice"} call from ${from}`,
        );
      });
      StringeeSoftPhone.on("answerIncomingCallBtnClick", (...args) => {
        log("answerIncomingCallBtnClick", summarize(args[0]));
      });
      StringeeSoftPhone.on("declineIncomingCallBtnClick", (...args) => {
        log("declineIncomingCallBtnClick", summarize(args[0]));
      });

      // ── Media streams (informational; the widget renders its own UI) ─
      StringeeSoftPhone.on("addlocalstream", () => log("addlocalstream"));
      StringeeSoftPhone.on("addremotestream", () => log("addremotestream"));

      // ── Screen lifecycle ────────────────────────────────────────────
      StringeeSoftPhone.on("callingScreenHide", () => log("callingScreenHide"));
      StringeeSoftPhone.on("incomingScreenHide", () => log("incomingScreenHide"));

      StringeeSoftPhone.connect(accessToken);
      setConnected(true);
      toast.success(`Softphone connected as ${trimmed}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Connect failed — ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [userId, enableVideo, askCallType, log]);

  const stop = useCallback((): void => {
    const phone = phoneRef.current;
    if (!phone) return;
    try {
      phone.disconnect?.();
    } catch (err) {
      console.warn("disconnect failed:", err);
    }
    setConnected(false);
    setSignalState("idle");
    setAuthState("—");
    log("manual-disconnect");
    toast.info("Disconnected");
  }, [log]);

  const onKey = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") void start();
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-4">
      {/* ── Connect form ─────────────────────────────────────────────── */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body gap-4">
          <h2 className="card-title text-base">Stringee Agent Softphone</h2>
          <p className="text-xs text-base-content/60">
            Enter an agent user ID to mint an access token and launch the
            Stringee Softphone widget. The widget owns the dialpad / call UI;
            this page surfaces lifecycle events for debugging.
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
              disabled={loading || connected}
              autoFocus
            />
          </label>

          <div className="flex flex-wrap gap-4">
            <label className="label cursor-pointer gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={enableVideo}
                onChange={(e) => setEnableVideo(e.target.checked)}
                disabled={loading || connected}
              />
              <span className="label-text text-xs">Enable video call</span>
            </label>
            <label className="label cursor-pointer gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={askCallType}
                onChange={(e) => setAskCallType(e.target.checked)}
                disabled={loading || connected}
              />
              <span className="label-text text-xs">
                Ask call type before dial
              </span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              className="btn btn-primary btn-sm flex-1"
              onClick={() => void start()}
              disabled={loading || connected || !userId.trim()}
            >
              {loading ? (
                <span className="loading loading-spinner loading-xs" />
              ) : connected ? (
                "Connected"
              ) : (
                "Connect"
              )}
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={stop}
              disabled={!connected}
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      {/* ── Status panel ─────────────────────────────────────────────── */}
      {connected && (
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body gap-2">
            <h3 className="card-title text-sm">Status</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-base-content/60">Signaling:</span>
                <span
                  className={`badge badge-sm ${
                    signalState === "connected"
                      ? "badge-success"
                      : signalState === "disconnected" ||
                          signalState === "failed"
                        ? "badge-error"
                        : "badge-ghost"
                  }`}
                >
                  {signalState}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base-content/60">Authen:</span>
                <span className="badge badge-sm badge-ghost font-mono">
                  {authState}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Live activity ────────────────────────────────────────────── */}
      {activity.length > 0 && (
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body gap-2">
            <div className="flex items-center gap-2">
              <h3 className="card-title text-sm">Live activity</h3>
              <button
                className="btn btn-ghost btn-xs ml-auto"
                onClick={() => setActivity([])}
              >
                Clear
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-zebra table-xs">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Event</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.map((a) => (
                    <tr key={a.id}>
                      <td className="font-mono text-base-content/60">
                        {new Date(a.ts).toLocaleTimeString()}
                      </td>
                      <td className="font-mono">{a.event}</td>
                      <td className="font-mono text-base-content/70">
                        {a.detail ?? ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default SoftphonePage;
