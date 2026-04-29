// Blind = immediate routing, attended = supervised before connection.
export type TransferType = "blind" | "attended";

// `internal` routes by Stringee user ID, `external` by phone number.
export type TransferTargetType = "internal" | "external";

export interface TransferCallTarget {
  type: TransferTargetType;
  number: string;
  alias: string;
}

export interface TransferCallRequest {
  callId: string;
  to: TransferCallTarget;
  transferType?: TransferType;
}

export interface TransferCallResponse {
  r: number;
  msg: string;
  data?: unknown;
}
