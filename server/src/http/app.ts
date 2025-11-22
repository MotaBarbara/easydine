import fastify from "fastify";
import { appRoutes } from "./routes";
import { env } from "process";
import z, { ZodError } from "zod";
import jwtPlugin from "@/http/plugins/jwt";
import cors from "@fastify/cors";

export const app = fastify();

const isDevelopment = process.env.NODE_ENV !== "production";
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 
  (isDevelopment ? "http://localhost:3000" : "https://easydine-client.onrender.com");

const allowedOrigins = isDevelopment
  ? ["http://localhost:3000", "http://127.0.0.1:3000"]
  : [frontendOrigin];

app.register(cors, {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    if (isDevelopment && origin.includes("localhost")) {
      return callback(null, true);
    }
    
    callback(new Error("Not allowed by CORS"), false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
});
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
