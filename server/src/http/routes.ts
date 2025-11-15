import type { FastifyInstance } from "fastify";
import { register } from "./controllers/register";
import { authenticate } from "./controllers/authenticate";
import { createRestaurant } from "./controllers/restaurants/create";
import { createReservation } from "./controllers/reservations/create";
import { cancelReservation } from "./controllers/reservations/cancel";
import { listReservations } from "./controllers/list-reservations";
import { verifyJWT } from "./middlewares/verify-jwt";
import { ensureOwner } from "./middlewares/ensure-owner";
import { updateRestaurant } from "./controllers/update-restaurant";
import { listRestaurants } from "./controllers/list-restaurants";
import { getRestaurant } from "./controllers/get-restaurant";
import { getRestaurantAvailability } from "./controllers/get-restaurant-availability";
import { cancelReservationByToken } from "./controllers/cancel-reservation-by-token";

export async function appRoutes(app: FastifyInstance) {
  app.post("/users", register);
  app.post("/sessions", authenticate);
  app.post("/restaurants", { preHandler: [verifyJWT] }, createRestaurant);
  app.get(
    "/restaurants/:restaurantId/reservations",
    { preHandler: [verifyJWT, ensureOwner] },
    listReservations,
  );
  app.post("/reservations", createReservation);
  app.patch(
    "/reservations/:reservationId/cancel",
    { preHandler: [verifyJWT] },
    cancelReservation,
  );
  app.put(
    "/restaurants/:restaurantId",
    { preHandler: [verifyJWT, ensureOwner] },
    updateRestaurant,
  );
  app.get("/restaurants", listRestaurants);
  app.get("/restaurants/:restaurantId", getRestaurant);
  app.get("/restaurants/:restaurantId/availability", getRestaurantAvailability);
  app.get("/reservations/cancel/:token", cancelReservationByToken);
}
