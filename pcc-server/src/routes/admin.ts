import type { FastifyInstance } from "fastify";
import { env } from "../env.js";
import { generatePccApiToken } from "../services/tokenService.js";

export default async function adminRoutes(fastify: FastifyInstance) {
  // Debug: surface a fresh PCC REST API token. Proxy routes use their own.
  fastify.get("/pcc-token", async (_req, reply) =>
    reply.send({
      token: generatePccApiToken(env.restTokenTtlSec),
      expiresIn: env.restTokenTtlSec,
      kind: "pcc-rest-api",
    }),
  );
}
