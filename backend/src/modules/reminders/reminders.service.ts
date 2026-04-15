import {
  DeliveryStatus,
  Prisma,
  ReminderStatus,
  ReminderType,
  PrismaClient,
} from "@prisma/client";
import { addDays, isAfter, isBefore, startOfDay } from "date-fns";
import { prisma } from "../../lib/prisma.js";

export const UPCOMING_WINDOW_DAYS = 3;

export function calculateRevisitDate(quotedDeliveryDate: Date) {
  return addDays(startOfDay(quotedDeliveryDate), 15);
}

export function deriveReminderStatus(reminderDate: Date, currentStatus?: ReminderStatus) {
  if (
    currentStatus === ReminderStatus.DONE ||
    currentStatus === ReminderStatus.CANCELLED ||
    currentStatus === ReminderStatus.SNOOZED
  ) {
    return currentStatus;
  }

  const today = startOfDay(new Date());
  const reminderDay = startOfDay(reminderDate);

  if (isBefore(reminderDay, today)) {
    return ReminderStatus.OVERDUE;
  }

  if (!isAfter(reminderDay, addDays(today, UPCOMING_WINDOW_DAYS))) {
    return ReminderStatus.UPCOMING;
  }

  return ReminderStatus.PENDING;
}

export async function syncRevisitReminderForDelivery(
  delivery: {
    id: string;
    customerId: string;
    quotedDeliveryDate: Date;
    assignedStaffId: string | null;
    deliveryStatus: DeliveryStatus;
    customer?: { businessName: string };
  },
  prismaClient: PrismaClient | Prisma.TransactionClient = prisma,
) {
  const reminderDate = calculateRevisitDate(delivery.quotedDeliveryDate);
  const title = `15-day revisit for ${delivery.customer?.businessName ?? "customer"}`;
  const status =
    delivery.deliveryStatus === DeliveryStatus.CANCELLED
      ? ReminderStatus.CANCELLED
      : deriveReminderStatus(reminderDate);

  const existingReminder = await prismaClient.reminder.findFirst({
    where: {
      deliveryId: delivery.id,
      reminderType: ReminderType.WHOLESALE_REVISIT_15_DAY,
    },
  });

  if (existingReminder) {
    return prismaClient.reminder.update({
      where: { id: existingReminder.id },
      data: {
        reminderDate,
        status,
        title,
        assignedStaffId: delivery.assignedStaffId,
        description: "Auto-maintained 15-day revisit reminder for quoted delivery.",
      },
    });
  }

  return prismaClient.reminder.create({
    data: {
      customerId: delivery.customerId,
      deliveryId: delivery.id,
      reminderType: ReminderType.WHOLESALE_REVISIT_15_DAY,
      reminderDate,
      status,
      title,
      description: "Auto-created 15-day revisit reminder for quoted delivery.",
      assignedStaffId: delivery.assignedStaffId,
      createdBySystem: true,
    },
  });
}

export async function updateReminderStatuses(prismaClient: PrismaClient = prisma) {
  const reminders = await prismaClient.reminder.findMany({
    where: {
      status: {
        in: [ReminderStatus.PENDING, ReminderStatus.UPCOMING, ReminderStatus.OVERDUE],
      },
    },
  });

  await Promise.all(
    reminders.map((reminder) =>
      prismaClient.reminder.update({
        where: { id: reminder.id },
        data: { status: deriveReminderStatus(reminder.reminderDate, reminder.status) },
      }),
    ),
  );
}

export async function repairMissingRevisitReminders(
  prismaClient: PrismaClient | Prisma.TransactionClient = prisma,
) {
  const deliveries = await prismaClient.delivery.findMany({
    include: {
      customer: true,
      reminders: {
        where: { reminderType: ReminderType.WHOLESALE_REVISIT_15_DAY },
      },
    },
  });

  const missing = deliveries.filter((delivery) => delivery.reminders.length === 0);

  for (const delivery of missing) {
    await syncRevisitReminderForDelivery(delivery, prismaClient);
  }

  return missing.length;
}

export async function markReminderDone(
  reminderId: string,
  completionNote: string,
  prismaClient: PrismaClient | Prisma.TransactionClient = prisma,
) {
  return prismaClient.reminder.update({
    where: { id: reminderId },
    data: {
      status: ReminderStatus.DONE,
      completedAt: new Date(),
      completionNote,
    },
  });
}

export async function snoozeReminder(
  reminderId: string,
  snoozedUntil: Date,
  prismaClient: PrismaClient | Prisma.TransactionClient = prisma,
) {
  return prismaClient.reminder.update({
    where: { id: reminderId },
    data: {
      status: ReminderStatus.SNOOZED,
      snoozedUntil,
    },
  });
}

export async function rescheduleReminder(
  reminderId: string,
  reminderDate: Date,
  prismaClient: PrismaClient | Prisma.TransactionClient = prisma,
) {
  return prismaClient.reminder.update({
    where: { id: reminderId },
    data: {
      reminderDate,
      snoozedUntil: null,
      status: deriveReminderStatus(reminderDate),
    },
  });
}

export async function cancelReminder(
  reminderId: string,
  prismaClient: PrismaClient | Prisma.TransactionClient = prisma,
) {
  return prismaClient.reminder.update({
    where: { id: reminderId },
    data: {
      status: ReminderStatus.CANCELLED,
    },
  });
}
