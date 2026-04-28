import { storage } from "@/lib/storage";
import { toast } from "@/lib/toast";
import { getClientToken } from "@/api/auth";
import type { CallMediaOptions, MakeCallOptions } from "@/types";

type IncomingCallHandler = (call: StringeeCall | null) => void;

let client: StringeeClient | null = null;
let currentCall: StringeeCall | null = null;
let onIncomingCall: IncomingCallHandler | null = null;

export const setIncomingCallHandler = (cb: IncomingCallHandler | null): void => {
  onIncomingCall = cb;
};

export function connectToStringee(token: string): StringeeClient {
  disconnectFromStringee();
  client = new StringeeClient();

  client.on("connect", () => console.log("stringee: connected"));
  client.on("authen", (res) => console.log("stringee: authen", res));
  client.on("disconnect", () => console.log("stringee: disconnected"));

  client.on("requestnewtoken", async () => {
    const activeId = storage.getActiveUserId();
    if (!activeId) return;
    try {
      const newToken = await getClientToken(activeId);
      const saved = storage.get(activeId);
      if (saved) storage.set({ ...saved, token: newToken, savedAt: Date.now() });
      client?.connect(newToken);
      toast.success("Token refreshed");
    } catch (err) {
      console.error("requestnewtoken failed", err);
      toast.error(
        `Token refresh failed — ${err instanceof Error ? err.message : "unknown error"}`,
      );
    }
  });

  client.on("incomingcall", (incoming) => {
    currentCall = incoming as StringeeCall;
    onIncomingCall?.(currentCall);
  });

  client.connect(token);
  return client;
}

export function disconnectFromStringee(): void {
  if (!client) return;
  try {
    client.disconnect();
  } catch {
    /* socket already closed */
  }
  client = null;
}

function bindCallEvents(call: StringeeCall, opts: CallMediaOptions): void {
  call.on("addremotestream", (stream) => {
    if (opts.remoteMedia) opts.remoteMedia.srcObject = stream as MediaStream;
  });
  call.on("addlocalstream", (stream) => {
    if (opts.localMedia) opts.localMedia.srcObject = stream as MediaStream;
  });
  call.on("signalingstate", (state) => {
    const s = state as SignalingState;
    if (s.code === 6) hangupCall();
    opts.onSignalingState?.(s);
  });
}

export function makeCall(opts: MakeCallOptions): StringeeCall {
  if (!client) throw new Error("Stringee client not connected");
  hangupCall();
  const call = new StringeeCall(client, opts.from, opts.to, false);
  currentCall = call;
  bindCallEvents(call, opts);
  call.makeCall((res) => opts.onCallResponse?.(res));
  return call;
}

export function answerIncomingCall(opts: CallMediaOptions): void {
  if (!currentCall) return;
  bindCallEvents(currentCall, opts);
  currentCall.answer(() => {});
}

export function rejectIncomingCall(): void {
  if (!currentCall) return;
  currentCall.reject(() => {});
  currentCall = null;
}

export function hangupCall(): void {
  if (!currentCall) return;
  try {
    currentCall.hangup(() => {});
  } catch {
    /* already ended */
  }
  currentCall = null;
}
