import bcrypt from "bcryptjs";
import { CustomerPriority, CustomerStatus, DeliveryStatus, FragranceType, NoteType, PrismaClient, ProductGroup, ReminderStatus, ReminderType, Role, } from "@prisma/client";
import { addDays } from "date-fns";
const prisma = new PrismaClient();
async function main() {
    const passwordHash = await bcrypt.hash("Password123!", 10);
    const [superAdmin, admin, staff] = await Promise.all([
        prisma.user.upsert({
            where: { email: "superadmin@wholesale.local" },
            update: {},
            create: {
                fullName: "Super Admin",
                email: "superadmin@wholesale.local",
                passwordHash,
                role: Role.SUPER_ADMIN,
                phone: "9000000001",
            },
        }),
        prisma.user.upsert({
            where: { email: "admin@wholesale.local" },
            update: {},
            create: {
                fullName: "Operations Admin",
                email: "admin@wholesale.local",
                passwordHash,
                role: Role.ADMIN,
                phone: "9000000002",
            },
        }),
        prisma.user.upsert({
            where: { email: "staff@wholesale.local" },
            update: {},
            create: {
                fullName: "Field Staff",
                email: "staff@wholesale.local",
                passwordHash,
                role: Role.STAFF,
                phone: "9000000003",
            },
        }),
    ]);
    const customer = await prisma.customer.upsert({
        where: { id: "seed-customer-1" },
        update: {},
        create: {
            id: "seed-customer-1",
            businessName: "Shree Traders",
            ownerName: "Mahesh Gupta",
            phoneNumber1: "9876543210",
            phoneNumber2: "9876500000",
            email: "mahesh@shreetraders.local",
            addressLine1: "12 Market Road",
            area: "Industrial Area",
            city: "Kanpur",
            state: "Uttar Pradesh",
            pincode: "208001",
            description: "High-volume incense reseller",
            businessType: "Distributor",
            status: CustomerStatus.QUOTED,
            priority: CustomerPriority.HIGH,
            source: "Referral",
            assignedStaffId: staff.id,
            createdById: admin.id,
        },
    });
    const deliveryDate = new Date("2026-04-10T00:00:00.000Z");
    const reminderDate = addDays(deliveryDate, 15);
    const delivery = await prisma.delivery.upsert({
        where: { id: "seed-delivery-1" },
        update: {},
        create: {
            id: "seed-delivery-1",
            customerId: customer.id,
            quoteDate: new Date("2026-04-09T00:00:00.000Z"),
            quotedDeliveryDate: deliveryDate,
            deliveryStatus: DeliveryStatus.QUOTED,
            totalQuotedValue: 4500,
            notes: "Seed quoted delivery",
            assignedStaffId: staff.id,
            createdById: admin.id,
            items: {
                create: [
                    {
                        productGroup: ProductGroup.DHOOP,
                        productType: FragranceType.ROSE,
                        quantity: 100,
                        packingSize: "50 sticks",
                        packingQuantity: 2,
                        quotedPrice: 20,
                        subtotal: 2000,
                    },
                    {
                        productGroup: ProductGroup.CAMPHOR,
                        quantity: 50,
                        packingSize: "250 g",
                        packingQuantity: 1,
                        quotedPrice: 50,
                        subtotal: 2500,
                    },
                ],
            },
        },
    });
    await prisma.reminder.upsert({
        where: {
            deliveryId_reminderType: {
                deliveryId: delivery.id,
                reminderType: ReminderType.WHOLESALE_REVISIT_15_DAY,
            },
        },
        update: {},
        create: {
            customerId: customer.id,
            deliveryId: delivery.id,
            reminderType: ReminderType.WHOLESALE_REVISIT_15_DAY,
            reminderDate,
            status: ReminderStatus.PENDING,
            title: "15-day revisit for Shree Traders",
            description: "Follow up after quoted delivery.",
            assignedStaffId: staff.id,
            createdBySystem: true,
        },
    });
    await prisma.note.create({
        data: {
            customerId: customer.id,
            deliveryId: delivery.id,
            authorId: admin.id,
            content: "Customer requested Rose fragrance sample pack.",
            noteType: NoteType.DELIVERY,
        },
    });
    await prisma.activityLog.createMany({
        data: [
            {
                entityType: "CUSTOMER",
                entityId: customer.id,
                action: "CREATED",
                message: "Seed customer created",
                actorId: admin.id,
            },
            {
                entityType: "DELIVERY",
                entityId: delivery.id,
                action: "CREATED",
                message: "Seed delivery created",
                actorId: admin.id,
            },
        ],
    });
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
});
