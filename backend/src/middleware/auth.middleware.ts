import { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/app-error.js";

type RoleValue = "SUPER_ADMIN" | "ADMIN" | "STAFF";

async function resolveActingUser() {
  const preferredUser = await prisma.user.findFirst({
    where: {
      email: env.DEFAULT_OPERATOR_EMAIL,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  if (preferredUser) {
    return preferredUser;
  }

  const existingUser = await prisma.user.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  if (existingUser) {
    return existingUser;
  }

  return prisma.user.create({
    data: {
      fullName: "System Operator",
      email: env.DEFAULT_OPERATOR_EMAIL,
      passwordHash: "auth-disabled",
      role: "ADMIN",
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const actingUser = await resolveActingUser();
    req.user = actingUser;
    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(..._roles: RoleValue[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("No acting user is available for this request.", 500));
    }
    next();
  };
}
