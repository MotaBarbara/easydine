/*
  Warnings:

  - You are about to drop the column `key` on the `Restaurant` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Restaurant_key_key";

-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "key";
