import type { FastifyInstance } from "fastify";
import { env } from "../env.js";
import {
  getFirstFreeUser,
  setUserBusy,
  setUserFree,
} from "../services/presenceService.js";
import type {
  AnswerWebhookQuery,
  ConnectFailEvent,
  EventWebhookBody,
  RecordCompletedEvent,
  SccoAction,
} from "../types/stringee.js";

const BUSY_TTL_SECONDS = 1800;

// Absolute URLs Stringee callbacks land on. Built once at boot from the
// public origin + the per-route path env vars.
const recordEventUrl = `${env.baseDemoProjectUrl}${env.recordEventUrl}`;
const onFailEventUrl = `${env.baseDemoProjectUrl}${env.onFailEventUrl}`;

interface BuildSccoInput {
  from: string;
  to: string;
  fromInternal: boolean;
  // Forwarded verbatim into `connect.customData` so the receiving leg can
  // pull it off StringeeCall — see Web SDK docs on customData pipe-through.
  custom?: string;
  routedUser?: string;
}

const buildScco = ({
  from,
  to,
  fromInternal,
  custom,
  routedUser,
}: BuildSccoInput): SccoAction[] => {
  const toIsNumber = Number.isInteger(parseInt(to));
  return [
    { action: "record", eventUrl: recordEventUrl, format: "mp3" },
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
      timeout: env.connectTimeoutSec,
      continueOnFail: true,
      onFailEventUrl,
      ...(custom ? { customData: custom } : {}),
    },
  ];
};

export default async function webhookRoutes(fastify: FastifyInstance) {
  // Client-originated call (app → ?): builds SCCO without routing.
  fastify.get<{ Querystring: AnswerWebhookQuery }>(
    env.projectAnswerUrl,
    async (req, reply) => {
      const { from, to, fromInternal, custom } = req.query;
      return reply.send(
        buildScco({
          from,
          to,
          fromInternal,
          ...(custom !== undefined ? { custom } : {}),
        }),
      );
    },
  );

  fastify.post<{ Body: EventWebhookBody }>(
    env.projectEventUrl,
    async (req, reply) => {
      console.log("project event:", req.body);
      return reply.send({ status: "ok" });
    },
  );

  // Inbound PSTN call — route to first free agent, fall back to userId.
  fastify.get<{ Querystring: AnswerWebhookQuery }>(
    env.answerUrl,
    async (req, reply) => {
      const { from, to, fromInternal, custom, userId } = req.query;
      const routedUser = getFirstFreeUser() ?? userId;
      if (routedUser) setUserBusy(routedUser, BUSY_TTL_SECONDS);
      return reply.send(
        buildScco({
          from,
          to,
          fromInternal,
          ...(custom !== undefined ? { custom } : {}),
          ...(routedUser !== undefined ? { routedUser } : {}),
        }),
      );
    },
  );

  fastify.post<{ Body: EventWebhookBody }>(
    env.eventUrl,
    async (req, reply) => {
      const { call_status, to } = req.body ?? {};
      if (call_status === "ended" && to?.number) setUserFree(to.number);
      return reply.send({ status: "ok" });
    },
  );

  // Dedicated handler for `record.eventUrl` — recordingUrl + fileSize +
  // format land here once Stringee finishes uploading the recording.
  fastify.post<{ Body: RecordCompletedEvent }>(
    env.recordEventUrl,
    async (req, reply) => {
      console.log("record completed:", req.body);
      return reply.send({ status: "ok" });
    },
  );

  // Dedicated handler for `onFailEventUrl` — fired by SCCO `connect` when
  // continueOnFail:true and the leg failed (busy / no-answer / …). Free
  // up the agent so they can take the next call.
  fastify.post<{ Body: ConnectFailEvent }>(
    env.onFailEventUrl,
    async (req, reply) => {
      const { to } = req.body ?? {};
      if (to?.number) setUserFree(to.number);
      console.log("connect failed:", req.body);
      return reply.send({ status: "ok" });
    },
  );
}
