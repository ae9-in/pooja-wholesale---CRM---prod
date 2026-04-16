import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { prisma } from "../../lib/prisma.js";

const DELIVERY_STATUS = {
  QUOTED: "QUOTED",
  CONFIRMED: "CONFIRMED",
} as const;

const REMINDER_STATUS = {
  PENDING: "PENDING",
  UPCOMING: "UPCOMING",
  OVERDUE: "OVERDUE",
  DONE: "DONE",
} as const;

export const dashboardService = {
  async summary() {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [
      totalCustomers,
      activeCustomers,
      quotedDeliveries,
      confirmedDeliveries,
      deliveriesThisMonth,
      pendingReminders,
      upcomingReminders,
      overdueReminders,
      completedThisMonth,
      recentCustomers,
      recentDeliveryActivity,
      statusBreakdown,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { isArchived: false, status: { not: "INACTIVE" } } }),
      prisma.delivery.count({ where: { deliveryStatus: DELIVERY_STATUS.QUOTED } }),
      prisma.delivery.count({ where: { deliveryStatus: DELIVERY_STATUS.CONFIRMED } }),
      prisma.delivery.count({ where: { createdAt: { gte: monthStart, lte: monthEnd } } }),
      prisma.reminder.count({ where: { status: REMINDER_STATUS.PENDING } }),
      prisma.reminder.count({ where: { status: REMINDER_STATUS.UPCOMING } }),
      prisma.reminder.count({ where: { status: REMINDER_STATUS.OVERDUE } }),
      prisma.reminder.count({
        where: {
          status: REMINDER_STATUS.DONE,
          completedAt: { gte: monthStart, lte: monthEnd },
        },
      }),
      prisma.customer.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.activityLog.findMany({
        where: { entityType: "DELIVERY" },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.customer.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    const monthlyTrend = await Promise.all(
      Array.from({ length: 6 }).map(async (_, index) => {
        const base = subMonths(now, 5 - index);
        return {
          month: base.toLocaleString("en-US", { month: "short" }),
          deliveries: await prisma.delivery.count({
            where: {
              createdAt: {
                gte: startOfMonth(base),
                lte: endOfMonth(base),
              },
            },
          }),
          revisitsDone: await prisma.reminder.count({
            where: {
              status: REMINDER_STATUS.DONE,
              completedAt: {
                gte: startOfMonth(base),
                lte: endOfMonth(base),
              },
            },
          }),
        };
      }),
    );

    return {
      metrics: {
        totalCustomers,
        activeCustomers,
        quotedDeliveries,
        confirmedDeliveries,
        deliveriesThisMonth,
        pendingReminders,
        upcomingReminders,
        overdueReminders,
        completedRevisitsThisMonth: completedThisMonth,
      },
      recentCustomers,
      recentDeliveryActivity,
      statusBreakdown,
      monthlyTrend,
    };
  },

  upcomingReminders() {
    return prisma.reminder.findMany({
      where: { status: { in: [REMINDER_STATUS.UPCOMING, REMINDER_STATUS.PENDING] } },
      take: 10,
      orderBy: { reminderDate: "asc" },
      include: { customer: true, assignedStaff: { select: { id: true, fullName: true } } },
    });
  },

  overdueReminders() {
    return prisma.reminder.findMany({
      where: { status: REMINDER_STATUS.OVERDUE },
      take: 10,
      orderBy: { reminderDate: "asc" },
      include: { customer: true, assignedStaff: { select: { id: true, fullName: true } } },
    });
  },

  recentCustomers() {
    return prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  },

  async deliverySummary() {
    const byStatus = await prisma.delivery.groupBy({
      by: ["deliveryStatus"],
      _count: { deliveryStatus: true },
      _sum: { totalQuotedValue: true },
    });

    return byStatus.map((row: any) => ({
      status: row.deliveryStatus,
      count: row._count.deliveryStatus,
      totalValue: Number(row._sum.totalQuotedValue ?? 0),
    }));
  },

  async statusBreakdown() {
    return prisma.customer.groupBy({
      by: ["status"],
      _count: { status: true },
    });
  },
};
