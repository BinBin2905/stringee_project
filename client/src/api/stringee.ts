import backendApi from "./axios";
import { storage } from "@/utils/storage";
import type { CallMediaOptions, MakeCallOptions } from "./types/ITypes";

type IncomingCallHandler = (call: StringeeCall | null) => void;

let client: StringeeClient | null = null;
let currentCall: StringeeCall | null = null;

let onIncomingCall: IncomingCallHandler | null = null;

export const setIncomingCallHandler = (cb: IncomingCallHandler | null) => {
  onIncomingCall = cb;
};

export async function getClientToken(userId: string): Promise<string> {
  const res = await backendApi.post("/api/token", { id: userId });
  return res.data.token;
}

export function connectToStringee(token: string): StringeeClient {
  console.log(
    "StringeeUtil.isWebRTCSupported:",
    StringeeUtil.isWebRTCSupported(),
  );

  disconnectFromStringee();

  client = new StringeeClient();

  client.on("connect", () => {
    console.log("connected");
  });

  client.on("authen", (res) => {
    console.log("authen", res);
  });

  client.on("disconnect", () => {
    console.log("disconnected");
  });

  client.on("requestnewtoken", async () => {
    const activeId = storage.getActiveUserId();
    if (!activeId) {
      console.warn("requestnewtoken: no active user in this tab");
      return;
    }
    try {
      const newToken = await getClientToken(activeId);
      const saved = storage.get(activeId);
      if (saved) {
        storage.set({ ...saved, token: newToken, savedAt: Date.now() });
      }
      client?.connect(newToken);
    } catch (err) {
      console.error("requestnewtoken: failed to refresh token", err);
    }
  });

  client.on("incomingcall", (incoming: StringeeCall) => {
    console.log("incomingcall", incoming);
    currentCall = incoming;
    onIncomingCall?.(incoming);
  });

  client.connect(token);
  return client;
}

export function setCallEvent(callEvent: StringeeCall, opts: CallMediaOptions) {
  callEvent.on("addremotestream", (stream) => {
    // console.log("addremotestream");
    if (opts.remoteMedia) {
      opts.remoteMedia.srcObject = null;
      opts.remoteMedia.srcObject = stream as MediaStream;
    }
  });

  callEvent.on("addlocalstream", (stream) => {
    // console.log("addlocalstream");
    if (opts.localMedia) {
      opts.localMedia.srcObject = null;
      opts.localMedia.srcObject = stream as MediaStream;
    }
  });

  callEvent.on("signalingstate", (state) => {
    const s = state as SignalingState;
    console.log("signalingstate", s);
    if (s.code === 6) hangupCall(); // ended
    opts.onSignalingState?.(s);
  });

  callEvent.on("mediastate", (state) => {
    // console.log("mediastate", state);
  });

  callEvent.on("info", (info) => {
    // console.log("info:", info);
  });
}

export function makeCall(opts: MakeCallOptions): StringeeCall {
  hangupCall();
  const call = new StringeeCall(client, opts.from, opts.to, false);
  console.log("call", call);
  currentCall = call;
  console.log("currentCall", currentCall);
  setCallEvent(call, opts);

  call.makeCall((res) => {
    // console.log("makeCall response:", res);
    opts.onCallResponse?.(res);
  });

  return call;
}

//=======================================HELPERS===================================================================//
export function answerIncomingCall(opts: CallMediaOptions): void {
  if (!currentCall) return;
  setCallEvent(currentCall, opts);
  currentCall.answer((res: unknown) => console.log("answer res", res));
}

export function rejectIncomingCall(): void {
  if (!currentCall) return;
  currentCall.reject((res: unknown) => console.log("reject res", res));
  currentCall = null;
}

export function disconnectFromStringee(): void {
  if (!client) return;
  try {
    client.disconnect();
  } catch {
    // ignore — SDK may throw if socket is already closed
  }
  client = null;
}

export function getStringeeClient(): StringeeClient | null {
  return client;
}

export function hangupCall(): void {
  if (!currentCall) return;
  console.log(storage.getActiveUserId());
  console.log("Hanging up call", currentCall);
  try {
    currentCall.hangup(() => {});
  } catch {
    // call already ended
  }
  currentCall = null;
}

export function getCurrentCall(): StringeeCall | null {
  return currentCall;
}
