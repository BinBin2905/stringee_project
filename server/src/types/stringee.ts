// Stringee Call API domain types — SCCO actions, webhook payloads, REST
// envelopes. Mirrors developer.stringee.com/docs/server.

// ─── Shared primitives ──────────────────────────────────────────────────

export type PartyType = "internal" | "external";
export type RecordFormat = "mp3" | "wav" | "mp4";

export interface Party {
  type: PartyType;
  number: string;
  alias: string;
  is_online?: boolean;
}

// SCCO `talk` voice presets documented for the TTS engine.
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

// ─── SCCO actions ───────────────────────────────────────────────────────

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

// Body Stringee POSTs to `eventUrl` after an `input` action collected DTMF.
export interface SccoInputResult {
  time: string;
  dtmf: string;
  call_id: string;
  customField?: string;
  timeout: boolean;
}

// ─── Webhook payloads ───────────────────────────────────────────────────

// Combined answer_url query — `userId`/`projectId` are populated for app-initiated
// calls and absent for PSTN-originated calls (which carry `uuid` instead).
export interface AnswerWebhookQuery {
  from: string;
  to: string;
  fromInternal: boolean;
  custom?: string;
  userId?: string;
  projectId?: number;
  callId?: string;
  uuid?: string;
}

// `call_status` values fired on event_url.
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
  | string; // SIP codes — e.g. "486 Busy Here"

export type EndedBy = "EXTERNAL" | "INTERNAL";

export interface EventWebhookBody {
  call_status?: CallStatus;
  project_id?: number;
  request_from_user_id?: string;
  account_sid?: string;
  timestamp_ms?: number;
  from?: Party;
  to?: Party;
  type?: "stringee_call";
  call_id?: string;
  clientCustomData?: string;
  // ended-call extras
  callCreatedReason?: CallCreatedReason;
  endCallCause?: EndCallCause;
  endedBy?: EndedBy;
  callType?: CallType;
  duration?: number;
  answerDuration?: number;
  // connect onFailEventUrl extras
  agent_status?: "ended";
  toNumber?: string;
  start_time?: number;
}

// `connect_failed` payload Stringee POSTs to onFailEventUrl when the
// connect leg fails.
export interface ConnectFailEvent {
  call_status: "connect_failed";
  project_id: number;
  agent_status: "ended";
  call_id: string;
  from: Party;
  to: Party;
  start_time: number;
}

// Body Stringee POSTs to the eventUrl of an `input` SCCO action when
// DTMF is collected (or the input times out).
export interface DtmfInputEvent {
  time: string;
  dtmf: string;
  call_id: string;
  customField?: string;
  timeout: boolean;
}

// ─── REST API ───────────────────────────────────────────────────────────

export interface StringeeResponse<T = unknown> {
  r: number;
  message?: string;
  msg?: string;
  data?: T;
}

export interface User {
  id: string;
}

// POST /v1/call2/callout — make outbound call.
export interface MakeCalloutRequest {
  from: Party;
  to: Party[];
  actions?: SccoAction[];
  answer_url?: string;
}

export type MakeCalloutResponse = StringeeResponse<{ callId?: string }>;

// POST /v1/call2/transfer — generic transfer (non-PCC).
export interface TransferCallRequest {
  callId: string;
  fromUserId: string;
  to: Party;
}

export type TransferCallResponse = StringeeResponse;

// ─── SIP phone (Call API — non-PCC) ─────────────────────────────────────

export interface SipPhone {
  username: string;
  extension: string | null;
  email_address: string | null;
}

export interface CreateSipPhoneRequest {
  username: string;
  password: string;
}

export interface CreateSipPhoneResponse extends StringeeResponse {
  sipusername: string; // "{projectId}_{username}"
}

export interface UpdateSipPhoneRequest {
  password: string;
  extension?: number;
}

export type UpdateSipPhoneResponse = StringeeResponse;
export type DeleteSipPhoneResponse = StringeeResponse;

// ─── Greeting / hold music files ────────────────────────────────────────

export interface GreetingFile {
  sid: string;
  filename: string;
  desc1: string | null;
  created: number;
}

export interface ListGreetingFilesResponse extends StringeeResponse {
  data: {
    greeting_files: GreetingFile[];
    total: string;
  };
}

export interface UploadGreetingFileResponse extends StringeeResponse {
  filename: string;
  fileSid: string;
}

// ─── makeCall error codes (Web SDK) ─────────────────────────────────────

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

// ─── JWT headers / payloads ─────────────────────────────────────────────

export interface StringeeJwtHeader {
  typ: "JWT";
  alg: "HS256";
  cty: "stringee-api;v=1";
}

export interface StringeeClientTokenPayload {
  jti: string;
  iss: string;
  exp: number;
  userId: string;
  icc_api?: true;
}

export interface StringeeRestApiTokenPayload {
  jti: string;
  iss: string;
  exp: number;
  rest_api: true;
}

export type StringeeTokenPayload =
  | StringeeClientTokenPayload
  | StringeeRestApiTokenPayload;

// ─── Stringee API endpoint base URLs ────────────────────────────────────

export const STRINGEE_API = {
  CALL_API: "https://api.stringee.com",
  PCC_API: "https://icc-api.stringee.com",
  SIP_DOMAIN: "v2.stringee.com:15060",
  PCC_ANSWER_URL: "http://v2.stringee.com:8282/answer_url",
  PCC_EVENT_URL: "http://v2.stringee.com:8282/event_url",
  PCC_PROJECT_ANSWER_URL: "http://v2.stringee.com:8282/project_answer_url",
  PCC_PROJECT_EVENT_URL: "http://v2.stringee.com:8282/project_event_url",
} as const;
