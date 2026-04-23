// Client-side types. Kept flat and minimal. Domain types (SCCO, Party)
// mirror the server's types/stringee.ts — duplicated deliberately so the
// client has no server dependency.

export type RecordFormat = "mp3" | "wav" | "mp4";
export type PartyType = "internal" | "external";

export interface Party {
  type: PartyType;
  number: string;
  alias: string;
}

export interface SccoRecord {
  action: "record";
  eventUrl: string;
  format: RecordFormat;
  recordStereo?: boolean;
}

export interface SccoConnect {
  action: "connect";
  from: Party;
  to: Party;
  peerToPeerCall?: boolean;
  timeout?: number;
}

export type SccoAction = SccoRecord | SccoConnect;

// JWT payload returned by POST /api/token
export interface TokenPayload {
  jti: string;
  iss: string;
  exp: number;
  iat: number;
  userId?: string;
  rest_api?: boolean;
}

// What we persist per-user in localStorage
export interface SavedToken {
  token: string;
  userId: string;
  record: boolean;
  recordFormat: RecordFormat;
  recordStereo: boolean;
  savedAt: number;
}

// SDK call options used by lib/stringee-sdk.ts
export interface CallMediaOptions {
  remoteMedia?: HTMLMediaElement | null;
  localMedia?: HTMLMediaElement | null;
  onSignalingState?: (state: SignalingState) => void;
  onCallResponse?: (res: CallResponse) => void;
}

export interface MakeCallOptions extends CallMediaOptions {
  from: string;
  to: string;
  isVideo?: boolean;
}

// Stringee REST API envelope (matches server types/api.ts)
export interface StringeeResponse<T = unknown> {
  r: number;
  message?: string;
  data?: T;
}

// Our own proxy result, surfaced to UI components
export interface ApiResult<T = unknown> {
  status: number;
  data: T;
}
