// OOP spec hierarchy driving the generic editor components.
// Adding a new action is a single class instantiation — see the concrete
// `new CallAction(...)` calls below.

import { adminApi } from "@/api/admin";
import type { ApiResult } from "@/types";
import type { Field } from "./model";

// ── Base ────────────────────────────────────────────────────────────────
export abstract class Spec {
  abstract readonly name: string;
  abstract readonly title: string;
  abstract readonly fields: readonly Field[];
}

// Single-write action (POST/PUT/DELETE with no list/read counterpart).
export abstract class ActionSpec extends Spec {
  abstract readonly method: string;
  abstract readonly restPath: string;
  abstract readonly initialBody: Record<string, unknown>;
  abstract send(body: unknown): Promise<ApiResult>;
}

// ── Call REST API actions (POST-only) ──────────────────────────────────
type CallEp =
  | "make-call"
  | "put-actions"
  | "stop-call"
  | "transfer-call"
  | "add-participant"
  | "force-video-floor"
  | "send-message";

class CallAction extends ActionSpec {
  readonly method = "POST";
  readonly name: string;
  readonly title: string;
  readonly endpoint: CallEp;
  readonly restPath: string;
  readonly fields: readonly Field[];
  readonly initialBody: Record<string, unknown>;

  constructor(
    name: string,
    title: string,
    endpoint: CallEp,
    restPath: string,
    fields: readonly Field[],
    initialBody: Record<string, unknown>,
  ) {
    super();
    this.name = name;
    this.title = title;
    this.endpoint = endpoint;
    this.restPath = restPath;
    this.fields = fields;
    this.initialBody = initialBody;
  }
  send(body: unknown) {
    return adminApi.post(this.endpoint, body);
  }
}

// Reusable sub-schemas. Keyed field lists — `fields` drives the nested form.
const PARTY_FIELDS: readonly Field[] = [
  {
    key: "type",
    label: "type",
    type: "string",
    options: ["internal", "external"],
  },
  { key: "number", label: "number", type: "string", required: true },
  { key: "alias", label: "alias", type: "string" },
];

const partyField = (key: string, label = key, hint?: string): Field => ({
  key,
  label,
  type: "object",
  fields: PARTY_FIELDS,
  hint,
});

// SCCO items are polymorphic across action types (talk / connect / record / …).
// Expose the common fields; for uncommon ones, switch to JSON edit.
const SCCO_FIELDS: readonly Field[] = [
  {
    key: "action",
    label: "action",
    type: "string",
    required: true,
    options: ["talk", "connect", "record", "play", "hangup"],
  },
  { key: "text", label: "text", type: "string", hint: "talk" },
  {
    key: "from",
    label: "from",
    type: "object",
    fields: PARTY_FIELDS,
    hint: "connect",
  },
  {
    key: "to",
    label: "to",
    type: "object",
    fields: PARTY_FIELDS,
    hint: "connect",
  },
  { key: "eventUrl", label: "eventUrl", type: "string", hint: "record" },
  {
    key: "format",
    label: "format",
    type: "string",
    options: ["mp3", "wav", "mp4"],
    hint: "record",
  },
];

const sccoArray = (key = "actions", hint?: string): Field => ({
  key,
  label: key,
  type: "array",
  item: { key: "scco", label: "Action", type: "object", fields: SCCO_FIELDS },
  hint,
});

export const MAKE_CALL = new CallAction(
  "make-call",
  "Make outbound call",
  "make-call",
  "/v1/call2/callout",
  [
    partyField("from"),
    {
      key: "to",
      label: "to",
      type: "array",
      item: {
        key: "party",
        label: "Party",
        type: "object",
        fields: PARTY_FIELDS,
      },
    },
    sccoArray(),
  ],
  {
    from: {
      type: "external",
      number: "STRINGEE_NUMBER",
      alias: "STRINGEE_NUMBER",
    },
    to: [{ type: "external", number: "TO_NUMBER", alias: "TO_NUMBER" }],
    actions: [{ action: "talk", text: "Hello from Stringee admin" }],
  },
);

export const PUT_ACTIONS = new CallAction(
  "put-actions",
  "Put actions (SCCO) on active call",
  "put-actions",
  "/v1/call2/putactions",
  [
    { key: "callId", label: "callId", type: "string", required: true },
    sccoArray(),
  ],
  {
    callId: "YOUR_CALL_ID",
    actions: [
      {
        action: "connect",
        from: { type: "external", number: "SOURCE_NUMBER" },
        to: { type: "internal", number: "USER_ID" },
      },
    ],
  },
);

export const STOP_CALL = new CallAction(
  "stop-call",
  "Stop call",
  "stop-call",
  "/v1/call2/stop",
  [{ key: "callId", label: "callId", type: "string", required: true }],
  { callId: "YOUR_CALL_ID" },
);

export const TRANSFER_CALL = new CallAction(
  "transfer-call",
  "Transfer call",
  "transfer-call",
  "/v1/call2/transfer",
  [
    { key: "callId", label: "callId", type: "string", required: true },
    { key: "fromUserId", label: "fromUserId", type: "string" },
    partyField("to"),
  ],
  {
    callId: "YOUR_CALL_ID",
    fromUserId: "user1",
    to: { type: "internal", number: "user2", alias: "user2" },
  },
);

export const ADD_PARTICIPANT = new CallAction(
  "add-participant",
  "Add participant",
  "add-participant",
  "/v1/call2/adduser",
  [
    { key: "callId", label: "callId", type: "string", required: true },
    partyField("from"),
    partyField("to"),
    { key: "spyCall", label: "spyCall", type: "boolean" },
  ],
  {
    callId: "YOUR_CALL_ID",
    from: {
      type: "external",
      number: "STRINGEE_NUMBER",
      alias: "STRINGEE_NUMBER",
    },
    to: { type: "internal", number: "user1", alias: "user1" },
    spyCall: false,
  },
);

export const FORCE_VIDEO = new CallAction(
  "force-video-floor",
  "Force video floor",
  "force-video-floor",
  "/v1/call2/setvideofloor",
  [
    { key: "callId", label: "callId", type: "string", required: true },
    { key: "userId", label: "userId", type: "string", required: true },
  ],
  { callId: "YOUR_CALL_ID", userId: "user1" },
);

export const SEND_MESSAGE = new CallAction(
  "send-message",
  "Send custom message",
  "send-message",
  "/v1/user/sendcustommessage",
  [
    { key: "from", label: "from", type: "string" },
    { key: "toUser", label: "toUser", type: "string", required: true },
    {
      key: "message",
      label: "message",
      type: "json",
      hint: "arbitrary JSON payload",
    },
  ],
  { from: "system", toUser: "user1", message: { a: "Hello!" } },
);
