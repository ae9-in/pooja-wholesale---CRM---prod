import { describe, expect, it, vi } from "vitest";
import { prisma } from "../src/lib/prisma.js";
import { dashboardService } from "../src/modules/dashboard/dashboard.service.js";

describe("dashboard summary", () => {
  it("returns metrics and trends", async () => {
    vi.spyOn(prisma.customer, "count")
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(88);
    vi.spyOn(prisma.delivery, "count")
      .mockResolvedValueOnce(42)
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(18)
      .mockResolvedValue(3);
    vi.spyOn(prisma.reminder, "count")
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(7)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(9)
      .mockResolvedValue(1);
    vi.spyOn(prisma.customer, "findMany").mockResolvedValue([] as never);
    vi.spyOn(prisma.activityLog, "findMany").mockResolvedValue([] as never);
    vi.spyOn(prisma.customer, "groupBy").mockResolvedValue([] as never);

    const result = await dashboardService.summary();

    expect(result.metrics.totalCustomers).toBe(100);
    expect(result.metrics.quotedDeliveries).toBe(42);
    expect(result.monthlyTrend).toHaveLength(6);
  });
});
