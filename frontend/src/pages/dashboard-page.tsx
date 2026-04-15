import { useEffect, useState } from "react";
import { api, unwrap } from "../services/api";
import type { DashboardSummary } from "../types";
import { StatCard } from "../components/stat-card";
import { Card } from "../components/ui/card";
import { DataTable } from "../components/data-table";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line } from "recharts";

export function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    const fetchDashboard = () => unwrap(api.get<DashboardSummary>("/dashboard/summary")).then(setData);
    
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return <div className="text-sm text-slate-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card-grid">
        <StatCard label="Total Businesses / Shops" value={data.metrics.totalCustomers} />
        <StatCard label="Quoted Deliveries" value={data.metrics.quotedDeliveries} />
        <StatCard label="Upcoming Revisits" value={data.metrics.upcomingReminders} />
        <StatCard label="Overdue Revisits" value={data.metrics.overdueReminders} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Monthly delivery and revisit trend</h2>
          <div className="h-80">
            <ResponsiveContainer>
              <LineChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="deliveries" stroke="#2f6b57" strokeWidth={3} />
                <Line type="monotone" dataKey="revisitsDone" stroke="#d97706" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Business / shop status mix</h2>
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={data.statusBreakdown.map((item) => ({ status: item.status, count: item._count.status }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2f6b57" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Recent businesses / shops</h2>
          <DataTable
            rows={data.recentCustomers}
            columns={[
              { key: "businessName", label: "Business / Shop" },
              { key: "city", label: "City" },
              { key: "status", label: "Status" },
            ]}
          />
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Recent delivery activity</h2>
          <div className="space-y-3">
            {data.recentDeliveryActivity.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="font-medium text-ink">{item.message}</p>
                <p className="mt-1 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
