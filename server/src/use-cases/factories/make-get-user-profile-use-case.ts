import { PrismaUsersRepository } from "@/repositories/prisma-users-repository";
import { GetUserProfileUseCase } from "../get-user-profile";

export function makeGetUserProfileUseCase() {
  const usersRepo = new PrismaUsersRepository();
  return new GetUserProfileUseCase(usersRepo);
}

