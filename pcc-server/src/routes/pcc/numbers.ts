import type { FastifyInstance } from "fastify";
import { pcc } from "../../services/stringeeApi.js";
import { send, rawQuery, type IdParam } from "./helpers.js";

// /v1/number — phone numbers CRUD.
export default async function numberRoutes(fastify: FastifyInstance) {
  fastify.get("/numbers", async (req, reply) =>
    send(reply, await pcc.number.list(rawQuery(req.url))),
  );
  fastify.post("/numbers", async (req, reply) =>
    send(reply, await pcc.number.create(req.body)),
  );
  fastify.get<IdParam>("/numbers/:id", async (req, reply) =>
    send(reply, await pcc.number.get(req.params.id)),
  );
  fastify.put<IdParam>("/numbers/:id", async (req, reply) =>
    send(reply, await pcc.number.update(req.params.id, req.body)),
  );
  fastify.delete<IdParam>("/numbers/:id", async (req, reply) =>
    send(reply, await pcc.number.remove(req.params.id)),
  );
}
