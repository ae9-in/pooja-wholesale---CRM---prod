import { prisma } from "../../lib/prisma.js";

type ActivityEntityTypeValue = "USER" | "CUSTOMER" | "DELIVERY" | "REMINDER" | "NOTE" | "AUTH";
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export async function logActivity(data: {
  entityType: ActivityEntityTypeValue;
  entityId: string;
  action: string;
  message: string;
  actorId?: string;
  metadata?: JsonValue;
}) {
  await prisma.activityLog.create({
    data,
  });
}
