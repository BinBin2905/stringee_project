// Stringee JWT types — shared between client-token and rest-api-token paths.
// developer.stringee.com/docs/authentication.

// Header is identical for every Stringee JWT; `cty` is mandatory or the
// token is rejected.
export interface StringeeJwtHeader {
  typ: "JWT";
  alg: "HS256";
  cty: "stringee-api;v=1";
}

// JWT for the Client SDK (StringeeClient.connect). `icc_api: true` is
// mandatory when the agent receives PCC-routed calls via the Web SDK.
export interface StringeeClientTokenPayload {
  jti: string; // "{apiKeySid}-{timestamp}"
  iss: string; // API Key SID
  exp: number; // Unix seconds
  userId: string;
  icc_api?: true;
}

// JWT for server-to-Stringee REST calls. `rest_api: true` is mandatory.
export interface StringeeRestApiTokenPayload {
  jti: string;
  iss: string;
  exp: number;
  rest_api: true;
}

export type StringeeTokenPayload =
  | StringeeClientTokenPayload
  | StringeeRestApiTokenPayload;

// ─── Local /api/token handler shapes ────────────────────────────────────

export interface IssueClientTokenRequest {
  id: string;
}

export interface IssueClientTokenResponse {
  token: string;
}

export interface PccTokenResponse {
  token: string;
  expiresIn: number;
  kind: "pcc-rest-api";
}
