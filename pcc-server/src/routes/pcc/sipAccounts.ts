import type { FastifyInstance } from "fastify";
import { pcc } from "../../services/stringeeApi.js";
import { send, rawQuery, type IdParam } from "./helpers.js";

// /v1/ipphonecommon — SIP accounts CRUD.
export default async function sipAccountRoutes(fastify: FastifyInstance) {
  fastify.get("/sip-accounts", async (req, reply) =>
    send(reply, await pcc.sipAccount.list(rawQuery(req.url))),
  );
  fastify.post("/sip-accounts", async (req, reply) =>
    send(reply, await pcc.sipAccount.create(req.body)),
  );
  fastify.get<IdParam>("/sip-accounts/:id", async (req, reply) =>
    send(reply, await pcc.sipAccount.get(req.params.id)),
  );
  fastify.put<IdParam>("/sip-accounts/:id", async (req, reply) =>
    send(reply, await pcc.sipAccount.update(req.params.id, req.body)),
  );
  fastify.delete<IdParam>("/sip-accounts/:id", async (req, reply) =>
    send(reply, await pcc.sipAccount.remove(req.params.id)),
  );
}
