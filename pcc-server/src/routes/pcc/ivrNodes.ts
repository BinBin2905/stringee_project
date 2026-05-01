import type { FastifyInstance } from "fastify";
import { pcc } from "../../services/stringeeApi.js";
import { send, rawQuery, type IdParam } from "./helpers.js";

// /v1/ivrnode — IVR nodes CRUD + convenience POST under a tree.
export default async function ivrNodeRoutes(fastify: FastifyInstance) {
  fastify.get("/ivr-nodes", async (req, reply) =>
    send(reply, await pcc.ivrNode.list(rawQuery(req.url))),
  );
  fastify.post("/ivr-nodes", async (req, reply) =>
    send(reply, await pcc.ivrNode.create(req.body)),
  );
  fastify.get<IdParam>("/ivr-nodes/:id", async (req, reply) =>
    send(reply, await pcc.ivrNode.get(req.params.id)),
  );
  fastify.put<IdParam>("/ivr-nodes/:id", async (req, reply) =>
    send(reply, await pcc.ivrNode.update(req.params.id, req.body)),
  );
  fastify.delete<IdParam>("/ivr-nodes/:id", async (req, reply) =>
    send(reply, await pcc.ivrNode.remove(req.params.id)),
  );

  // Convenience: add a node under a tree (bakes `tree` into the body).
  fastify.post<{ Params: { treeId: string }; Body: Record<string, unknown> }>(
    "/ivr-trees/:treeId/nodes",
    async (req, reply) =>
      send(
        reply,
        await pcc.ivrNode.create({ ...req.body, tree: req.params.treeId }),
      ),
  );
}
