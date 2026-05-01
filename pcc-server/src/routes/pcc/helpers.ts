import type { FastifyReply } from "fastify";
import type { ProxyResult } from "../../types/index.js";

// Forward Stringee's HTTP status + body verbatim to our caller.
export const send = (reply: FastifyReply, r: ProxyResult): FastifyReply =>
  reply.code(r.status).send(r.body);

// Pull the raw query string off the URL so multi-value keys
// (`?search_after[]=…&search_after[]=…`) survive intact.
export const rawQuery = (url: string): string =>
  url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";

// Reusable Fastify route generic for any `/:id` endpoint.
export type IdParam = { Params: { id: string } };
