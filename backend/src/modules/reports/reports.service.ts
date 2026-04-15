import { prisma } from "../../lib/prisma.js";

function extractObjectId(value: any): string | null {
  if (!value) return null;
  if (typeof value === "object" && value.$oid) return value.$oid;
  if (typeof value === "string") return value;
  return null;
}

export const reportsService = {
  async customers() {
    const result = await prisma.customer.aggregateRaw({
      pipeline: [
        {
          $group: {
            _id: { status: "$status", assignedStaffId: "$assignedStaffId" },
            count: { $sum: 1 },
          },
        },
      ],
    });

    return (result as unknown as any[]).map((row) => ({
      status: row._id.status,
      assignedStaffId: extractObjectId(row._id.assignedStaffId),
      _count: { status: row.count },
    }));
  },

  async deliveries() {
    const result = await prisma.deliveryItem.aggregateRaw({
      pipeline: [
        {
          $group: {
            _id: { productGroup: "$productGroup", productType: "$productType" },
            count: { $sum: 1 },
            totalValue: { $sum: "$subtotal" },
          },
        },
      ],
    });

    return (result as unknown as any[]).map((row) => ({
      productGroup: row._id.productGroup,
      productType: row._id.productType || null,
      count: row.count,
      totalValue: Number(row.totalValue ?? 0),
    }));
  },

  async reminders() {
    const result = await prisma.reminder.aggregateRaw({
      pipeline: [
        {
          $group: {
            _id: { status: "$status", assignedStaffId: "$assignedStaffId" },
            count: { $sum: 1 },
          },
        },
      ],
    });

    return (result as unknown as any[]).map((row) => ({
      status: row._id.status,
      assignedStaffId: extractObjectId(row._id.assignedStaffId),
      _count: { status: row.count },
    }));
  },

  async revisitPerformance() {
    const [completed, overdue, staffWiseResult] = await Promise.all([
      prisma.reminder.count({ where: { status: "DONE" } }),
      prisma.reminder.count({ where: { status: "OVERDUE" } }),
      prisma.reminder.aggregateRaw({
        pipeline: [
          {
            $match: {
              status: { $in: ["PENDING", "UPCOMING", "OVERDUE", "SNOOZED"] },
            },
          },
          {
            $group: {
              _id: { assignedStaffId: "$assignedStaffId" },
              count: { $sum: 1 },
            },
          },
        ],
      }),
    ]);

    const staffWise = (staffWiseResult as unknown as any[]).map((row) => ({
      assignedStaffId: extractObjectId(row._id.assignedStaffId),
      _count: { assignedStaffId: row.count },
    }));

    return { completed, overdue, staffWise };
  },
};
