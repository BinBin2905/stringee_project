import type { FastifyInstance } from "fastify";
import { env } from "../env.js";
import { generatePccApiToken } from "../services/tokenService.js";
import { eventLog } from "../services/eventLog.js";

export default async function adminRoutes(fastify: FastifyInstance) {
  // Debug: surface a fresh PCC REST API token. Proxy routes use their own.
  fastify.get("/pcc-token", async (_req, reply) =>
    reply.send({
      token: generatePccApiToken(env.restTokenTtlSec),
      expiresIn: env.restTokenTtlSec,
      kind: "pcc-rest-api",
    }),
  );

  // Live PCC events feed — the UI polls this and passes back the highest
  // id it's seen so we only return new entries.
  fastify.get<{ Querystring: { since?: string } }>(
    "/pcc/events/recent",
    async (req, reply) => {
      const since =
        req.query.since !== undefined ? Number(req.query.since) : undefined;
      const events = eventLog.recent(Number.isFinite(since) ? since : undefined);
      return reply.send({ events });
    },
  );

  fastify.delete("/pcc/events", async (_req, reply) => {
    eventLog.clear();
    return reply.send({ ok: true });
  });
}
