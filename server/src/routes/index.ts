import type { FastifyInstance } from "fastify";
import authRoutes from "./auth.js";
import webhookRoutes from "./webhooks.js";
import adminRoutes from "./admin.js";
import pccRoutes from "./pcc.js";

export default async function routes(fastify: FastifyInstance) {
  fastify.register(authRoutes, { prefix: "/api" });
  fastify.register(webhookRoutes, { prefix: "/" });
  fastify.register(adminRoutes, { prefix: "/admin" });
  fastify.register(pccRoutes, { prefix: "/admin/pcc" });
}
