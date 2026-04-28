export interface ProxyResult<T = unknown> {
  status: number;
  body: T;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
