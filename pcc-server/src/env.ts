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

  tokenTtlSec: num("TOKEN_TTL_SECONDS", 3600),
  restTokenTtlSec: num("REST_TOKEN_TTL_SECONDS", 300),
};
