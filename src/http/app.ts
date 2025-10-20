import fastify from "fastify";
import { authRoutes } from "./routes";

export const app = fastify();

app.register(authRoutes);
