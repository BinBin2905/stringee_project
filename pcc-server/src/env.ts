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
  port: num("PORT", 3001),
  corsOrigin: process.env.CORS_ORIGIN?.split(",").map((s) => s.trim()),

  stringeePccApiBase: process.env.PCC_BASE_URL ?? "https://icc-api.stringee.com",
  stringeeKeySid: required("STRINGEE_API_KEY_SID"),
  stringeeKeySecret: required("STRINGEE_API_KEY_SECRET"),

  // Public origin Stringee hits for the four PCC webhooks. Joined with the
  // path vars below to produce the absolute URLs registered in the Call
  // Settings dashboard.
  baseDemoProjectUrl: process.env.BASE_DEMO_PROJECT_URL ?? "",
  getCustomerInfoUrl: process.env.GET_CUSTOMER_INFO_URL ?? "/customer",
  getCustomerInfoTimeout: num("GET_CUSTOMER_INFO_TIMEOUT", 2000),
  pccEventUrl: process.env.PCC_EVENT_URL ?? "/pcc/event-url",
  pccCalloutAnswerUrl:
    process.env.PCC_CALLOUT_ANSWER_URL ?? "/pcc-callout/answer-url",

  tokenTtlSec: num("TOKEN_TTL_SECONDS", 3600),
  restTokenTtlSec: num("REST_TOKEN_TTL_SECONDS", 300),
};
