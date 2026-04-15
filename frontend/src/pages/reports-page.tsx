import { useEffect, useMemo, useState } from "react";
import { api, unwrap } from "../services/api";
import { productGroupLabels } from "../constants/domain";
import { Card } from "../components/ui/card";
import { DataTable } from "../components/data-table";
import { StatCard } from "../components/stat-card";
import type { User } from "../types";

type DeliveryProductReportRow = {
  productGroup: string;
  productType: string | null;
  count: number;
  totalValue: number;
};

type DeliveryStatusRow = {
  status: string;
  count: number;
  totalValue: number;
};

type ReminderStatusRow = {
  status: string;
  assignedStaffId: string | null;
  _count: { status: number };
};

type RevisitPerformance = {
  completed: number;
  overdue: number;
  staffWise: Array<{
    assignedStaffId: string | null;
    _count: { assignedStaffId: number };
  }>;
};

export function ReportsPage() {
  const [deliveryReport, setDeliveryReport] = useState<DeliveryProductReportRow[]>([]);
  const [deliverySummary, setDeliverySummary] = useState<DeliveryStatusRow[]>([]);
  const [reminderReport, setReminderReport] = useState<ReminderStatusRow[]>([]);
  const [revisitPerformance, setRevisitPerformance] = useState<RevisitPerformance | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    Promise.all([
      unwrap(api.get<DeliveryProductReportRow[]>("/reports/deliveries")),
      unwrap(api.get<DeliveryStatusRow[]>("/dashboard/delivery-summary")),
      unwrap(api.get<ReminderStatusRow[]>("/reports/reminders")),
      unwrap(api.get<RevisitPerformance>("/reports/revisit-performance")),
      unwrap(api.get<{ data: User[] }>("/users")),
    ]).then(([deliveryProducts, deliveryStatuses, reminderStatuses, revisit, userResponse]) => {
      setDeliveryReport(deliveryProducts);
      setDeliverySummary(deliveryStatuses);
      setReminderReport(reminderStatuses);
      setRevisitPerformance(revisit);
      setUsers(userResponse.data);
    });
  }, []);

  const staffNameMap = useMemo(
    () => Object.fromEntries(users.map((user) => [user.id, user.fullName])),
    [users],
  );

  const deliveredCount = useMemo(
    () => deliverySummary.find((row) => row.status === "DELIVERED")?.count ?? 0,
    [deliverySummary],
  );

  const openDeliveryCount = useMemo(
    () =>
      deliverySummary
        .filter((row) => row.status !== "DELIVERED" && row.status !== "CANCELLED")
        .reduce((sum, row) => sum + row.count, 0),
    [deliverySummary],
  );

  const activeReminderCount = useMemo(
    () =>
      reminderReport
        .filter((row) => ["PENDING", "UPCOMING", "OVERDUE", "SNOOZED"].includes(row.status))
        .reduce((sum, row) => sum + row._count.status, 0),
    [reminderReport],
  );

  const completedReminderCount = revisitPerformance?.completed ?? 0;

  const reminderStatusTable = reminderReport.map((row) => ({
    status: row.status,
    assignedTo: row.assignedStaffId ? staffNameMap[row.assignedStaffId] ?? "Assigned Staff" : "Unassigned",
    count: row._count.status,
  }));

  const staffWorkloadTable =
    revisitPerformance?.staffWise.map((row) => ({
      assignedTo: row.assignedStaffId ? staffNameMap[row.assignedStaffId] ?? "Assigned Staff" : "Unassigned",
      openFollowUps: row._count.assignedStaffId,
    })) ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Delivered Businesses" value={deliveredCount} />
        <StatCard label="Not Yet Delivered" value={openDeliveryCount} />
        <StatCard label="Active Business Reminders" value={activeReminderCount} />
        <StatCard label="Completed Revisits" value={completedReminderCount} />
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Delivery status report</h2>
        <DataTable
          rows={deliverySummary}
          columns={[
            { key: "status", label: "Delivery Status" },
            { key: "count", label: "Business Count" },
            { key: "totalValue", label: "Quoted Value" },
          ]}
        />
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Deliveries by product group and fragrance</h2>
        <DataTable
          rows={deliveryReport}
          columns={[
            { 
              key: "productGroup", 
              label: "Product Group",
              render: (row) => productGroupLabels[row.productGroup] ?? row.productGroup
            },
            { key: "productType", label: "Variant" },
            { key: "count", label: "Count" },
            { key: "totalValue", label: "Total Value" },
          ]}
        />
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Business reminder status report</h2>
        <DataTable
          rows={reminderStatusTable}
          columns={[
            { key: "status", label: "Reminder Status" },
            { key: "assignedTo", label: "Assigned Staff" },
            { key: "count", label: "Count" },
          ]}
        />
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Staff-wise revisit follow-up workload</h2>
        <DataTable
          rows={staffWorkloadTable}
          columns={[
            { key: "assignedTo", label: "Assigned Staff" },
            { key: "openFollowUps", label: "Open Follow-ups" },
          ]}
        />
      </Card>
    </div>
  );
}
