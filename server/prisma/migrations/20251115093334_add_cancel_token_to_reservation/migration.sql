/*
  Warnings:

  - A unique constraint covering the columns `[cancelToken]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.
  - The required column `cancelToken` was added to the `Reservation` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "cancelToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_cancelToken_key" ON "Reservation"("cancelToken");
