import { PrismaReservationsRepository } from "@/repositories/prisma-reservations-repository";
import { ListReservationsUseCase } from "../list-reservations";

export function makeListReservationsUseCase() {
  const reservationsRepository = new PrismaReservationsRepository();
  return new ListReservationsUseCase(reservationsRepository);
}
