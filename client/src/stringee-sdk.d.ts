// Ambient declarations for the Stringee Web SDK globals
// (developer.stringee.com/docs/javascript-sdk).

// ─── Shared ────────────────────────────────────────────────────────────

interface CallResponse {
  code: number;
  message: string;
}

// state codes documented in the JS SDK; signaling and media events emit
// objects, not raw integers.
interface SignalingState {
  code: number;
  reason: string;
  sipCode?: number;
  sipReason?: string;
}

interface MediaState {
  code: number;
  description?: string;
}

interface IncomingCallData {
  callId: string;
  from: string;
  to: string;
}

interface VideoResolution {
  width: number;
  height: number;
}

// ─── StringeeClient ────────────────────────────────────────────────────

type StringeeClientEvents =
  | "connect"
  | "authen"
  | "disconnect"
  | "requestnewtoken"
  | "incomingcall"
  | "incomingcall2"
  | "customMessage"
  | "otherdeviceauthen";

declare class StringeeClient {
  accessToken?: string;
  userId?: string;
  connect(token: string): void;
  disconnect(): void;
  sendCustomMessage(
    userId: string,
    data: Record<string, unknown>,
    cb: (res: CallResponse) => void,
  ): void;
  on(event: StringeeClientEvents, cb: (...args: unknown[]) => void): void;
}

// ─── StringeeCall / StringeeCall2 ──────────────────────────────────────

type StringeeCallEvents =
  | "addremotestream"
  | "addlocalstream"
  | "signalingstate"
  | "mediastate"
  | "info"
  | "otherdevice"
  | "callstats";

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
  fromAlias?: string;
  toAlias?: string;
  callId?: string;
  isVideoCall: boolean;
  isIncomingCall?: boolean;
  isAnswered?: boolean;
  ended?: boolean;
  localVideoEnabled?: boolean;
  videoResolution?: VideoResolution;
  custom?: string;
  customDataFromYourServer?: string;
  fromInternal?: boolean;
  answeredOnAnotherDevice?: boolean;

  makeCall(cb: (res: CallResponse) => void): void;
  answer(cb: (res: CallResponse) => void): void;
  reject(cb: (res: CallResponse) => void): void;
  ringing(cb: (res: CallResponse) => void): void;
  hangup(cb: (res: CallResponse) => void): void;
  sendInfo(info: Record<string, unknown>, cb: (res: CallResponse) => void): void;
  sendDtmf(digits: string, cb: (res: CallResponse) => void): void;
  hold(): void;
  unhold(): void;
  sendTransfer(userId: string, cb: (res: CallResponse) => void): void;
  mute(enabled: boolean): void;

  on(event: StringeeCallEvents, cb: (...args: unknown[]) => void): void;
}

declare class StringeeCall2 {
  constructor(
    client: StringeeClient,
    from: string,
    to: string,
    isVideoCall: boolean,
  );
  client: StringeeClient;
  callId?: string;
  isVideoCall: boolean;
  isIncomingCall?: boolean;
  isAnswered?: boolean;
  ended?: boolean;
  localVideoEnabled?: boolean;
  customDataFromYourServer?: string;

  makeCall(cb: (res: CallResponse) => void): void;
  answer(cb: (res: CallResponse) => void): void;
  reject(cb: (res: CallResponse) => void): void;
  hangup(cb: (res: CallResponse) => void): void;
  mute(enabled: boolean): void;
  enableLocalVideo(enabled: boolean): void;
  sendInfo(info: Record<string, unknown>, cb: (res: CallResponse) => void): void;

  on(event: StringeeCallEvents, cb: (...args: unknown[]) => void): void;
}

// ─── StringeeUtil ──────────────────────────────────────────────────────

declare const StringeeUtil: {
  isWebRTCSupported(): boolean;
  [key: string]: unknown;
};

declare global {
  interface Window {
    StringeeClient: typeof StringeeClient;
    StringeeCall: typeof StringeeCall;
    StringeeCall2: typeof StringeeCall2;
    StringeeUtil: typeof StringeeUtil;
  }
}
