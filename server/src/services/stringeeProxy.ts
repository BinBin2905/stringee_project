import { env } from "../env.js";
import { generateRestApiToken } from "./tokenService.js";
import type { ProxyResult, StringeeEndpoint } from "../types/api.js";

async function parse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function proxyTo<T = unknown>(
  endpoint: StringeeEndpoint,
  opts: { body?: unknown; query?: string; pathSuffix?: string } = {},
): Promise<ProxyResult<T>> {
  const token = generateRestApiToken(env.restTokenTtlSec);
  const url = `${env.stringeeApiBase}${endpoint.path}${opts.pathSuffix ?? ""}${
    opts.query ? `?${opts.query.replace(/^\?/, "")}` : ""
  }`;

  const res = await fetch(url, {
    method: endpoint.method,
    headers: {
      "X-STRINGEE-AUTH": token,
      Accept: "application/json",
      ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    ...(opts.body !== undefined ? { body: JSON.stringify(opts.body) } : {}),
  });

  return { status: res.status, body: (await parse(res)) as T };
}

// Stream-passthrough variant for binary responses (recordings).
export async function proxyBinary(
  path: string,
): Promise<{ status: number; contentType: string; buffer: Buffer }> {
  const token = generateRestApiToken(env.restTokenTtlSec);
  const res = await fetch(`${env.stringeeApiBase}${path}`, {
    headers: { "X-STRINGEE-AUTH": token },
  });
  return {
    status: res.status,
    contentType: res.headers.get("content-type") ?? "application/octet-stream",
    buffer: Buffer.from(await res.arrayBuffer()),
  };
}
