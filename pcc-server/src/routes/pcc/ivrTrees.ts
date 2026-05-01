import type { FastifyInstance } from "fastify";
import { pcc } from "../../services/stringeeApi.js";
import { send, rawQuery, type IdParam } from "./helpers.js";

// /v1/ivrtree — IVR trees CRUD.
export default async function ivrTreeRoutes(fastify: FastifyInstance) {
  fastify.get("/ivr-trees", async (req, reply) =>
    send(reply, await pcc.ivrTree.list(rawQuery(req.url))),
  );
  fastify.post("/ivr-trees", async (req, reply) =>
    send(reply, await pcc.ivrTree.create(req.body)),
  );
  fastify.get<IdParam>("/ivr-trees/:id", async (req, reply) =>
    send(reply, await pcc.ivrTree.get(req.params.id)),
  );
  fastify.put<IdParam>("/ivr-trees/:id", async (req, reply) =>
    send(reply, await pcc.ivrTree.update(req.params.id, req.body)),
  );
  fastify.delete<IdParam>("/ivr-trees/:id", async (req, reply) =>
    send(reply, await pcc.ivrTree.remove(req.params.id)),
  );
}
