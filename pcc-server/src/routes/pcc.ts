import type { FastifyInstance } from "fastify";
import agentRoutes from "./pcc/agents.js";
import groupRoutes from "./pcc/groups.js";
import queueRoutes from "./pcc/queues.js";
import numberRoutes from "./pcc/numbers.js";
import ivrTreeRoutes from "./pcc/ivrTrees.js";
import ivrNodeRoutes from "./pcc/ivrNodes.js";
import ivrKeypressRoutes from "./pcc/ivrKeypresses.js";
import sipAccountRoutes from "./pcc/sipAccounts.js";
import blacklistNumberRoutes from "./pcc/blacklistNumbers.js";
import groupRoutingRoutes from "./pcc/groupRoutings.js";
import groupAgentRoutes from "./pcc/groupAgents.js";
import callSettingRoutes from "./pcc/callSettings.js";
import callRoutes from "./pcc/calls.js";

// PCC route index — one slug = one file under ./pcc/. Add a new resource
// by creating ./pcc/<slug>.ts and registering it here.
export default async function pccRoutes(fastify: FastifyInstance) {
  fastify.register(agentRoutes);
  fastify.register(groupRoutes);
  fastify.register(queueRoutes);
  fastify.register(numberRoutes);
  fastify.register(ivrTreeRoutes);
  fastify.register(ivrNodeRoutes);
  fastify.register(ivrKeypressRoutes);
  fastify.register(sipAccountRoutes);
  fastify.register(blacklistNumberRoutes);
  fastify.register(groupRoutingRoutes);
  fastify.register(groupAgentRoutes);
  fastify.register(callSettingRoutes);
  fastify.register(callRoutes);
}
