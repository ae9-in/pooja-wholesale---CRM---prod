import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting data cleanup...");

  // Delete in correct order to respect foreign key constraints
  await prisma.activityLog.deleteMany();
  console.log("✓ Deleted activity logs");

  await prisma.note.deleteMany();
  console.log("✓ Deleted notes");

  await prisma.reminder.deleteMany();
  console.log("✓ Deleted reminders");

  await prisma.deliveryItem.deleteMany();
  console.log("✓ Deleted delivery items");

  await prisma.delivery.deleteMany();
  console.log("✓ Deleted deliveries");

  await prisma.customer.deleteMany();
  console.log("✓ Deleted customers");

  console.log("\n✅ All dummy data cleared successfully!");
  console.log("Note: User accounts are preserved for login.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Error clearing data:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
