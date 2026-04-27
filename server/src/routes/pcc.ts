import type { FastifyInstance, FastifyReply } from "fastify";
import { pcc, pccClient } from "../services/stringeeApi.js";
import type { StringeeResource } from "../services/stringeeResource.js";
import type { ProxyResult } from "../types/api.js";

const send = (reply: FastifyReply, r: ProxyResult): FastifyReply =>
  reply.code(r.status).send(r.body);

const rawQuery = (url: string): string =>
  url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";

// Mount the standard 5-route CRUD surface for one resource.
function mount(
  fastify: FastifyInstance,
  slug: string,
  resource: StringeeResource,
): void {
  fastify.get(`/${slug}`, async (req, reply) =>
    send(reply, await resource.list(rawQuery(req.url))),
  );
  fastify.post(`/${slug}`, async (req, reply) =>
    send(reply, await resource.create(req.body)),
  );
  fastify.get<{ Params: { id: string } }>(
    `/${slug}/:id`,
    async (req, reply) => send(reply, await resource.get(req.params.id)),
  );
  fastify.put<{ Params: { id: string } }>(
    `/${slug}/:id`,
    async (req, reply) =>
      send(reply, await resource.update(req.params.id, req.body)),
  );
  fastify.delete<{ Params: { id: string } }>(
    `/${slug}/:id`,
    async (req, reply) => send(reply, await resource.remove(req.params.id)),
  );
}

export default async function pccRoutes(fastify: FastifyInstance) {
  // ── CRUD for top-level PCC resources ────────────────────────────────
  mount(fastify, "agents", pcc.agent);
  mount(fastify, "queues", pcc.queue);
  mount(fastify, "groups", pcc.group);
  mount(fastify, "numbers", pcc.number);
  mount(fastify, "ivr-trees", pcc.ivrTree);
  mount(fastify, "sip-accounts", pcc.sipAccount);

  // ── Outbound call (route to agent then customer) ────────────────────
  fastify.post("/calls/callout", async (req, reply) =>
    send(
      reply,
      await pccClient.request("POST", "/v1/call/callout", { body: req.body }),
    ),
  );

  // ── Group ↔ Queue assignment ────────────────────────────────────────
  fastify.post<{ Params: { groupId: string; queueId: string } }>(
    "/groups/:groupId/queues/:queueId",
    async (req, reply) =>
      send(
        reply,
        await pcc.group
          .sub(req.params.groupId, `queue/${encodeURIComponent(req.params.queueId)}`)
          .create(req.body ?? {}),
      ),
  );
  fastify.delete<{ Params: { groupId: string; queueId: string } }>(
    "/groups/:groupId/queues/:queueId",
    async (req, reply) =>
      send(
        reply,
        await pccClient.request(
          "DELETE",
          `/v1/group/${encodeURIComponent(req.params.groupId)}/queue/${encodeURIComponent(req.params.queueId)}`,
        ),
      ),
  );

  // ── IVR: add node to tree, configure keypress on node ───────────────
  fastify.post<{ Params: { treeId: string } }>(
    "/ivr-trees/:treeId/nodes",
    async (req, reply) =>
      send(
        reply,
        await pcc.ivrTree.sub(req.params.treeId, "node").create(req.body),
      ),
  );
  fastify.post<{ Params: { nodeId: string } }>(
    "/ivr-nodes/:nodeId/keypresses",
    async (req, reply) =>
      send(
        reply,
        await pccClient.request(
          "POST",
          `/v1/ivr/node/${encodeURIComponent(req.params.nodeId)}/keypress`,
          { body: req.body },
        ),
      ),
  );
}
