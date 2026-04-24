import type { FastifyInstance } from "fastify";
import { generateClientToken } from "../services/tokenService.js";
import { setUserOnline } from "../services/presenceService.js";
import { env } from "../env.js";
import type { User } from "../types/stringee.js";

// Request shape widened with an optional `pcc` flag — when set, the token is
// issued with a `pcc: true` claim so the UI knows it can enter /pcc.
type TokenBody = User & { pcc?: boolean };

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: TokenBody; Reply: { token: string } }>(
    "/token",
    async (req, reply) => {
      const { id, pcc } = req.body;
      const token = generateClientToken(id, env.tokenTtlSec, pcc);
      setUserOnline(id, env.tokenTtlSec);
      return reply.send({ token });
    },
  );
}
