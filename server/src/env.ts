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

  tokenTtlSec: num("TOKEN_TTL_SECONDS", 3600),
  restTokenTtlSec: num("REST_TOKEN_TTL_SECONDS", 300),
};
