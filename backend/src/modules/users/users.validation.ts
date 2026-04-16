import { z } from "zod";

const roleSchema = z.enum(["SUPER_ADMIN", "ADMIN", "STAFF"]);

export const userCreateSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: roleSchema,
    phone: z.string().optional(),
  }),
});

export const userUpdateSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    role: roleSchema.optional(),
    phone: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});
