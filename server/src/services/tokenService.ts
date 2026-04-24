import { signManualJwt } from "../utils/jwt.js";
import { env } from "../env.js";

const header = { typ: "JWT", alg: "HS256", cty: "stringee-api;v=1" };

// `pcc=true` adds a `pcc` claim to the client JWT so the SDK / our UI can
// distinguish PCC-agent tokens from regular client tokens. Stringee itself
// doesn't require the flag — it's for our own access control.
export function generateClientToken(
  userId: string,
  ttlSeconds: number,
  pcc = false,
): string {
  const now = Math.floor(Date.now() / 1000);
  return signManualJwt({
    header,
    payload: {
      jti: `${env.stringeeKeySid}-${now}`,
      iss: env.stringeeKeySid,
      userId,
      exp: now + ttlSeconds,
      ...(pcc ? { pcc: true } : {}),
    },
    secret: env.stringeeKeySecret,
  });
}

// Signs an access token for Stringee's server-side REST APIs. The same token
// shape authenticates both:
//   • Call REST API   (https://api.stringee.com/v1/call2/…, /v1/call/log, …)
//   • PCC / ICC API   (agent / queue / IVR / routing management)
// Stringee distinguishes them only by URL — the JWT payload is identical
// (`rest_api: true`). Send as header `X-STRINGEE-AUTH: <token>`.
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

// Named alias — same token, named at the PCC/ICC call site so callers that
// care about PCC auth semantics don't look wrong.
export const generatePccApiToken = generateRestApiToken;
