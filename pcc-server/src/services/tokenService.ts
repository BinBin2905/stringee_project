import { signManualJwt } from "../utils/jwt.js";
import { env } from "../env.js";

const header = { typ: "JWT", alg: "HS256", cty: "stringee-api;v=1" };

// Client JWT — always carries `pcc: true` since this server only serves the
// PCC surface. The UI uses it as a session marker.
export function generateClientToken(userId: string, ttlSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  return signManualJwt({
    header,
    payload: {
      jti: `${env.stringeeKeySid}-${now}`,
      iss: env.stringeeKeySid,
      userId,
      exp: now + ttlSeconds,
      pcc: true,
    },
    secret: env.stringeeKeySecret,
  });
}

// Server-to-Stringee REST token (rest_api: true). Same shape as the Call REST
// token; Stringee dispatches by URL.
export function generatePccApiToken(ttlSeconds: number): string {
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
