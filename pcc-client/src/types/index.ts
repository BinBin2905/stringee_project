// Barrel for PCC domain types and the per-app auth/proxy types. Mirrors
// pcc-server/src/types so the UI has no server dependency.

export * from "./common";
export * from "./agent";
export * from "./group";
export * from "./queue";
export * from "./ivr";
export * from "./number";
export * from "./sipAccount";
export * from "./blacklist";
export * from "./transferCall";
export * from "./callout";
export * from "./callSettings";
export * from "./scco";

// ─── Auth / proxy envelopes (consumed by lib + components) ──────────────

// JWT header — every Stringee token carries the same header.
// `cty` is mandatory; tokens without it are rejected.
export interface StringeeJwtHeader {
  typ: "JWT";
  alg: "HS256";
  cty: "stringee-api;v=1";
}

// Decoded JWT claims (from POST /api/token).
export interface TokenPayload {
  jti: string;
  iss: string;
  exp: number;
  iat?: number;
  userId?: string;
  pcc?: boolean;
  icc_api?: boolean;
  rest_api?: boolean;
}

// Persisted per-session token record.
export interface SavedToken {
  token: string;
  userId: string;
  savedAt: number;
}

// Stringee REST envelope.
export interface StringeeResponse<T = unknown> {
  r: number;
  message?: string;
  msg?: string;
  data?: T;
}

// Our proxy result, surfaced to UI components.
export interface ApiResult<T = unknown> {
  status: number;
  data: T;
}

// Response surfaced by /admin/pcc-token.
export interface PccTokenResponse {
  token: string;
  expiresIn: number;
  kind: "pcc-rest-api";
}

// Local /api/token request/response.
export interface IssueClientTokenRequest {
  id: string;
}

export interface IssueClientTokenResponse {
  token: string;
}
