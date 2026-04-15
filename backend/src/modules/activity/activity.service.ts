import { ActivityEntityType, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

export async function logActivity(data: {
  entityType: ActivityEntityType;
  entityId: string;
  action: string;
  message: string;
  actorId?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.activityLog.create({
    data,
  });
}
