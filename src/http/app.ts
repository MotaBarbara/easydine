import fastify from "fastify";
import { PrismaClient } from "generated/prisma/index.js";

export const app = fastify();

const prisma = new PrismaClient();
prisma.user
  .create({
    data: {
      email: "joao@gmail.com",
      passwordHash: "123456",
      role: "OWNER",
    },
  })
  .then(() => console.log("User created"));
