// Decoded JWT claims (from POST /api/token).
export interface TokenPayload {
  jti: string;
  iss: string;
  exp: number;
  iat?: number;
  userId?: string;
  pcc?: boolean;
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
  data?: T;
}

// Our proxy result, surfaced to UI components.
export interface ApiResult<T = unknown> {
  status: number;
  data: T;
}
