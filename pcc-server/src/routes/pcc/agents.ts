import type { FastifyInstance } from "fastify";
import { pcc } from "../../services/stringeeApi.js";
import { send, rawQuery, type IdParam } from "./helpers.js";

// /v1/agent — agents CRUD.
export default async function agentRoutes(fastify: FastifyInstance) {
  fastify.get("/agents", async (req, reply) =>
    send(reply, await pcc.agent.list(rawQuery(req.url))),
  );
  fastify.post("/agents", async (req, reply) =>
    send(reply, await pcc.agent.create(req.body)),
  );
  fastify.get<IdParam>("/agents/:id", async (req, reply) =>
    send(reply, await pcc.agent.get(req.params.id)),
  );
  fastify.put<IdParam>("/agents/:id", async (req, reply) =>
    send(reply, await pcc.agent.update(req.params.id, req.body)),
  );
  fastify.delete<IdParam>("/agents/:id", async (req, reply) =>
    send(reply, await pcc.agent.remove(req.params.id)),
  );
}
