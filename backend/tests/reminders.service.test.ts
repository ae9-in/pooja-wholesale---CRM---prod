import { DeliveryStatus, ReminderStatus, ReminderType } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import {
  calculateRevisitDate,
  deriveReminderStatus,
  syncRevisitReminderForDelivery,
} from "../src/modules/reminders/reminders.service.js";

describe("reminder revisit rule", () => {
  it("calculates revisit date exactly 15 days after quoted delivery date", () => {
    const quotedDeliveryDate = new Date("2026-04-10T12:00:00.000Z");
    const revisitDate = calculateRevisitDate(quotedDeliveryDate);
    const differenceInDays = Math.round(
      (revisitDate.getTime() - new Date("2026-04-10T00:00:00.000Z").getTime()) / (1000 * 60 * 60 * 24),
    );

    expect(differenceInDays).toBe(15);
  });

  it("marks past reminders overdue", () => {
    expect(deriveReminderStatus(new Date("2020-01-01T00:00:00.000Z"))).toBe(ReminderStatus.OVERDUE);
  });

  it("upserts one revisit reminder per delivery instead of duplicating", async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const create = vi.fn().mockResolvedValue({ id: "rem-1" });
    const fakePrisma = {
      reminder: { findFirst, create },
    } as unknown as Parameters<typeof syncRevisitReminderForDelivery>[1];

    await syncRevisitReminderForDelivery(
      {
        id: "delivery-1",
        customerId: "customer-1",
        quotedDeliveryDate: new Date("2026-04-10T00:00:00.000Z"),
        assignedStaffId: "staff-1",
        deliveryStatus: DeliveryStatus.QUOTED,
        customer: { businessName: "Shree Traders" },
      },
      fakePrisma,
    );

    expect(findFirst).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          deliveryId: "delivery-1",
          reminderType: ReminderType.WHOLESALE_REVISIT_15_DAY,
        }),
      }),
    );
  });
});
