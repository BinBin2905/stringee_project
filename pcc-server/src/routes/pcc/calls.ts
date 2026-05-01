import type { FastifyInstance } from "fastify";
import { pccClient } from "../../services/stringeeApi.js";
import { send } from "./helpers.js";

// PCC outbound call control: callout (agent → customer) and transfer.
export default async function callRoutes(fastify: FastifyInstance) {
  fastify.post("/calls/callout", async (req, reply) =>
    send(
      reply,
      await pccClient.request("POST", "/v1/call/callout", { body: req.body }),
    ),
  );
  fastify.post("/calls/transfer", async (req, reply) =>
    send(
      reply,
      await pccClient.request("POST", "/v1/call/transfer", { body: req.body }),
    ),
  );
}
