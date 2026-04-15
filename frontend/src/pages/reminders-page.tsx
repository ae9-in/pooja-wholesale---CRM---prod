import { useEffect, useState } from "react";
import { api, unwrap } from "../services/api";
import type { Reminder } from "../types";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

const tabs = [
  { label: "Today", params: { upcomingOnly: true } },
  { label: "Upcoming", params: { upcomingOnly: true } },
  { label: "Overdue", params: { overdueOnly: true } },
  { label: "Completed", params: { doneOnly: true } },
  { label: "Snoozed", params: { status: "SNOOZED" } },
] as const;

export function RemindersPage() {
  const [rows, setRows] = useState<Reminder[]>([]);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>(tabs[1]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        setLoading(true);
        const result = await unwrap(api.get<{ data: Reminder[] }>("/reminders", { params: activeTab.params }));
        setRows(result.data);
      } catch (error) {
        console.error("Failed to fetch reminders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
    // Poll every 60 seconds for real-time updates
    const interval = setInterval(fetchReminders, 60000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const markComplete = async (id: string) => {
    try {
      await api.patch(`/reminders/${id}/complete`, { completionNote: "Completed from dashboard" });
      setRows((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to mark reminder complete:", error);
    }
  };

  const snoozeReminder = async (id: string) => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await api.patch(`/reminders/${id}/snooze`, { snoozedUntil: tomorrow.toISOString() });
      setRows((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to snooze reminder:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reminders</h1>
        {loading && <span className="text-sm text-slate-500">Updating...</span>}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button key={tab.label} variant={tab.label === activeTab.label ? "primary" : "secondary"} onClick={() => setActiveTab(tab)}>
            {tab.label}
          </Button>
        ))}
      </div>
      
      {rows.length === 0 ? (
        <Card>
          <p className="text-center text-slate-500 py-8">No reminders found</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rows.map((reminder) => (
            <Card key={reminder.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{reminder.customer?.businessName ?? reminder.title}</h3>
                    <Badge value={reminder.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{reminder.title}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Reminder date: {new Date(reminder.reminderDate).toLocaleDateString()} | Assigned: {reminder.assignedStaff?.fullName ?? "Unassigned"}
                  </p>
                  {reminder.description && <p className="mt-1 text-sm text-slate-600">{reminder.description}</p>}
                  {reminder.completionNote && <p className="mt-2 text-sm text-emerald-700">✓ {reminder.completionNote}</p>}
                </div>
                <div className="flex gap-2">
                  {reminder.status !== "DONE" && reminder.status !== "CANCELLED" && (
                    <>
                      <Button variant="secondary" onClick={() => snoozeReminder(reminder.id)}>Snooze</Button>
                      <Button onClick={() => markComplete(reminder.id)}>Mark complete</Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
