import type { FastifyInstance } from "fastify";
import type {
  IGetSCCOFromStringeeServer,
  ISCCO,
} from "../Interfaces/IStringee.js";

export default async function callRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: IGetSCCOFromStringeeServer }>(
    `${process.env.PROJECT_ANSWER_URL}`,
    async (request, reply) => {
      // Handle callback logic here
      const { from, to, fromInternal, userId, projectId, callId } =
        request.query;

      console.log("Received callback with query parameters:");
      console.log(from, to, fromInternal, userId, projectId, callId);

      const scco: ISCCO[] = [
        {
          action: "record",
          eventUrl: `${process.env.BASE_DEMO_PROJECT_URL}${process.env.PROJECT_EVENT_URL}`,
          format: "mp3",
        },
        {
          action: "connect",
          from: { type: "internal", number: from, alias: "" },
          to: { type: "external", number: to, alias: "" },
        },
      ];
      return reply.send(scco);
    },
  );

  fastify.post<{}>(
    `${process.env.PROJECT_EVENT_URL}`,
    async (request, reply) => {
      // Handle callback logic here
    },
  );
}
