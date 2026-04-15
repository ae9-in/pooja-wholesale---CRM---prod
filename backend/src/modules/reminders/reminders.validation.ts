import { ReminderStatus, ReminderType } from "@prisma/client";
import { z } from "zod";

export const reminderCreateSchema = z.object({
  body: z.object({
    customerId: z.string(),
    deliveryId: z.string().optional(),
    reminderType: z.nativeEnum(ReminderType),
    reminderDate: z.string().or(z.date()),
    title: z.string().min(2),
    description: z.string().optional(),
    assignedStaffId: z.string().optional().nullable(),
    status: z.nativeEnum(ReminderStatus).optional(),
  }),
});

export const reminderUpdateSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    assignedStaffId: z.string().optional().nullable(),
    status: z.nativeEnum(ReminderStatus).optional(),
  }),
});

export const reminderCompleteSchema = z.object({
  body: z.object({
    completionNote: z.string().min(1),
  }),
});

export const reminderSnoozeSchema = z.object({
  body: z.object({
    snoozedUntil: z.string().or(z.date()),
  }),
});

export const reminderRescheduleSchema = z.object({
  body: z.object({
    reminderDate: z.string().or(z.date()),
  }),
});
