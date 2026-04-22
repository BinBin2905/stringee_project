import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type FC,
  type KeyboardEvent,
} from "react";
import type {
  TokenPayload,
  SCCOAction,
  RecordFormat,
} from "@/api/types/ITypes";
import { decodeToken, formatTime, storage } from "@/utils/storage";
import {
  answerIncomingCall,
  connectToStringee,
  disconnectFromStringee,
  getClientToken,
  hangupCall,
  makeCall,
  rejectIncomingCall,
  setIncomingCallHandler,
} from "@/api/stringee";
import StringeeHeader from "@/component/stringee/StringeeHeader";
import StringeeBody from "@/component/stringee/StringeeBody";
import StringeeFooter from "@/component/stringee/StringeeFooter";

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

  const [record, setRecord] = useState<boolean>(false);
  const [recordFormat, setRecordFormat] = useState<RecordFormat>("mp3");
  const [recordStereo, setRecordStereo] = useState<boolean>(false);

  const [callReady, setCallReady] = useState<boolean>(false);

  const isExpired = tokenInfo?.exp ? tokenInfo.exp * 1000 < Date.now() : false;

  const [callee, setCallee] = useState<string>("");

  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [inCall, setInCall] = useState<boolean>(false);
  const [callStatus, setCallStatus] = useState<string>("");
  const [incomingCall, setIncomingCall] = useState<StringeeCall | null>(null);

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

  const copyToken = useCallback((): void => {
    if (!token) return;
    navigator.clipboard.writeText(token).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [token]);

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
          if (state.code === 6) {
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
    if (!incomingCall) return;
    try {
      answerIncomingCall({
        remoteMedia: remoteAudioRef.current,
        onSignalingState: (state) => {
          setCallStatus(state.reason ?? `code ${state.code}`);
          if (state.code === 6) {
            setInCall(false);
          }
        },
      });
      setInCall(true);
      setIncomingCall(null);
      setCallStatus("in call");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Answer failed");
    }
  }, [incomingCall]);

  const handleReject = useCallback((): void => {
    rejectIncomingCall();
    setIncomingCall(null);
    setCallStatus("rejected");
  }, []);

  const handleHangup = useCallback((): void => {
    hangupCall();
    setInCall(false);
    setCallStatus("Ended");
  }, []);

  useEffect(() => {
    return () => {
      hangupCall();
      disconnectFromStringee();
    };
  }, []);

  useEffect(() => {
    console.log(
      "Flag",
      setIncomingCallHandler((call) => setIncomingCall(call)),
    );
    setIncomingCallHandler((call) => setIncomingCall(call));
    return () => {
      console.log("Clearing incoming call handler");

      setIncomingCallHandler(null);
    };
  }, []);

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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") fetchToken();
  };

  const handleUserIdChange = (v: string): void => {
    setUserId(v);
    setError("");
  };

  const handleCalleeChange = (v: string): void => {
    setCallee(v);
    setError("");
  };

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
      <StringeeHeader connected={callReady && !isExpired} />

      <main className="mx-auto max-w-xl px-6 py-8 space-y-8">
        <StringeeBody
          serverUrl={serverUrl}
          onServerUrlChange={setServerUrl}
          userId={userId}
          onUserIdChange={handleUserIdChange}
          loading={loading}
          error={error}
          fetchToken={fetchToken}
          onKeyDown={handleKeyDown}
          record={record}
          onToggleRecord={toggleRecord}
          recordFormat={recordFormat}
          onRecordFormatChange={setRecordFormat}
          recordStereo={recordStereo}
          onRecordStereoChange={setRecordStereo}
          token={token}
          tokenInfo={tokenInfo}
          isExpired={isExpired}
          copied={copied}
          onCopyToken={copyToken}
          onClearToken={clearToken}
          infoRows={infoRows}
          callee={callee}
          onCalleeChange={handleCalleeChange}
          callReady={callReady}
          inCall={inCall}
          callStatus={callStatus}
          incomingCall={incomingCall}
          onMakeCall={handleMakeCall}
          onAnswer={handleAnswer}
          onReject={handleReject}
          onHangup={handleHangup}
          buildSCCO={buildSCCO}
          remoteAudioRef={remoteAudioRef}
        />

        <StringeeFooter />
      </main>
    </div>
  );
};

export default StringeeClient;
