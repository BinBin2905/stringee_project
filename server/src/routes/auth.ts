import type { FastifyInstance } from "fastify";
import { generateClientToken } from "../services/tokenService.js";
import { setUserOnline } from "../services/presenceService.js";
import { env } from "../env.js";
import type { User } from "../types/stringee.js";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: User; Reply: { token: string } }>(
    "/token",
    async (req, reply) => {
      const { id } = req.body;
      const token = generateClientToken(id, env.tokenTtlSec);
      setUserOnline(id, env.tokenTtlSec);
      return reply.send({ token });
    },
  );
}
