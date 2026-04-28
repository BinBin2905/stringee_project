import { signManualJwt } from "../utils/jwt.js";
import { env } from "../env.js";

const header = { typ: "JWT", alg: "HS256", cty: "stringee-api;v=1" };

export function generateClientToken(userId: string, ttlSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  return signManualJwt({
    header,
    payload: {
      jti: `${env.stringeeKeySid}-${now}`,
      iss: env.stringeeKeySid,
      userId,
      exp: now + ttlSeconds,
    },
    secret: env.stringeeKeySecret,
  });
}

// Signs an access token for Stringee's Call REST API
// (https://api.stringee.com/v1/call2/…, /v1/call/log, …).
// Send as header `X-STRINGEE-AUTH: <token>`.
export function generateRestApiToken(ttlSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  return signManualJwt({
    header,
    payload: {
      jti: `${env.stringeeKeySid}-${now}`,
      iss: env.stringeeKeySid,
      exp: now + ttlSeconds,
      rest_api: true,
    },
    secret: env.stringeeKeySecret,
  });
}
