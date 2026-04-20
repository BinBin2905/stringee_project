import fastify from "fastify";
import dotenv from "dotenv";
import cors from "@fastify/cors";
import routes from "./route/route.js";
dotenv.config();

const server = fastify();

await server.register(cors, {});
await server.register(routes);

console.log("PORT", process.env.PORT);

server.listen({ port: Number(process.env.PORT) }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
