import { Role } from "@prisma/client";
import { z } from "zod";

export const userCreateSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.nativeEnum(Role),
    phone: z.string().optional(),
  }),
});

export const userUpdateSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    role: z.nativeEnum(Role).optional(),
    phone: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});
