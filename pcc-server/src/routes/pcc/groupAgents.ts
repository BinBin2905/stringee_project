import type { FastifyInstance } from "fastify";
import { pcc, pccClient } from "../../services/stringeeApi.js";
import { send, rawQuery } from "./helpers.js";

// /v1/manage-agents-in-group — agents per group. POST/GET only — DELETE
// takes a body, not a URL id, so it doesn't fit the standard CRUD shape
// and is forwarded directly via pccClient.
export default async function groupAgentRoutes(fastify: FastifyInstance) {
  fastify.post("/group-agents", async (req, reply) =>
    send(reply, await pcc.groupAgent.create(req.body)),
  );
  fastify.get("/group-agents", async (req, reply) =>
    send(reply, await pcc.groupAgent.list(rawQuery(req.url))),
  );
  fastify.delete("/group-agents", async (req, reply) =>
    send(
      reply,
      await pccClient.request("DELETE", "/v1/manage-agents-in-group", {
        body: req.body,
      }),
    ),
  );
}
