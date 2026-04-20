import { type FastifyInstance } from "fastify";
import authRoutes from "./auth.js";
import testRoutes from "./test.js";
import callRoutes from "./callRoute.js";

export default async function routes(fastify: FastifyInstance) {
  fastify.register(authRoutes, { prefix: "/api" });
  fastify.register(testRoutes, { prefix: "/api" });
  fastify.register(callRoutes, { prefix: "/" });
}
