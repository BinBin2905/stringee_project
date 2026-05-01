import type { FastifyInstance } from "fastify";
import { pcc } from "../../services/stringeeApi.js";
import { send, rawQuery, type IdParam } from "./helpers.js";

// /v1/group — groups CRUD.
export default async function groupRoutes(fastify: FastifyInstance) {
  fastify.get("/groups", async (req, reply) =>
    send(reply, await pcc.group.list(rawQuery(req.url))),
  );
  fastify.post("/groups", async (req, reply) =>
    send(reply, await pcc.group.create(req.body)),
  );
  fastify.get<IdParam>("/groups/:id", async (req, reply) =>
    send(reply, await pcc.group.get(req.params.id)),
  );
  fastify.put<IdParam>("/groups/:id", async (req, reply) =>
    send(reply, await pcc.group.update(req.params.id, req.body)),
  );
  fastify.delete<IdParam>("/groups/:id", async (req, reply) =>
    send(reply, await pcc.group.remove(req.params.id)),
  );
}
