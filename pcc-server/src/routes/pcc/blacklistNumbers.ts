import type { FastifyInstance } from "fastify";
import { pcc } from "../../services/stringeeApi.js";
import { send, rawQuery, type IdParam } from "./helpers.js";

// /v1/blacklistnumber — blocked-number list CRUD.
export default async function blacklistNumberRoutes(fastify: FastifyInstance) {
  fastify.get("/blacklist-numbers", async (req, reply) =>
    send(reply, await pcc.blacklist.list(rawQuery(req.url))),
  );
  fastify.post("/blacklist-numbers", async (req, reply) =>
    send(reply, await pcc.blacklist.create(req.body)),
  );
  fastify.get<IdParam>("/blacklist-numbers/:id", async (req, reply) =>
    send(reply, await pcc.blacklist.get(req.params.id)),
  );
  fastify.put<IdParam>("/blacklist-numbers/:id", async (req, reply) =>
    send(reply, await pcc.blacklist.update(req.params.id, req.body)),
  );
  fastify.delete<IdParam>("/blacklist-numbers/:id", async (req, reply) =>
    send(reply, await pcc.blacklist.remove(req.params.id)),
  );
}
