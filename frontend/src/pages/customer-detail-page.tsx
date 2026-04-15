import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, unwrap } from "../services/api";
import type { Customer } from "../types";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

type CustomerDetail = Customer & {
  notes: Array<{ id: string; content: string; noteType: string; createdAt: string; author: { fullName: string } }>;
  deliveries: Array<{ id: string; deliveryStatus: string; totalQuotedValue: number; quotedDeliveryDate: string }>;
  reminders: Array<{ id: string; title: string; status: string; reminderDate: string }>;
};

export function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      unwrap(api.get<CustomerDetail>(`/customers/${id}`))
        .then(setCustomer)
        .catch((error) => {
          console.error("Failed to load customer:", error);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <div className="text-sm text-slate-500">Loading business / shop...</div>;
  }

  if (!customer) {
    return <div className="text-sm text-slate-500">Business / shop not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Link to={`/customers/${customer.id}/edit`}><Button variant="secondary">Edit business / shop</Button></Link>
        <Link to="/deliveries/new"><Button>Add quoted delivery</Button></Link>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{customer.businessName}</h2>
              <p className="mt-1 text-slate-500">{customer.ownerName}</p>
            </div>
            <Badge value={customer.status} />
          </div>
          <div className="mt-5 grid gap-3 text-sm text-slate-600">
            <p>{customer.phoneNumber1}</p>
            <p>{customer.email}</p>
            <p>{customer.addressLine1}, {customer.area}, {customer.city}</p>
            <p>Assigned: {customer.assignedStaff?.fullName ?? "Unassigned"}</p>
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 text-lg font-semibold">Related reminders</h3>
          <div className="space-y-3">
            {customer.reminders.length === 0 ? (
              <p className="text-center text-slate-500 py-4">No reminders</p>
            ) : (
              customer.reminders.map((reminder) => (
                <div key={reminder.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{reminder.title}</p>
                    <Badge value={reminder.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{new Date(reminder.reminderDate).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-lg font-semibold">Deliveries</h3>
          <div className="space-y-3">
            {customer.deliveries.length === 0 ? (
              <p className="text-center text-slate-500 py-4">No deliveries yet</p>
            ) : (
              customer.deliveries.map((delivery) => (
                <Link key={delivery.id} to={`/deliveries/${delivery.id}`} className="block rounded-xl border border-slate-100 p-4 hover:border-brand-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{delivery.id.slice(0, 8)}...</p>
                    <Badge value={delivery.deliveryStatus} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Delivery date: {new Date(delivery.quotedDeliveryDate).toLocaleDateString()} | Value: Rs. {delivery.totalQuotedValue}
                  </p>
                </Link>
              ))
            )}
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 text-lg font-semibold">Notes timeline</h3>
          <div className="space-y-3">
            {customer.notes.length === 0 ? (
              <p className="text-center text-slate-500 py-4">No notes yet</p>
            ) : (
              customer.notes.map((note) => (
                <div key={note.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <Badge value={note.noteType} />
                    <span className="text-xs text-slate-400">{new Date(note.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-sm">{note.content}</p>
                  <p className="mt-2 text-xs text-slate-500">{note.author.fullName}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
