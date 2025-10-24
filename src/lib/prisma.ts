import { PrismaClient } from "../../generated/prisma/index.js";
import { env } from "process";

export const prisma = new PrismaClient({
  log: env.NODE_ENV === "dev" ? ["query", "info", "warn", "error"] : [],
});
