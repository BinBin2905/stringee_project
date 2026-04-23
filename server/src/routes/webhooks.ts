import type { FastifyInstance } from "fastify";
import { env } from "../env.js";
import {
  getFirstFreeUser,
  setUserBusy,
  setUserFree,
} from "../services/presenceService.js";
import type {
  AnswerWebhookQuery,
  EventWebhookBody,
  SccoAction,
} from "../types/stringee.js";

const BUSY_TTL_SECONDS = 1800;

const eventUrl = `${env.baseDemoProjectUrl}${env.projectEventUrl}`;

const buildScco = (
  from: string,
  to: string,
  fromInternal: boolean,
  routedUser?: string,
): SccoAction[] => {
  const toIsNumber = Number.isInteger(parseInt(to));
  return [
    { action: "record", eventUrl, format: "mp3" },
    {
      action: "connect",
      from: {
        type: fromInternal ? "internal" : "external",
        number: routedUser ? from : toIsNumber ? env.stringeeHotline : from,
        alias: from,
      },
      to: {
        type: routedUser ? "internal" : toIsNumber ? "external" : "internal",
        number: routedUser ?? to,
        alias: routedUser ?? "",
      },
      peerToPeerCall: false,
    },
  ];
};

export default async function webhookRoutes(fastify: FastifyInstance) {
  // Client-originated call (app → ?): builds SCCO without routing.
  fastify.get<{ Querystring: AnswerWebhookQuery }>(
    env.projectAnswerUrl,
    async (req, reply) => {
      const { from, to, fromInternal } = req.query;
      return reply.send(buildScco(from, to, fromInternal));
    },
  );

  fastify.post(env.projectEventUrl, async (req, reply) => {
    console.log("project event:", req.body);
    return reply.send({ status: "ok" });
  });

  // Inbound PSTN call — route to first free agent, fall back to userId.
  fastify.get<{ Querystring: AnswerWebhookQuery }>(
    env.answerUrl,
    async (req, reply) => {
      const { from, to, fromInternal, userId } = req.query;
      const routedUser = getFirstFreeUser() ?? userId;
      setUserBusy(routedUser, BUSY_TTL_SECONDS);
      return reply.send(buildScco(from, to, fromInternal, routedUser));
    },
  );

  fastify.post<{ Body: EventWebhookBody }>(
    env.eventUrl,
    async (req, reply) => {
      const { call_status, to } = req.body ?? {};
      if (call_status === "end" && to?.number) setUserFree(to.number);
      return reply.send({ status: "ok" });
    },
  );
}
