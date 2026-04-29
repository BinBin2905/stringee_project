// SCCO + webhook event shapes the PCC UI consumes via the live-events
// feed and answer-URL inspection. Mirrors pcc-server/src/types/scco.ts so
// the UI has no server dependency.

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

export type SCCO = SccoAction[];

// Body Stringee POSTs to an `input` action's eventUrl when DTMF arrives.
export interface SccoInputResult {
  time: string;
  dtmf: string;
  call_id: string;
  customField?: string;
  timeout: boolean;
}

// ─── Webhook event payload ──────────────────────────────────────────────

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
  callCreatedReason?: CallCreatedReason;
  endCallCause?: EndCallCause;
  endedBy?: EndedBy;
  callType?: CallType;
  duration?: number;
  answerDuration?: number;
  agent_status?: "ended";
  start_time?: number;
}

// Live-event ring buffer entry surfaced by /admin/pcc/events/recent.
export interface RecordedPccEvent {
  id: number;
  receivedAt: number;
  body: PccEventBody;
}

// ─── Custom agent routing webhook ───────────────────────────────────────

export type CustomRoutingAgentType = 1 | 2;

export interface CustomRoutingCallItem {
  callId: string;
  from: string;
  to: string;
}

export interface CustomRoutingRequest {
  queueId: string;
  calls: CustomRoutingCallItem[];
  projectId: number;
}

export interface CustomRoutingAgent {
  stringee_user_id: string;
  phone_number?: string;
  routing_type: CustomRoutingAgentType;
  answer_timeout: number;
}

export interface CustomRoutingResponse {
  version: 2;
  calls: {
    callId: string;
    agents: CustomRoutingAgent[];
  }[];
}
