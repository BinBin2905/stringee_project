import type { FastifyInstance, FastifyReply } from "fastify";
import { env } from "../env.js";
import { generateRestApiToken } from "../services/tokenService.js";
import { proxyBinary, proxyTo } from "../services/stringeeProxy.js";
import type { ProxyResult, StringeeEndpoint } from "../types/api.js";

// Declarative table: our `/admin/<key>` → Stringee endpoint. Adding a new
// endpoint is one line here plus (if it's GET) a `get` binding below.
const ENDPOINTS = {
  "make-call":         { method: "POST", path: "/v1/call2/callout" },
  "put-actions":       { method: "POST", path: "/v1/call2/putactions" },
  "stop-call":         { method: "POST", path: "/v1/call2/stop" },
  "transfer-call":     { method: "POST", path: "/v1/call2/transfer" },
  "add-participant":   { method: "POST", path: "/v1/call2/adduser" },
  "force-video-floor": { method: "POST", path: "/v1/call2/setvideofloor" },
  "send-message":      { method: "POST", path: "/v1/user/sendcustommessage" },
  "call-log":          { method: "GET",  path: "/v1/call/log", rawQuery: true },
} as const satisfies Record<string, StringeeEndpoint>;

const send = (reply: FastifyReply, r: ProxyResult) =>
  reply.code(r.status).send(r.body);

const extInfo = (ct: string, override?: string): string => {
  const hint = override?.replace(/^\.+/, "").toLowerCase();
  if (hint) return hint;
  if (ct.includes("mpeg") || ct.includes("mp3")) return "mp3";
  if (ct.includes("mp4")) return "mp4";
  if (ct.includes("wav")) return "wav";
  return "";
};

export default async function adminRoutes(fastify: FastifyInstance) {
  // REST token — debug only; proxy routes use their own internally.
  fastify.get("/rest-token", async (_req, reply) =>
    reply.send({
      token: generateRestApiToken(env.restTokenTtlSec),
      expiresIn: env.restTokenTtlSec,
    }),
  );

  // Bind the declarative table.
  for (const [route, spec] of Object.entries(ENDPOINTS)) {
    if (spec.method === "POST") {
      fastify.post(`/${route}`, async (req, reply) =>
        send(reply, await proxyTo(spec, { body: req.body })),
      );
    } else {
      fastify.get(`/${route}`, async (req, reply) => {
        const qs =
          spec.rawQuery && req.url.includes("?")
            ? req.url.slice(req.url.indexOf("?") + 1)
            : "";
        return send(reply, await proxyTo(spec, qs ? { query: qs } : {}));
      });
    }
  }

  // Binary passthrough: recording file. `?format=` sets the download ext.
  fastify.get<{
    Params: { recordId: string };
    Querystring: { format?: string };
  }>("/recording/:recordId", async (req, reply) => {
    const { status, contentType, buffer } = await proxyBinary(
      `/v1/call/recording/${encodeURIComponent(req.params.recordId)}`,
    );
    const ext = extInfo(contentType, req.query?.format);
    const filename = ext ? `${req.params.recordId}.${ext}` : req.params.recordId;
    return reply
      .code(status)
      .type(contentType)
      .header("Content-Disposition", `attachment; filename="${filename}"`)
      .send(buffer);
  });
}
