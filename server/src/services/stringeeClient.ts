import { env } from "../env.js";
import { generateRestApiToken } from "./tokenService.js";
import type { HttpMethod, ProxyResult } from "../types/api.js";

export interface RequestOptions {
  body?: unknown;
  query?: string;
}

// Single HTTP client for any Stringee REST surface (Call API, PCC/ICC).
// Reuse by instantiating with a different `baseUrl`. Token is regenerated
// per request — TTLs are short, and Stringee accepts any valid signed JWT.
export class StringeeClient {
  constructor(
    public readonly baseUrl: string,
    private readonly tokenTtl: number = env.restTokenTtlSec,
  ) {}

  async request<T = unknown>(
    method: HttpMethod,
    path: string,
    opts: RequestOptions = {},
  ): Promise<ProxyResult<T>> {
    const qs = opts.query ? `?${opts.query.replace(/^\?/, "")}` : "";
    const res = await fetch(`${this.baseUrl}${path}${qs}`, {
      method,
      headers: {
        "X-STRINGEE-AUTH": generateRestApiToken(this.tokenTtl),
        Accept: "application/json",
        ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      ...(opts.body !== undefined ? { body: JSON.stringify(opts.body) } : {}),
    });
    const text = await res.text();
    let body: unknown = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }
    return { status: res.status, body: body as T };
  }
}
