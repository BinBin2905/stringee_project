import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type FC,
  type KeyboardEvent,
} from "react";
import {
  IconKey,
  IconPhone,
  IconMic,
  IconCopy,
  IconCheck,
  IconTrash,
  IconAlert,
} from "@/component/icons/svgComponent";
import type {
  TokenPayload,
  SCCOAction,
  RecordFormat,
  IncomingCallInfo,
} from "@/api/types/ITypes";
import { decodeToken, formatTime, storage } from "@/utils/storage";
import {
  answerCall,
  connectToStringee,
  disconnectFromStringee,
  getClientToken,
  hangupCall,
  makeCall,
  // rejectCall,
  setIncomingCallHandler,
} from "@/api/stringee";

// ── Main Component ─────────────────────────────────────────
const StringeeClient: FC = () => {
  const [userId, setUserId] = useState<string>("");
  const [serverUrl, setServerUrl] = useState<string>(
    `${import.meta.env.VITE_BASE_DEMO_PROJECT_URL}`,
  );

  const [token, setToken] = useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = useState<TokenPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Recording options
  const [record, setRecord] = useState<boolean>(false);
  const [recordFormat, setRecordFormat] = useState<RecordFormat>("mp3");
  const [recordStereo, setRecordStereo] = useState<boolean>(false);

  const [callReady, setCallReady] = useState<boolean>(false);

  const isExpired = tokenInfo?.exp ? tokenInfo.exp * 1000 < Date.now() : false;

  const [callee, setCallee] = useState<string>("");

  // Call state
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [inCall, setInCall] = useState<boolean>(false);
  const [callStatus, setCallStatus] = useState<string>("");
  const [incomingCall, setIncomingCall] = useState<IncomingCallInfo | null>(
    null,
  );

  // ── Load saved token for this tab's active user ──
  useEffect(() => {
    const activeId = storage.getActiveUserId();
    if (!activeId) return;

    const saved = storage.get(activeId);
    if (!saved?.token) {
      storage.clearActiveUserId();
      return;
    }

    const info = decodeToken(saved.token);
    if (info && info.exp * 1000 > Date.now()) {
      setToken(saved.token);
      setTokenInfo(info);
      setUserId(saved.userId);
      setRecord(saved.record ?? false);
      setRecordFormat(saved.recordFormat ?? "mp3");
      setRecordStereo(saved.recordStereo ?? false);
      setCallReady(true);
    } else {
      storage.remove(activeId);
      storage.clearActiveUserId();
    }
  }, []);

  // ── Fetch token ──
  const fetchToken = useCallback(async (): Promise<void> => {
    const trimmed = userId.trim();
    if (!trimmed) {
      setError("Vui lòng nhập User ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = await getClientToken(trimmed);

      if (!token) throw new Error("Response không chứa token");
      const info = decodeToken(token);

      setToken(token);
      setTokenInfo(info);
      setCallReady(true);

      storage.set({
        token,
        userId: trimmed,
        record,
        recordFormat,
        recordStereo,
        savedAt: Date.now(),
      });
      storage.setActiveUserId(trimmed);
      connectToStringee(token);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi không xác định";
      setError(
        msg === "Failed to fetch" ? `Không kết nối được ${serverUrl}` : msg,
      );
    } finally {
      setLoading(false);
    }
  }, [userId, serverUrl, record, recordFormat, recordStereo]);

  // ── Copy token ──
  const copyToken = useCallback((): void => {
    if (!token) return;
    navigator.clipboard.writeText(token).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [token]);

  // ── Clear token (this tab only) ──
  const clearToken = useCallback((): void => {
    const activeId = storage.getActiveUserId();
    hangupCall();
    disconnectFromStringee();
    setToken(null);
    setTokenInfo(null);
    setCallReady(false);
    setInCall(false);
    setCallStatus("");
    setIncomingCall(null);
    if (activeId) storage.remove(activeId);
    storage.clearActiveUserId();
  }, []);

  const handleMakeCall = useCallback((): void => {
    const from = userId.trim();
    const to = callee.trim();
    if (!from) {
      setError("Thiếu User ID (from)");
      return;
    }
    if (!to) {
      setError("Nhập Callee ID trước khi gọi");
      return;
    }

    try {
      makeCall({
        from: userId,
        to: callee,
        isVideo: false,
        remoteMedia: remoteAudioRef.current,
        onSignalingState: (state) => {
          setCallStatus(state.reason ?? `code ${state.code}`);
          if (state.code === 3 || state.code === 4) {
            setInCall(false);
          }
        },
        onCallResponse: (res) => {
          console.log("Call response:", res);
        },
      });
      setInCall(true);
      setCallStatus("calling...");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Call failed");
    }
  }, [userId, callee]);
  const handleAnswer = useCallback((): void => {
    try {
      answerCall(true);
      setInCall(true);
      setIncomingCall(null);
      setCallStatus("in call");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Answer failed");
    }
  }, []);

  const handleReject = useCallback((): void => {
    answerCall(false);
    // rejectCall();
    setIncomingCall(null);
    setCallStatus("rejected");
  }, []);

  // ── Hang up ──
  const handleHangup = useCallback((): void => {
    hangupCall();
    setInCall(false);
    setCallStatus("ended");
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      hangupCall();
      disconnectFromStringee();
    };
  }, []);

  useEffect(() => {
    setIncomingCallHandler((call) => {
      setIncomingCall(call);
    });
  }, []);

  // ── Toggle record & persist ──
  const toggleRecord = (): void => {
    const next = !record;
    setRecord(next);
    const activeId = storage.getActiveUserId();
    if (!activeId) return;
    const saved = storage.get(activeId);
    if (saved) {
      storage.set({ ...saved, record: next, recordFormat, recordStereo });
    }
  };

  // ── Build SCCO preview ──
  const buildSCCO = (): SCCOAction[] => {
    const scco: SCCOAction[] = [];

    if (record) {
      scco.push({
        action: "record",
        eventUrl: `${serverUrl}/event/recording-done`,
        format: recordFormat,
        recordStereo,
      });
    }

    const target = callee.trim() || "TARGET_NUMBER";
    scco.push({
      action: "connect",
      from: {
        type: "internal",
        number: userId || "caller",
        alias: userId || "caller",
      },
      to: {
        type: Number.isInteger(parseInt(target)) ? "external" : "internal",
        number: target,
        alias: target,
      },
      ...(record ? { peerToPeerCall: false } : {}),
      timeout: 45,
    });

    return scco;
  };

  // ── Key handler ──
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") fetchToken();
  };

  // ── Token info rows ──
  const infoRows: [string, string, boolean?][] = tokenInfo
    ? [
        ["USER ID", tokenInfo.userId ?? "—"],
        ["ISSUER", tokenInfo.iss ?? "—"],
        ["ISSUED AT", formatTime(tokenInfo.iat)],
        ["EXPIRES", formatTime(tokenInfo.exp), isExpired],
      ]
    : [];

  return (
    <div className="min-h-screen bg-white font-mono text-black">
      {/* ── Header ── */}
      <header className="border-b border-gray-200 px-6 py-4">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`h-2 w-2 rounded-full ${callReady && !isExpired ? "bg-black" : "bg-gray-300"}`}
            />
            <span className="text-xs font-semibold uppercase tracking-widest">
              Stringee Client
            </span>
          </div>
          <span className="text-[11px] tracking-wide text-gray-400">
            {callReady && !isExpired ? "CONNECTED" : "DISCONNECTED"}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-6 py-8 space-y-8">
        {/* ── Server URL ── */}
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Server URL
          </label>
          <input
            type="text"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="http://localhost:3000"
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-black outline-none transition focus:border-black"
          />
        </div>

        {/* ── User ID + Submit ── */}
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            User ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="agent_01"
              disabled={loading}
              className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-black outline-none transition focus:border-black disabled:opacity-50"
            />
            <button
              onClick={fetchToken}
              disabled={loading || !userId.trim()}
              className="flex items-center gap-1.5 whitespace-nowrap rounded bg-black px-4 py-2 text-xs font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-gray-500 border-t-white" />
                  <span>Đang lấy...</span>
                </>
              ) : (
                <>
                  <IconKey />
                  <span>Lấy Token</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-2 flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2">
              <IconAlert />
              <span className="text-xs text-gray-500">{error}</span>
            </div>
          )}
        </div>

        {/* ── Recording Options ── */}
        <div className="rounded-md border border-gray-200 p-5">
          <div
            className={`flex items-center justify-between ${record ? "mb-4" : ""}`}
          >
            <div className="flex items-center gap-2">
              <IconMic />
              <span className="text-xs font-semibold uppercase tracking-widest">
                Ghi âm cuộc gọi
              </span>
            </div>

            {/* Toggle switch */}
            <button
              onClick={toggleRecord}
              className={`relative h-5.5 w-10 rounded-full transition-colors ${record ? "bg-black" : "bg-gray-300"}`}
              aria-label="Toggle recording"
            >
              <div
                className={`absolute top-0.75 h-4 w-4 rounded-full bg-white shadow transition-[left] ${record ? "left-5.25" : "left-0.75"}`}
              />
            </button>
          </div>

          {record && (
            <div className="flex gap-8">
              {/* Format */}
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  Format
                </label>
                <div className="flex gap-1">
                  {(["mp3", "wav"] as RecordFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setRecordFormat(fmt)}
                      className={`rounded border px-3 py-1 text-xs transition ${
                        recordFormat === fmt
                          ? "border-black bg-black text-white"
                          : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stereo */}
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  Stereo
                </label>
                <div className="flex gap-1">
                  {[false, true].map((val) => (
                    <button
                      key={String(val)}
                      onClick={() => setRecordStereo(val)}
                      className={`rounded border px-3 py-1 text-xs transition ${
                        recordStereo === val
                          ? "border-black bg-black text-white"
                          : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      {val ? "ON" : "OFF"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Token Display ── */}
        {token && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                Token
              </label>
              <div className="flex gap-1">
                <button
                  onClick={copyToken}
                  className="flex items-center gap-1 rounded border border-gray-200 px-2 py-0.5 text-[11px] text-gray-600 transition hover:border-gray-400"
                >
                  {copied ? <IconCheck /> : <IconCopy />}
                  {copied ? "Đã copy" : "Copy"}
                </button>
                <button
                  onClick={clearToken}
                  className="flex items-center rounded border border-gray-200 px-2 py-0.5 text-gray-400 transition hover:border-gray-400 hover:text-gray-600"
                >
                  <IconTrash />
                </button>
              </div>
            </div>

            {/* Token string */}
            <div className="max-h-24 overflow-auto break-all rounded border border-gray-200 bg-gray-50 p-3 font-mono text-[11px] leading-relaxed text-gray-600">
              {token}
            </div>

            {/* Token info grid */}
            {tokenInfo && (
              <div className="mt-2 grid grid-cols-2 overflow-hidden rounded border border-gray-200">
                {infoRows.map(([label, value, expired]) => (
                  <div
                    key={label}
                    className="border-b border-r border-gray-200 px-3 py-2 last:border-r-0 nth-2:border-r-0 nth-last-[-n+2]:border-b-0"
                  >
                    <div className="text-[10px] uppercase tracking-widest text-gray-400">
                      {label}
                    </div>
                    <div
                      className={`mt-0.5 text-xs ${expired ? "text-red-600" : "text-black"}`}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="mb-1 mt-3 block text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                Callee ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={callee}
                  onChange={(e) => {
                    setCallee(e.target.value);
                    setError("");
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="callee"
                  disabled={loading}
                  className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-black outline-none transition focus:border-black disabled:opacity-50"
                />
              </div>
            </div>

            {isExpired && (
              <div className="mt-2 flex items-center gap-1.5 rounded border border-gray-200 bg-gray-50 px-3 py-1.5 text-[11px] text-gray-400">
                <IconAlert />
                Token đã hết hạn — nhấn "Lấy Token" để tạo mới
              </div>
            )}
          </div>
        )}

        {/* ── Ready to Call ── */}
        {callReady && !isExpired && (
          <div className="rounded-md border border-black p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconPhone />
                <span className="text-xs font-semibold uppercase tracking-widest">
                  Sẵn sàng gọi
                </span>
              </div>
              <span
                className={`rounded px-2 py-0.5 text-[10px] tracking-wide ${
                  record ? "bg-black text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {record
                  ? `REC ${recordFormat.toUpperCase()}${recordStereo ? " STEREO" : ""}`
                  : "NO REC"}
              </span>
            </div>

            {/* SCCO Preview */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                SCCO sẽ được gửi
              </label>
              <pre className="max-h-56 overflow-auto rounded border border-gray-200 bg-gray-50 p-3 font-mono text-[11px] leading-relaxed text-gray-600">
                {JSON.stringify(buildSCCO(), null, 2)}
              </pre>
            </div>

            {/* Call status */}
            {(inCall || callStatus) && (
              <div className="mt-3 flex items-center justify-between rounded border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] text-gray-600">
                <span className="uppercase tracking-widest text-gray-400">
                  Status
                </span>
                <span>{callStatus || "—"}</span>
              </div>
            )}

            {inCall ? (
              <button
                onClick={handleHangup}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded bg-red-600 py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-red-700"
              >
                <IconPhone />
                Hang up
              </button>
            ) : incomingCall ? (
              <div className="mt-3 space-y-2">
                <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] text-gray-600">
                  Incoming call from{" "}
                  <span className="font-semibold text-black">
                    {incomingCall.from}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAnswer}
                    className="flex flex-1 items-center justify-center gap-2 rounded bg-green-500 py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-green-600"
                  >
                    <IconPhone />
                    Answer
                  </button>
                  <button
                    onClick={handleReject}
                    className="flex flex-1 items-center justify-center gap-2 rounded bg-red-600 py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-red-700"
                  >
                    <IconPhone />
                    Reject
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleMakeCall}
                disabled={!callee.trim()}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded bg-black py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <IconPhone />
                Make Call
              </button>
            )}

            {/* Hidden remote audio sink — SDK writes the remote MediaStream here */}
            <audio
              ref={remoteAudioRef}
              autoPlay
              playsInline
              className="hidden"
            />
          </div>
        )}

        {/* ── Footer ── */}
        <div className="border-t border-gray-100 pt-4 text-[11px] leading-relaxed text-gray-300">
          <p>
            Token lưu tại{" "}
            <code className="rounded bg-gray-50 px-1 py-px text-gray-400">
              localStorage → stringee_token:&lt;userId&gt;
            </code>
          </p>
          <p className="mt-1">
            User đang chọn (theo tab):{" "}
            <code className="rounded bg-gray-50 px-1 py-px text-gray-400">
              sessionStorage → stringee_active_user
            </code>
          </p>
          <p className="mt-1">
            Endpoint:{" "}
            <code className="rounded bg-gray-50 px-1 py-px text-gray-400">
              POST /api/token
            </code>
          </p>
        </div>
      </main>
    </div>
  );
};

export default StringeeClient;
