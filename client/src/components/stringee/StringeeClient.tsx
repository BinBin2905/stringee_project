import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FC,
  type KeyboardEvent,
} from "react";
import type { RecordFormat, SccoAction, TokenPayload } from "@/types";
import { decodeToken } from "@/lib/jwt";
import { storage } from "@/lib/storage";
import { toast } from "@/lib/toast";
import { getClientToken } from "@/api/auth";
import {
  answerIncomingCall,
  connectToStringee,
  disconnectFromStringee,
  hangupCall,
  makeCall,
  rejectIncomingCall,
  setIncomingCallHandler,
} from "@/lib/stringee-sdk";
import TokenCard from "./TokenCard";
import RecordingCard from "./RecordingCard";
import CallCard from "./CallCard";

const StringeeClient: FC = () => {
  const [serverUrl, setServerUrl] = useState(
    import.meta.env.VITE_BASE_DEMO_PROJECT_URL,
  );
  const [userId, setUserId] = useState("");
  const [callee, setCallee] = useState("");

  const [token, setToken] = useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = useState<TokenPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [record, setRecord] = useState(false);
  const [recordFormat, setRecordFormat] = useState<RecordFormat>("mp3");
  const [recordStereo, setRecordStereo] = useState(false);

  const [callReady, setCallReady] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [callStatus, setCallStatus] = useState("");
  const [incomingCall, setIncomingCall] = useState<StringeeCall | null>(null);

  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const isExpired = tokenInfo?.exp ? tokenInfo.exp * 1000 < Date.now() : false;

  // Hydrate from this-tab's active user on mount.
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
      setRecord(saved.record);
      setRecordFormat(saved.recordFormat);
      setRecordStereo(saved.recordStereo);
      setCallReady(true);
    } else {
      storage.remove(activeId);
      storage.clearActiveUserId();
    }
  }, []);

  useEffect(() => {
    setIncomingCallHandler((call) => {
      setIncomingCall(call);
      if (call) toast.info(`Incoming call from ${call.from}`);
    });
    return () => {
      setIncomingCallHandler(null);
      hangupCall();
      disconnectFromStringee();
    };
  }, []);

  const fetchToken = useCallback(async () => {
    const trimmed = userId.trim();
    if (!trimmed) {
      setError("User ID required");
      toast.warning("User ID required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const fresh = await getClientToken(trimmed);
      const info = decodeToken(fresh);
      setToken(fresh);
      setTokenInfo(info);
      setCallReady(true);
      storage.set({
        token: fresh,
        userId: trimmed,
        record,
        recordFormat,
        recordStereo,
        savedAt: Date.now(),
      });
      storage.setActiveUserId(trimmed);
      connectToStringee(fresh);
      toast.success(`Token fetched for ${trimmed}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      const friendly =
        msg === "Failed to fetch" || msg.includes("Network")
          ? `Cannot reach ${serverUrl}`
          : msg;
      setError(friendly);
      toast.error(`Token fetch failed — ${friendly}`);
    } finally {
      setLoading(false);
    }
  }, [userId, record, recordFormat, recordStereo, serverUrl]);

  const copyToken = useCallback(() => {
    if (!token) return;
    navigator.clipboard.writeText(token).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Token copied to clipboard");
      },
      (err) => {
        toast.error(
          `Copy failed — ${err instanceof Error ? err.message : "clipboard unavailable"}`,
        );
      },
    );
  }, [token]);

  const clearToken = useCallback(() => {
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

  const toggleRecord = useCallback(() => {
    const next = !record;
    setRecord(next);
    const activeId = storage.getActiveUserId();
    if (!activeId) return;
    const saved = storage.get(activeId);
    if (saved) storage.set({ ...saved, record: next });
  }, [record]);

  const handleMakeCall = useCallback(() => {
    const from = userId.trim();
    const to = callee.trim();
    if (!from) {
      setError("Missing User ID (from)");
      toast.warning("Missing User ID (from)");
      return;
    }
    if (!to) {
      setError("Enter Callee ID first");
      toast.warning("Enter Callee ID first");
      return;
    }
    try {
      makeCall({
        from,
        to,
        isVideo: false,
        remoteMedia: remoteAudioRef.current,
        onSignalingState: (s) => {
          setCallStatus(s.reason ?? `code ${s.code}`);
          if (s.code === 6) {
            setInCall(false);
            toast.info(`Call ended — ${s.reason ?? `code ${s.code}`}`);
          }
        },
      });
      setInCall(true);
      setCallStatus("calling…");
      setError("");
      toast.info(`Calling ${to}…`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Call failed";
      setError(msg);
      toast.error(`Call failed — ${msg}`);
    }
  }, [userId, callee]);

  const handleAnswer = useCallback(() => {
    if (!incomingCall) return;
    answerIncomingCall({
      remoteMedia: remoteAudioRef.current,
      onSignalingState: (s) => {
        setCallStatus(s.reason ?? `code ${s.code}`);
        if (s.code === 6) {
          setInCall(false);
          toast.info(`Call ended — ${s.reason ?? `code ${s.code}`}`);
        }
      },
    });
    setInCall(true);
    setIncomingCall(null);
    setCallStatus("in call");
    setError("");
    toast.success("Call answered");
  }, [incomingCall]);

  const handleReject = useCallback(() => {
    rejectIncomingCall();
    setIncomingCall(null);
    setCallStatus("rejected");
    toast.info("Incoming call rejected");
  }, []);

  const handleHangup = useCallback(() => {
    hangupCall();
    setInCall(false);
    setCallStatus("ended");
    toast.info("Call hung up");
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") fetchToken();
  };

  const scco: SccoAction[] = (() => {
    const actions: SccoAction[] = [];
    if (record) {
      actions.push({
        action: "record",
        eventUrl: `${serverUrl}/event/recording-done`,
        format: recordFormat,
        recordStereo,
      });
    }
    const target = callee.trim() || "TARGET_NUMBER";
    actions.push({
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
    return actions;
  })();

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 space-y-4">
      <TokenCard
        serverUrl={serverUrl}
        onServerUrlChange={setServerUrl}
        userId={userId}
        onUserIdChange={(v) => {
          setUserId(v);
          setError("");
        }}
        loading={loading}
        error={error}
        onFetch={fetchToken}
        onKeyDown={handleKeyDown}
        token={token}
        tokenInfo={tokenInfo}
        isExpired={isExpired}
        copied={copied}
        onCopy={copyToken}
        onClear={clearToken}
      />

      <RecordingCard
        record={record}
        onToggle={toggleRecord}
        format={recordFormat}
        onFormatChange={setRecordFormat}
        stereo={recordStereo}
        onStereoChange={setRecordStereo}
      />

      {callReady && !isExpired && (
        <CallCard
          callee={callee}
          onCalleeChange={(v) => {
            setCallee(v);
            setError("");
          }}
          onKeyDown={handleKeyDown}
          inCall={inCall}
          callStatus={callStatus}
          incomingCall={incomingCall}
          onMakeCall={handleMakeCall}
          onAnswer={handleAnswer}
          onReject={handleReject}
          onHangup={handleHangup}
          scco={scco}
          remoteAudioRef={remoteAudioRef}
        />
      )}
    </main>
  );
};

export default StringeeClient;
