import dotenv from "dotenv";

dotenv.config();

const required = (name: string): string => {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
};

const num = (name: string, fallback: number): number => {
  const v = process.env[name];
  return v ? Number(v) : fallback;
};

export const env = {
  port: num("PORT", 3000),
  corsOrigin: process.env.CORS_ORIGIN?.split(",").map((s) => s.trim()),

  stringeeApiBase: process.env.BASE_URL ?? "https://api.stringee.com",
  stringeeKeySid: required("STRINGEE_API_KEY_SID"),
  stringeeKeySecret: required("STRINGEE_API_KEY_SECRET"),
  stringeeHotline: process.env.STRINGEE_HOTLINE_NUMBER ?? "",

  baseDemoProjectUrl: process.env.BASE_DEMO_PROJECT_URL ?? "",
  projectAnswerUrl: process.env.PROJECT_ANSWER_URL ?? "/project_answer_url",
  projectEventUrl: process.env.PROJECT_EVENT_URL ?? "/project_event_url",
  answerUrl: process.env.ANSWER_URL ?? "/answer_url",
  eventUrl: process.env.EVENT_URL ?? "/event_url",
  // Dedicated webhook for record.eventUrl payloads (RecordCompletedEvent —
  // recordingUrl/fileSize/format). Split out so the recording metadata
  // doesn't get conflated with call-status events on event_url.
  recordEventUrl: process.env.RECORD_EVENT_URL ?? "/record_event_url",
  // Stringee fires this when a SCCO `connect` fails (busy / no-answer / …),
  // but only if the connect action sets `continueOnFail:true`.
  onFailEventUrl: process.env.ON_FAIL_EVENT_URL ?? "/on_fail_event_url",
  // Default ringing timeout for SCCO connect actions, in seconds. Stringee's
  // own default is 60s which is too long for most flows.
  connectTimeoutSec: num("CONNECT_TIMEOUT_SECONDS", 30),

  tokenTtlSec: num("TOKEN_TTL_SECONDS", 3600),
  restTokenTtlSec: num("REST_TOKEN_TTL_SECONDS", 300),
};
