import { createHmac } from "node:crypto";

const b64url = (input: Buffer | string): string =>
  (typeof input === "string" ? Buffer.from(input) : input)
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

export interface ManualJwtInput {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  secret: string;
}

export function signManualJwt({
  header,
  payload,
  secret,
}: ManualJwtInput): string {
  const headerB64 = b64url(JSON.stringify(header));
  const payloadB64 = b64url(JSON.stringify(payload));
  const data = `${headerB64}.${payloadB64}`;
  const signature = createHmac("sha256", secret).update(data).digest();
  return `${data}.${b64url(signature)}`;
}
