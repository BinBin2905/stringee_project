import backendApi from "./axios";
import { storage } from "@/utils/storage";
import type { IncomingCallInfo, MakeCallOptions } from "./types/ITypes";

type IncomingCallHandler = (info: IncomingCallInfo | null) => void;

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

  client.on("incomingcall", (incoming) => {
    console.log(incoming);
    const call = incoming as StringeeCall & {
      from: string;
      to: string;
      callId?: string;
    };
    console.log("incomingcall", call);
    currentCall = call;
    onIncomingCall?.({ from: call.from, to: call.to, callId: call.callId });
    setCallEvent(call, incoming as MakeCallOptions);
    var answer = confirm(
      "Incoming call from: " + call.from + ", do you want to answer?",
    );
    if (answer) {
      call.answer(function (res) {
        console.log("answer res", res);
      });
    } else {
      call.reject(function (res) {
        console.log("reject res", res);
      });
    }
  });

  client.connect(token);
  return client;
}

export function setCallEvent(callEvent: StringeeCall, opts: MakeCallOptions) {
  callEvent.on("addremotestream", (stream) => {
    console.log("addremotestream");
    if (opts.remoteMedia) {
      opts.remoteMedia.srcObject = null;
      opts.remoteMedia.srcObject = stream as MediaStream;
    }
  });

  callEvent.on("addlocalstream", (stream) => {
    console.log("addlocalstream");
    if (opts.localMedia) {
      opts.localMedia.srcObject = null;
      opts.localMedia.srcObject = stream as MediaStream;
    }
  });

  callEvent.on("signalingstate", (state) => {
    const s = state as SignalingState;
    console.log("signalingstate", s);
    opts.onSignalingState?.(s);
  });

  callEvent.on("mediastate", (state) => {
    console.log("mediastate", state);
  });

  callEvent.on("info", (info) => {
    console.log("info:", info);
  });
}

export function makeCall(opts: MakeCallOptions): StringeeCall {
  hangupCall();
  const call = new StringeeCall(client, opts.from, opts.to, false);
  console.log("call", call);

  setCallEvent(call, opts);

  call.makeCall((res) => {
    console.log("makeCall response:", res);
    opts.onCallResponse?.(res);
  });

  currentCall = call;
  return call;
}

//=======================================HELPERS===================================================================//
export function answerCall(answer: boolean): boolean {
  return answer;
}
// export function rejectCall(): void {
//   answer = false;
// }
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
