import type { FastifyInstance } from "fastify";
import { pcc } from "../../services/stringeeApi.js";
import { send, rawQuery, type IdParam } from "./helpers.js";

// /v1/ivrkeypress — IVR keypress handlers CRUD + convenience POST under a node.
export default async function ivrKeypressRoutes(fastify: FastifyInstance) {
  fastify.get("/ivr-keypresses", async (req, reply) =>
    send(reply, await pcc.ivrKeypress.list(rawQuery(req.url))),
  );
  fastify.post("/ivr-keypresses", async (req, reply) =>
    send(reply, await pcc.ivrKeypress.create(req.body)),
  );
  fastify.get<IdParam>("/ivr-keypresses/:id", async (req, reply) =>
    send(reply, await pcc.ivrKeypress.get(req.params.id)),
  );
  fastify.put<IdParam>("/ivr-keypresses/:id", async (req, reply) =>
    send(reply, await pcc.ivrKeypress.update(req.params.id, req.body)),
  );
  fastify.delete<IdParam>("/ivr-keypresses/:id", async (req, reply) =>
    send(reply, await pcc.ivrKeypress.remove(req.params.id)),
  );

  // Convenience: add a keypress under a node (bakes `node` into the body).
  fastify.post<{ Params: { nodeId: string }; Body: Record<string, unknown> }>(
    "/ivr-nodes/:nodeId/keypresses",
    async (req, reply) =>
      send(
        reply,
        await pcc.ivrKeypress.create({ ...req.body, node: req.params.nodeId }),
      ),
  );
}
