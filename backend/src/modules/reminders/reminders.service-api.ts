import { Prisma, ReminderStatus, ReminderType } from "@prisma/client";
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

function reminderWhere(query: Record<string, string>, user?: Express.UserPayload): Prisma.ReminderWhereInput {
  const and: Prisma.ReminderWhereInput[] = [];
  if (user?.role === "STAFF") {
    and.push({ assignedStaffId: user.id });
  }
  if (query.status) and.push({ status: query.status as ReminderStatus });
  if (query.assignedStaffId) and.push({ assignedStaffId: query.assignedStaffId });
  if (query.reminderType) and.push({ reminderType: query.reminderType as ReminderType });
  if (query.dateFrom || query.dateTo) {
    and.push({
      reminderDate: {
        gte: query.dateFrom ? new Date(query.dateFrom) : undefined,
        lte: query.dateTo ? new Date(query.dateTo) : undefined,
      },
    });
  }
  if (query.overdueOnly === "true") and.push({ status: ReminderStatus.OVERDUE });
  if (query.upcomingOnly === "true") and.push({ status: ReminderStatus.UPCOMING });
  if (query.doneOnly === "true") and.push({ status: ReminderStatus.DONE });
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
      data: data.map((item) => ({
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

  async create(input: Prisma.ReminderUncheckedCreateInput, actorId: string) {
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

  async update(id: string, input: Prisma.ReminderUncheckedUpdateInput, actorId: string) {
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
