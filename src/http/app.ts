import fastify from "fastify";
import { authRoutes } from "./routes";
import { env } from "process";
import z, { ZodError } from "zod";

export const app = fastify();

app.register(authRoutes);
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
    //
  }
  return reply.status(500).send({ message: "Internal server error." });
});
