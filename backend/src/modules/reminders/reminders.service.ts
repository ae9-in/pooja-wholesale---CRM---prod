import { addDays, isAfter, isBefore, startOfDay } from "date-fns";
import { prisma } from "../../lib/prisma.js";

export const UPCOMING_WINDOW_DAYS = 3;

type DeliveryStatusValue = "QUOTED" | "CONFIRMED" | "DISPATCHED" | "DELIVERED" | "CANCELLED";
type ReminderStatusValue = "PENDING" | "UPCOMING" | "DONE" | "OVERDUE" | "SNOOZED" | "CANCELLED";
type ReminderTypeValue = "WHOLESALE_REVISIT_15_DAY";
type ReminderRecord = {
  id: string;
  reminderDate: Date;
  status: ReminderStatusValue;
};
type ReminderClient = Pick<typeof prisma, "reminder">;
type DeliveryAndReminderClient = Pick<typeof prisma, "delivery" | "reminder">;
type DeliveryWithRevisitState = {
  id: string;
  customerId: string;
  quotedDeliveryDate: Date;
  assignedStaffId: string | null;
  deliveryStatus: DeliveryStatusValue;
  customer?: { businessName: string } | null;
  reminders: Array<{ id: string }>;
};

const DELIVERY_STATUS = {
  CANCELLED: "CANCELLED",
} as const;

const REMINDER_STATUS = {
  PENDING: "PENDING",
  UPCOMING: "UPCOMING",
  DONE: "DONE",
  OVERDUE: "OVERDUE",
  SNOOZED: "SNOOZED",
  CANCELLED: "CANCELLED",
} as const;

const REMINDER_TYPE = {
  WHOLESALE_REVISIT_15_DAY: "WHOLESALE_REVISIT_15_DAY",
} as const;

export function calculateRevisitDate(quotedDeliveryDate: Date) {
  return addDays(startOfDay(quotedDeliveryDate), 15);
}

export function deriveReminderStatus(reminderDate: Date, currentStatus?: ReminderStatusValue) {
  if (
    currentStatus === REMINDER_STATUS.DONE ||
    currentStatus === REMINDER_STATUS.CANCELLED ||
    currentStatus === REMINDER_STATUS.SNOOZED
  ) {
    return currentStatus;
  }

  const today = startOfDay(new Date());
  const reminderDay = startOfDay(reminderDate);

  if (isBefore(reminderDay, today)) {
    return REMINDER_STATUS.OVERDUE;
  }

  if (!isAfter(reminderDay, addDays(today, UPCOMING_WINDOW_DAYS))) {
    return REMINDER_STATUS.UPCOMING;
  }

  return REMINDER_STATUS.PENDING;
}

export async function syncRevisitReminderForDelivery(
  delivery: {
    id: string;
    customerId: string;
    quotedDeliveryDate: Date;
    assignedStaffId: string | null;
    deliveryStatus: DeliveryStatusValue;
    customer?: { businessName: string };
  },
  prismaClient: DeliveryAndReminderClient = prisma,
) {
  const reminderDate = calculateRevisitDate(delivery.quotedDeliveryDate);
  const title = `15-day revisit for ${delivery.customer?.businessName ?? "customer"}`;
  const status =
    delivery.deliveryStatus === DELIVERY_STATUS.CANCELLED
      ? REMINDER_STATUS.CANCELLED
      : deriveReminderStatus(reminderDate);

  const existingReminder = await prismaClient.reminder.findFirst({
    where: {
      deliveryId: delivery.id,
      reminderType: REMINDER_TYPE.WHOLESALE_REVISIT_15_DAY,
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
      reminderType: REMINDER_TYPE.WHOLESALE_REVISIT_15_DAY as ReminderTypeValue,
      reminderDate,
      status,
      title,
      description: "Auto-created 15-day revisit reminder for quoted delivery.",
      assignedStaffId: delivery.assignedStaffId,
      createdBySystem: true,
    },
  });
}

export async function updateReminderStatuses(prismaClient: ReminderClient = prisma) {
  const reminders = await prismaClient.reminder.findMany({
    where: {
      status: {
        in: [REMINDER_STATUS.PENDING, REMINDER_STATUS.UPCOMING, REMINDER_STATUS.OVERDUE],
      },
    },
  });

  await Promise.all(
    reminders.map((reminder: ReminderRecord) =>
      prismaClient.reminder.update({
        where: { id: reminder.id },
        data: { status: deriveReminderStatus(reminder.reminderDate, reminder.status) },
      }),
    ),
  );
}

export async function repairMissingRevisitReminders(
  prismaClient: DeliveryAndReminderClient = prisma,
) {
  const deliveries = await prismaClient.delivery.findMany({
    include: {
      customer: true,
      reminders: {
        where: { reminderType: REMINDER_TYPE.WHOLESALE_REVISIT_15_DAY },
      },
    },
  });

  const missing = deliveries.filter((delivery: DeliveryWithRevisitState) => delivery.reminders.length === 0);

  for (const delivery of missing) {
    await syncRevisitReminderForDelivery(delivery, prismaClient);
  }

  return missing.length;
}

export async function markReminderDone(
  reminderId: string,
  completionNote: string,
  prismaClient: ReminderClient = prisma,
) {
  return prismaClient.reminder.update({
    where: { id: reminderId },
    data: {
      status: REMINDER_STATUS.DONE,
      completedAt: new Date(),
      completionNote,
    },
  });
}

export async function snoozeReminder(
  reminderId: string,
  snoozedUntil: Date,
  prismaClient: ReminderClient = prisma,
) {
  return prismaClient.reminder.update({
    where: { id: reminderId },
    data: {
      status: REMINDER_STATUS.SNOOZED,
      snoozedUntil,
    },
  });
}

export async function rescheduleReminder(
  reminderId: string,
  reminderDate: Date,
  prismaClient: ReminderClient = prisma,
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
  prismaClient: ReminderClient = prisma,
) {
  return prismaClient.reminder.update({
    where: { id: reminderId },
    data: {
      status: REMINDER_STATUS.CANCELLED,
    },
  });
}
