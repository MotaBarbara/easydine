import type { FastifyInstance } from "fastify";
import { register } from "./controllers/register";

export async function authRoutes(app: FastifyInstance) {
  app.post("/users", register);
}
