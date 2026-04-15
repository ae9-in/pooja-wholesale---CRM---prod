import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting migration: POOJA -> RAW_AGARBATTI");

  // Use raw MongoDB query to update delivery items
  const result = await prisma.$runCommandRaw({
    update: "DeliveryItem",
    updates: [
      {
        q: { productGroup: "POOJA" },
        u: { $set: { productGroup: "RAW_AGARBATTI" } },
        multi: true,
      },
    ],
  });

  console.log("Migration result:", result);
  console.log("Migration completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Migration failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
