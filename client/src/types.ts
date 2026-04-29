// Client-side types. Domain types (SCCO, Party, events) mirror the server's
// types/stringee.ts — duplicated deliberately so the client has no server
// dependency. Aligned with developer.stringee.com/docs.

// ─── Shared primitives ─────────────────────────────────────────────────

export type RecordFormat = "mp3" | "wav" | "mp4";
export type PartyType = "internal" | "external";

export interface Party {
  type: PartyType;
  number: string;
  alias: string;
  is_online?: boolean;
}

export type TalkVoice =
  | "female"
  | "male"
  | "hatieumai"
  | "ngoclam"
  | "banmai"
  | "leminh"
  | "myan"
  | "lannhi"
  | "sg_male_xuankien_vdts_48k-hsmm"
  | "sg_female_xuanhong_vdts_48k-hsmm"
  | "hn_male_xuantin_vdts_48k-hsmm"
  | "hn_female_thutrang_phrase_48k-hsmm";

// ─── SCCO ──────────────────────────────────────────────────────────────

export type SccoActionType =
  | "connect"
  | "record"
  | "recordMessage"
  | "talk"
  | "play"
  | "stream"
  | "input";

export interface SccoConnect {
  action: "connect";
  from: Party;
  to: Party;
  customData?: string;
  continueOnFail?: boolean;
  onFailEventUrl?: string;
  timeout?: number;
  maxConnectTime?: number;
  peerToPeerCall?: boolean;
  maxConnection?: number;
}

export interface SccoRecord {
  action: "record";
  eventUrl?: string;
  format?: RecordFormat;
  recordStereo?: boolean;
}

export interface SccoRecordMessage {
  action: "recordMessage";
  eventUrl?: string;
  format?: RecordFormat;
  endOnKey?: string;
  timeout?: number;
  beepStart?: boolean;
}

export interface SccoTalk {
  action: "talk";
  text: string;
  voice?: TalkVoice;
  speed?: number;
  bargeIn?: boolean;
  loop?: number;
  silenceTime?: number;
  answerCall?: boolean;
  continueWhilePlay?: boolean;
}

export interface SccoPlay {
  action: "play";
  fileName: string;
  bargeIn?: boolean;
  loop?: number;
  silenceTime?: number;
  answerCall?: boolean;
  continueWhilePlay?: boolean;
}

export interface SccoStream {
  action: "stream";
  fileName: string;
  bargeIn?: boolean;
  loop?: number;
  silenceTime?: number;
  answerCall?: boolean;
  continueWhilePlay?: boolean;
}

export interface SccoInput {
  action: "input";
  eventUrl: string;
  timeOut?: number;
  submitOnHash?: boolean;
  customField?: string;
  maxDigits?: number;
}

export type SccoAction =
  | SccoConnect
  | SccoRecord
  | SccoRecordMessage
  | SccoTalk
  | SccoPlay
  | SccoStream
  | SccoInput;

// Mảng SCCO trả về từ answer_url.
export type SCCO = SccoAction[];

// Body Stringee POSTs to the eventUrl of an `input` action when DTMF is
// collected (or the input times out).
export interface SccoInputResult {
  time: string;
  dtmf: string;
  call_id: string;
  customField?: string;
  timeout: boolean;
}

// ─── Call events / status ──────────────────────────────────────────────

export type CallStatus =
  | "created"
  | "started"
  | "ringing"
  | "answered"
  | "ended"
  | "agentEnded"
  | "connect_failed";

export type CallType = "IVR" | "CALL" | "CONFERENCE";

export type CallCreatedReason =
  | "CLIENT_MAKE_CALL"
  | "EXTERNAL_CALL_IN"
  | "SERVER_CALL_OUT_BY_MAKE_CALL_TO_APP_BEFORE"
  | "SERVER_CALL_OUT_BY_MAKE_CALL_TO_EXTERNAL_BEFORE";

export type EndCallCause =
  | "USER_END_CALL"
  | "CAN_NOT_MAKE_CALL"
  | "MAX_CONNECT_TIME"
  | string; // SIP codes — e.g. "486 Busy Here", "480 Temporarily Unavailable"

export type EndedBy = "EXTERNAL" | "INTERNAL";

// Webhook payload Stringee POSTs to event_url.
export interface CallEventBody {
  call_status: CallStatus;
  project_id: number;
  request_from_user_id?: string;
  account_sid?: string;
  timestamp_ms: number;
  from: Party;
  to: Party;
  type: "stringee_call";
  call_id: string;
  clientCustomData?: string;
  // Available when call_status = "ended":
  callCreatedReason?: CallCreatedReason;
  endCallCause?: EndCallCause;
  endedBy?: EndedBy;
  callType?: CallType;
  duration?: number;
  answerDuration?: number;
}

// answer_url query for app-initiated calls (app-to-app, app-to-phone).
export interface AnswerUrlParamsAppCall {
  from: string;
  to: string;
  custom?: string;
  fromInternal: "true";
  userId: string;
  projectId: number;
  callId: string;
}

// answer_url query for PSTN-originated calls (phone-to-app).
export interface AnswerUrlParamsPhoneCall {
  from: string;
  to: string;
  fromInternal: "false";
  uuid: string;
}

// ─── Web SDK state enums ───────────────────────────────────────────────

export enum StringeeCallState {
  INIT = 0,
  CALLING = 1,
  RINGING = 2,
  ANSWERED = 3,
  CONNECTED = 4,
  BUSY = 5,
  ENDED = 6,
}

export enum MakeCallErrorCode {
  SUCCESS = 0,
  ANSWER_URL_EMPTY = 1,
  ANSWER_URL_SCCO_INCORRECT = 2,
  TO_TYPE_INVALID = 3,
  FROM_NUMBER_NOT_FOUND = 4,
  FROM_NUMBER_NOT_BELONG_ACCOUNT = 5,
  SIP_TRUNK_NOT_FOUND = 6,
  SIP_TRUNK_NOT_BELONG_ACCOUNT = 7,
  NOT_ENOUGH_MONEY = 8,
}

// ─── Web SDK chat enums ────────────────────────────────────────────────

export enum MessageType {
  TEXT = 1,
  PHOTO = 2,
  VIDEO = 3,
  AUDIO = 4,
  FILE = 5,
  LINK = 6,
  CONVERSATION_CREATED = 7,
  CONVERSATION_RENAMED = 8,
  FILE_ALT = 9,
  CONTACT = 10,
  STICKER = 11,
  NOTIFICATION = 100,
}

export enum MessageState {
  INITIALIZE = 0,
  SENDING = 1,
  SENT = 2,
  DELIVERED = 3,
  READ = 4,
}

// ─── Auth ──────────────────────────────────────────────────────────────

// JWT payload returned by POST /api/token.
// `cty: "stringee-api;v=1"` is mandatory in the JWT header (verified at sign
// time). For the Client SDK we set `userId`; for REST flows `rest_api: true`.
export interface TokenPayload {
  jti: string;
  iss: string;
  exp: number;
  iat: number;
  userId?: string;
  rest_api?: boolean;
}

// JWT header — same shape across every Stringee token.
export interface StringeeJwtHeader {
  typ: "JWT";
  alg: "HS256";
  cty: "stringee-api;v=1";
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

// ─── SDK call options (lib/stringee-sdk.ts) ────────────────────────────

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

// ─── REST envelopes ────────────────────────────────────────────────────

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
