import { signManualJwt } from "../utils/jwt.js";

export function generateClientPCCToken(
  userId: string,
  ttlSeconds: number | 3600,
): string {
  const now = Math.floor(Date.now() / 1000);

  const header = { typ: "JWT", alg: "HS256", cty: "stringee-api;v=1" };

  const payload = {
    jti: `${process.env.STRINGEE_API_KEY_SID}-${now}`,
    iss: process.env.STRINGEE_API_KEY_SID,
    userId: userId,
    exp: now + ttlSeconds,
    rest_api: true,
  };

  return signManualJwt({
    header,
    payload,
    secret: process.env.STRINGEE_API_KEY_SECRET!,
  });
}

export function generateClientToken(
  userId: string,
  ttlSeconds: number | 3600,
): string {
  const now = Math.floor(Date.now() / 1000);

  const header = { typ: "JWT", alg: "HS256", cty: "stringee-api;v=1" };

  const payload = {
    jti: `${process.env.STRINGEE_API_KEY_SID}-${now}`,
    iss: process.env.STRINGEE_API_KEY_SID,
    userId: userId,
    exp: now + ttlSeconds,
  };

  return signManualJwt({
    header,
    payload,
    secret: process.env.STRINGEE_API_KEY_SECRET!,
  });
}
