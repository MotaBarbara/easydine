-- CreateTable: _RestaurantToUser (implicit many-to-many join table)
CREATE TABLE "_RestaurantToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RestaurantToUser_AB_unique" ON "_RestaurantToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RestaurantToUser_B_index" ON "_RestaurantToUser"("B");

-- AddForeignKey
ALTER TABLE "_RestaurantToUser" ADD CONSTRAINT "_RestaurantToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RestaurantToUser" ADD CONSTRAINT "_RestaurantToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing data: Copy restaurantId relationships to the join table
INSERT INTO "_RestaurantToUser" ("A", "B")
SELECT "restaurantId", "id"
FROM "User"
WHERE "restaurantId" IS NOT NULL;

-- Drop the old restaurantId column (optional - we can keep it for backward compatibility)
-- ALTER TABLE "User" DROP COLUMN "restaurantId";

