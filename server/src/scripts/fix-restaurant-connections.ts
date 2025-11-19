import { prisma } from "../lib/prisma";

async function fixRestaurantConnections() {
  const userEmail = process.argv[2] || "b@gmail.com";
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    console.error(`User with email ${userEmail} not found`);
    process.exit(1);
  }

  const restaurants = await prisma.restaurant.findMany({
    where: {
      OR: [
        { name: { contains: "Restaurant" } },
        { name: "Sunday" },
        { name: "Saturday" },
      ],
    },
  });

  for (const restaurant of restaurants) {
    try {
      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: {
          owners: {
            connect: { id: user.id },
          },
        },
      });
    } catch (error) {
      console.error(`✗ Failed to connect to ${restaurant.name}:`, error);
    }
  }

}

fixRestaurantConnections()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

