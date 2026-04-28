import { env } from "../env.js";
import { generatePccApiToken } from "./tokenService.js";
import type { HttpMethod, ProxyResult } from "../types/api.js";

export interface RequestOptions {
  body?: unknown;
  query?: string;
}

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
        "X-STRINGEE-AUTH": generatePccApiToken(this.tokenTtl),
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
