import fastify from "fastify";
import { appRoutes } from "./routes";
import { env } from "process";
import z, { ZodError } from "zod";
import jwtPlugin from "@/http/plugins/jwt";

export const app = fastify();

app.register(jwtPlugin);
app.register(appRoutes);
app.addHook("onRequest", async (req, _reply) => {
  console.log("🌍 [REQUEST]", req.method, req.url);
});
app.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Validation error",
      issues: z.treeifyError(error),
    });
  }
  if (env.NODE_ENV != "production") {
    console.error(error);
  } else {
  }
  return reply.status(500).send({ message: "Internal server error." });
});
