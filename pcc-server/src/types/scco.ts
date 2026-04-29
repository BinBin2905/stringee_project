// SCCO + webhook shapes used by pcc-server's webhook routes.
// Mirrors developer.stringee.com/docs/server.

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

// ─── SCCO action set (full) ─────────────────────────────────────────────

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

// Body Stringee POSTs to the `eventUrl` of an `input` action when the
// caller submits DTMF (or the input times out).
export interface SccoInputResult {
  time: string;
  dtmf: string;
  call_id: string;
  customField?: string;
  timeout: boolean;
}

// ─── Webhook event payloads (event_url) ─────────────────────────────────

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
  | string; // SIP codes: "486 Busy Here", "480 Temporarily Unavailable"…

export type EndedBy = "EXTERNAL" | "INTERNAL";

export interface PccEventBody {
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
  // Available when call_status = "ended":
  callCreatedReason?: CallCreatedReason;
  endCallCause?: EndCallCause;
  endedBy?: EndedBy;
  callType?: CallType;
  duration?: number;
  answerDuration?: number;
  // Available when call_status = "connect_failed" (onFailEventUrl):
  agent_status?: "ended";
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

// ─── get_customer_info webhook ──────────────────────────────────────────

// `GetCustomerInfoQuery` lives in callSettings.ts to keep webhook query
// types co-located with the call-settings URLs that produce them.

// JSON we return — forwarded verbatim to the agent's
// StringeeCall.customDataFromYourServer.
export interface CustomerInfo {
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
  [key: string]: unknown;
}

// ─── Callout answer URL ─────────────────────────────────────────────────

// Query Stringee hits on the project-level `callout_answer_url` for the
// agent → customer bridge.
export interface CalloutAnswerQuery {
  from: string;
  to: string;
  callId?: string;
  customerNumber?: string;
}

// ─── Project / number answer_url query ──────────────────────────────────

// Query Stringee hits on answer_url for app-initiated calls
// (app-to-app, app-to-phone).
export interface AnswerUrlParamsAppCall {
  from: string;
  to: string;
  custom?: string;
  fromInternal: "true";
  userId: string;
  projectId: number;
  callId: string;
}

// Query Stringee hits on answer_url for PSTN-originated calls
// (phone-to-app).
export interface AnswerUrlParamsPhoneCall {
  from: string;
  to: string;
  fromInternal: "false";
  uuid: string;
}

// ─── Custom agent routing webhook ───────────────────────────────────────

// 1 = App/SIP, 2 = phone number — duplicated from agent.ts for codegen
// consumers that import only this module.
export type CustomRoutingAgentType = 1 | 2;

export interface CustomRoutingCallItem {
  callId: string;
  from: string;
  to: string;
}

// Body Stringee POSTs to a queue's `get_list_agents_url`.
export interface CustomRoutingRequest {
  queueId: string;
  calls: CustomRoutingCallItem[];
  projectId: number;
}

export interface CustomRoutingAgent {
  stringee_user_id: string;
  phone_number?: string;
  routing_type: CustomRoutingAgentType;
  answer_timeout: number; // seconds
}

// JSON pcc-server has to return for Stringee to know the priority order
// of agents to dial.
export interface CustomRoutingResponse {
  version: 2; // BẮT BUỘC = 2
  calls: {
    callId: string;
    agents: CustomRoutingAgent[]; // ordered by priority
  }[];
}
