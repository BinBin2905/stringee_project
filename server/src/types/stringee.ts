// Shared Stringee domain types: SCCO actions, webhook payloads, call IDs.
// Kept minimal — only fields we actually read or emit.

export type PartyType = "internal" | "external";
export type RecordFormat = "mp3" | "wav" | "mp4";

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
  customData?: string;
  continueOnFail?: boolean;
  onFailEventUrl?: string;
  maxConnection?: number;
}

export type SccoAction = SccoRecord | SccoConnect;

// Query Stringee hits on our answer-url webhook
export interface AnswerWebhookQuery {
  from: string;
  to: string;
  fromInternal: boolean;
  userId: string;
  projectId: number;
  callId: string;
}

// Body Stringee sends to our event-url webhook
export interface EventWebhookBody {
  call_status?: string;
  to?: { number?: string };
}

// REST API payloads (Stringee → us → proxy)
export interface StringeeResponse<T = unknown> {
  r: number;
  message?: string;
  data?: T;
}

export interface User {
  id: string;
}
