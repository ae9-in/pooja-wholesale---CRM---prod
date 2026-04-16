import { prisma } from "../../lib/prisma.js";
import { createPaginationMeta, getPagination } from "../../utils/pagination.js";
import { logActivity } from "../activity/activity.service.js";
import {
  cancelReminder,
  deriveReminderStatus,
  markReminderDone,
  rescheduleReminder,
  snoozeReminder,
} from "./reminders.service.js";

type ReminderStatusValue = "PENDING" | "UPCOMING" | "DONE" | "OVERDUE" | "SNOOZED" | "CANCELLED";
type ReminderTypeValue = "WHOLESALE_REVISIT_15_DAY";
type ReminderCreateInput = {
  customerId: string;
  deliveryId?: string | null;
  reminderType: ReminderTypeValue;
  reminderDate: string | Date;
  title: string;
  description?: string | null;
  assignedStaffId?: string | null;
  status?: ReminderStatusValue;
  completedAt?: Date | null;
  snoozedUntil?: Date | null;
  completionNote?: string | null;
  createdBySystem?: boolean;
};
type ReminderUpdateInput = Partial<{
  title: string;
  description: string | null;
  assignedStaffId: string | null;
  status: ReminderStatusValue;
  reminderDate: string | Date;
  snoozedUntil: Date | null;
  completedAt: Date | null;
  completionNote: string | null;
}>;

const REMINDER_STATUS = {
  PENDING: "PENDING",
  UPCOMING: "UPCOMING",
  DONE: "DONE",
  OVERDUE: "OVERDUE",
  SNOOZED: "SNOOZED",
  CANCELLED: "CANCELLED",
} as const;

function reminderWhere(query: Record<string, string>, user?: Express.UserPayload) {
  const and: Array<Record<string, unknown>> = [];
  if (user?.role === "STAFF") {
    and.push({ assignedStaffId: user.id });
  }
  if (query.status) and.push({ status: query.status as ReminderStatusValue });
  if (query.assignedStaffId) and.push({ assignedStaffId: query.assignedStaffId });
  if (query.reminderType) and.push({ reminderType: query.reminderType as ReminderTypeValue });
  if (query.dateFrom || query.dateTo) {
    and.push({
      reminderDate: {
        gte: query.dateFrom ? new Date(query.dateFrom) : undefined,
        lte: query.dateTo ? new Date(query.dateTo) : undefined,
      },
    });
  }
  if (query.overdueOnly === "true") and.push({ status: REMINDER_STATUS.OVERDUE });
  if (query.upcomingOnly === "true") and.push({ status: REMINDER_STATUS.UPCOMING });
  if (query.doneOnly === "true") and.push({ status: REMINDER_STATUS.DONE });
  return and.length ? { AND: and } : {};
}

export const remindersServiceApi = {
  async list(query: Record<string, string>, user?: Express.UserPayload) {
    const { page, limit, skip } = getPagination(Number(query.page), Number(query.limit));
    const where = reminderWhere(query, user);
    const [total, data] = await Promise.all([
      prisma.reminder.count({ where }),
      prisma.reminder.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: true,
          delivery: true,
          assignedStaff: { select: { id: true, fullName: true } },
        },
        orderBy: [{ reminderDate: "asc" }],
      }),
    ]);

    return {
      data: data.map((item: any) => ({
        ...item,
        status: deriveReminderStatus(item.snoozedUntil ?? item.reminderDate, item.status),
      })),
      meta: createPaginationMeta(total, page, limit),
    };
  },

  async getById(id: string) {
    return prisma.reminder.findUnique({
      where: { id },
      include: {
        customer: true,
        delivery: { include: { items: true } },
        assignedStaff: { select: { id: true, fullName: true } },
      },
    });
  },

  async create(input: ReminderCreateInput, actorId: string) {
    const reminder = await prisma.reminder.create({
      data: {
        ...input,
        reminderDate: new Date(input.reminderDate as string | Date),
      },
    });

    await logActivity({
      entityType: "REMINDER",
      entityId: reminder.id,
      action: "CREATED",
      message: "Reminder created",
      actorId,
    });

    return reminder;
  },

  async update(id: string, input: ReminderUpdateInput, actorId: string) {
    const reminder = await prisma.reminder.update({
      where: { id },
      data: input,
    });

    await logActivity({
      entityType: "REMINDER",
      entityId: reminder.id,
      action: "UPDATED",
      message: "Reminder updated",
      actorId,
    });

    return reminder;
  },

  async complete(id: string, completionNote: string, actorId: string) {
    const reminder = await markReminderDone(id, completionNote);
    await logActivity({
      entityType: "REMINDER",
      entityId: reminder.id,
      action: "COMPLETED",
      message: "Reminder completed",
      actorId,
    });
    return reminder;
  },

  async snooze(id: string, snoozedUntil: Date, actorId: string) {
    const reminder = await snoozeReminder(id, snoozedUntil);
    await logActivity({
      entityType: "REMINDER",
      entityId: reminder.id,
      action: "SNOOZED",
      message: "Reminder snoozed",
      actorId,
    });
    return reminder;
  },

  async reschedule(id: string, reminderDate: Date, actorId: string) {
    const reminder = await rescheduleReminder(id, reminderDate);
    await logActivity({
      entityType: "REMINDER",
      entityId: reminder.id,
      action: "RESCHEDULED",
      message: "Reminder rescheduled",
      actorId,
    });
    return reminder;
  },

  async cancel(id: string, actorId: string) {
    const reminder = await cancelReminder(id);
    await logActivity({
      entityType: "REMINDER",
      entityId: reminder.id,
      action: "CANCELLED",
      message: "Reminder cancelled",
      actorId,
    });
    return reminder;
  },
};
