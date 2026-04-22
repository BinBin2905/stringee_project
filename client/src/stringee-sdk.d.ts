// stringee.d.ts

type StringeeClientEvents =
  | "connect"
  | "authen"
  | "disconnect"
  | "requestnewtoken"
  | "incomingcall";

type IncomingCallData = {
  callId: string;
  from: string;
  to: string;
};

declare const StringeeUtil: {
  isWebRTCSupported(): boolean;
  [key: string]: any;
};

declare class StringeeClient {
  connect(token: string): void;
  disconnect(): void;
  on(event: StringeeClientEvents, cb: (...args: unknown[]) => void): void;
}

interface CallResponse {
  code: number;
  message: string;
}

type StringeeCallEvents =
  | "addremotestream"
  | "addlocalstream"
  | "signalingstate"
  | "mediastate"
  | "info"
  | "otherdevice";

interface SignalingState {
  code: number;
  reason: string;
  sipCode?: number;
  sipReason?: string;
}

declare class StringeeCall {
  constructor(
    client: StringeeClient,
    from: string,
    to: string,
    isVideoCall: boolean,
  );
  client: StringeeClient;
  from: string;
  to: string;
  isVideoCall: boolean;
  makeCall(cb: (res: CallResponse) => void): void;
  answer(cb: (res: CallResponse) => void): void;
  hangup(cb: (res: CallResponse) => void): void;
  reject(cb: (res: CallResponse) => void): void;

  on(event: StringeeCallEvents, cb: (...args: unknown[]) => void): void;
}

declare global {
  interface Window {
    StringeeClient: typeof StringeeClient;
    StringeeCall: typeof StringeeCall;
    StringeeUtil: typeof StringeeUtil;
  }
}
