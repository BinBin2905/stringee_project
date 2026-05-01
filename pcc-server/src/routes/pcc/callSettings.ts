import type { FastifyInstance } from "fastify";
import { pccClient } from "../../services/stringeeApi.js";
import { send } from "./helpers.js";

// /v1/callsettings — project-level call settings (the four URLs shown in
// the Stringee Call Settings dashboard). GET + PUT only.
export default async function callSettingRoutes(fastify: FastifyInstance) {
  fastify.get("/callsettings", async (_req, reply) =>
    send(reply, await pccClient.request("GET", "/v1/callsettings")),
  );
  fastify.put("/callsettings", async (req, reply) =>
    send(
      reply,
      await pccClient.request("PUT", "/v1/callsettings", { body: req.body }),
    ),
  );
}
