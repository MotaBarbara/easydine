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

  console.log(`Found user: ${user.email} (${user.id})`);

  const restaurants = await prisma.restaurant.findMany({
    where: {
      OR: [
        { name: { contains: "Restaurant" } },
        { name: "Sunday" },
        { name: "Saturday" },
      ],
    },
  });

  console.log(`Found ${restaurants.length} restaurants to connect`);

  // Connect user to each restaurant using the new many-to-many relationship
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
      console.log(`✓ Connected user to: ${restaurant.name}`);
    } catch (error) {
      console.error(`✗ Failed to connect to ${restaurant.name}:`, error);
    }
  }

  console.log("\nDone! All restaurants should now be connected to the user.");
}

fixRestaurantConnections()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

