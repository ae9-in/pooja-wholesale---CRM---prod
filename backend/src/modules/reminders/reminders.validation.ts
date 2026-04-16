import { z } from "zod";

const reminderStatusSchema = z.enum(["PENDING", "UPCOMING", "DONE", "OVERDUE", "SNOOZED", "CANCELLED"]);
const reminderTypeSchema = z.enum(["WHOLESALE_REVISIT_15_DAY"]);

export const reminderCreateSchema = z.object({
  body: z.object({
    customerId: z.string(),
    deliveryId: z.string().optional(),
    reminderType: reminderTypeSchema,
    reminderDate: z.string().or(z.date()),
    title: z.string().min(2),
    description: z.string().optional(),
    assignedStaffId: z.string().optional().nullable(),
    status: reminderStatusSchema.optional(),
  }),
});

export const reminderUpdateSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    assignedStaffId: z.string().optional().nullable(),
    status: reminderStatusSchema.optional(),
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
