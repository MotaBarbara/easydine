import { app } from "@/http/app";
import { env } from "@/env";

const port = Number(env.PORT) || Number(process.env.PORT) || 3000;

app
  .listen({
    host: "0.0.0.0",
    port,
  })
  .then(() => {
    console.log(`HTTP server running on port ${port}`);
  });
