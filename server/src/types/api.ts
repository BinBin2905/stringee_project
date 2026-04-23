// Generic proxy result: raw status + parsed body from Stringee.
export interface ProxyResult<T = unknown> {
  status: number;
  body: T;
}

export type HttpMethod = "GET" | "POST";

// A single Stringee REST endpoint definition.
// `rawQuery` — when true, the client's full query string is forwarded
// unchanged (needed for `search_after[]=…&search_after[]=…`).
export interface StringeeEndpoint {
  method: HttpMethod;
  path: string;
  rawQuery?: boolean;
}
