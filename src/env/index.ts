import { error } from "console";
import "dotenv/config";
import z from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3333),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.log("Invalid env variables", z.treeifyError(_env.error));
  throw new Error("Invalud env variables");
}

export const env = _env.data;
