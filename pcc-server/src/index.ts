import fastify from "fastify";
import cors from "@fastify/cors";
import { env } from "./env.js";
import routes from "./routes/index.js";

const server = fastify();

await server.register(cors, {
  origin: env.corsOrigin ?? true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
});
await server.register(routes);

server.listen({ port: env.port }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`pcc-server listening at ${address}`);
});
