import type { FastifyInstance } from "fastify";
import { User, type UserType } from "../JsonSchema/typeBox.js";

export default async function testRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: UserType; Reply: UserType }>(
    "/",
    {
      schema: {
        body: User,
        response: {
          200: User,
        },
      },
    },
    (request, reply) => {
      // The `name` and `mail` types are automatically inferred
      const { name, mail } = request.body;
      reply.status(200).send({ name, mail });
    },
  );

  fastify.get("/ping", async (request, reply) => {
    return "pong\n";
  });
}
