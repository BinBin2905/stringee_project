import { type FastifyInstance } from "fastify";
import type { IHeaders, IQuerystring, IReply } from "../Interfaces/IType.js";
import { generateClientToken } from "../services/tokenService.js";
import type { IUser } from "../Interfaces/IStringee.js";

type ReplyType = {
  token: string;
};

export default async function authRoutes(fastify: FastifyInstance) {
  // fastify.get<{
  //   Querystring: IQuerystring;
  //   Headers: IHeaders;
  //   Reply: IReply;
  // }>(
  //   "/auth",
  //   {
  //     preValidation: (request, reply, done) => {
  //       const { username, password } = request.query;
  //       done(username !== "admin" ? new Error("Must be admin") : undefined); // only validate `admin` account
  //     },
  //   },
  //   async (request, reply) => {
  //     const customerHeader = request.headers["h-Custom"];
  //     // do something with request data
  //     return { success: true };
  //   },
  // );

  fastify.post<{ Body: IUser; Reply: ReplyType }>(
    "/token",
    async (request, reply) => {
      return reply.send({ token: generateClientToken(request.body.id, 3600) });
    },
  );
}
