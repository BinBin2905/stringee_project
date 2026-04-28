import type { FastifyInstance } from "fastify";
import { generateClientToken } from "../services/tokenService.js";
import { env } from "../env.js";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: { id: string }; Reply: { token: string } }>(
    "/token",
    async (req, reply) => {
      const token = generateClientToken(req.body.id, env.tokenTtlSec);
      return reply.send({ token });
    },
  );
}
