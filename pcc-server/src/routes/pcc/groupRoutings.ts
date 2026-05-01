import type { FastifyInstance } from "fastify";
import { pcc, pccClient } from "../../services/stringeeApi.js";
import { send, rawQuery, type IdParam } from "./helpers.js";

// /v1/routing-call-to-groups — group-to-queue routings CRUD + convenience
// nested paths the existing client UI uses.
export default async function groupRoutingRoutes(fastify: FastifyInstance) {
  fastify.get("/group-routings", async (req, reply) =>
    send(reply, await pcc.groupRouting.list(rawQuery(req.url))),
  );
  fastify.post("/group-routings", async (req, reply) =>
    send(reply, await pcc.groupRouting.create(req.body)),
  );
  fastify.get<IdParam>("/group-routings/:id", async (req, reply) =>
    send(reply, await pcc.groupRouting.get(req.params.id)),
  );
  fastify.put<IdParam>("/group-routings/:id", async (req, reply) =>
    send(reply, await pcc.groupRouting.update(req.params.id, req.body)),
  );
  fastify.delete<IdParam>("/group-routings/:id", async (req, reply) =>
    send(reply, await pcc.groupRouting.remove(req.params.id)),
  );

  // Convenience: assign a group to a queue. Folds URL params into the
  // documented `routing-call-to-groups` body shape.
  fastify.post<{
    Params: { groupId: string; queueId: string };
    Body: { primary_group?: 0 | 1; priority?: 0 | 1 } | null;
  }>("/groups/:groupId/queues/:queueId", async (req, reply) => {
    const incoming = req.body ?? {};
    return send(
      reply,
      await pcc.groupRouting.create({
        group_id: req.params.groupId,
        queue_id: req.params.queueId,
        primary_group: incoming.primary_group ?? incoming.priority ?? 1,
      }),
    );
  });

  // NOTE: original DELETE handler at this path called /v1/manage-agents-in-group
  // with `agent_id: queueId`, which is almost certainly a bug. Preserved
  // verbatim — fix the body shape (or repoint at /v1/routing-call-to-groups)
  // when this convenience route is wired to UI.
  fastify.delete<{
    Params: { groupId: string; queueId: string };
  }>("/groups/:groupId/queues/:queueId", async (req, reply) =>
    send(
      reply,
      await pccClient.request("DELETE", "/v1/manage-agents-in-group", {
        body: {
          group_id: req.params.groupId,
          agent_id: req.params.queueId,
        },
      }),
    ),
  );
}
