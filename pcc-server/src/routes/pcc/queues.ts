import type { FastifyInstance } from "fastify";
import { pcc } from "../../services/stringeeApi.js";
import { send, rawQuery, type IdParam } from "./helpers.js";

// /v1/queue — queues CRUD.
export default async function queueRoutes(fastify: FastifyInstance) {
  fastify.get("/queues", async (req, reply) =>
    send(reply, await pcc.queue.list(rawQuery(req.url))),
  );
  fastify.post("/queues", async (req, reply) =>
    send(reply, await pcc.queue.create(req.body)),
  );
  fastify.get<IdParam>("/queues/:id", async (req, reply) =>
    send(reply, await pcc.queue.get(req.params.id)),
  );
  fastify.put<IdParam>("/queues/:id", async (req, reply) =>
    send(reply, await pcc.queue.update(req.params.id, req.body)),
  );
  fastify.delete<IdParam>("/queues/:id", async (req, reply) =>
    send(reply, await pcc.queue.remove(req.params.id)),
  );
}
