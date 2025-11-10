import type { FastifyInstance } from "fastify";
import { register } from "./controllers/register";
import { authenticate } from "./controllers/authenticate";
import { createRestaurant } from "./controllers/restaurants/create";
import { createReservation } from "./controllers/reservations/create";
import { cancelReservation } from "./controllers/reservations/cancel";
import { listReservations } from "./controllers/list-reservations";

export async function authRoutes(app: FastifyInstance) {
  app.post("/users", register);
  app.post("/sessions", authenticate);
  app.post("/restaurants", createRestaurant);
  app.post("/reservations", createReservation);
  app.patch("/reservations/:id/cancel", cancelReservation);
  app.get("/restaurants/:restaurantId/reservations", listReservations);
}
