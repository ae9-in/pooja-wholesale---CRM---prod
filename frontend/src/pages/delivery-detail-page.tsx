import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, unwrap } from "../services/api";
import type { Delivery } from "../types";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export function DeliveryDetailPage() {
  const { id } = useParams();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      unwrap<{ data: Delivery }>(api.get(`/deliveries/${id}`))
        .then((response) => setDelivery(response.data))
        .catch((error) => {
          console.error("Failed to load delivery:", error);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);


  const handleStatusChange = async (newStatus: string) => {
    if (!delivery) return;
    try {
      setIsUpdatingStatus(true);
      const updated = await unwrap<{ data: Delivery }>(
        api.patch(`/deliveries/${delivery.id}`, { deliveryStatus: newStatus }),
      );
      setDelivery(updated.data);
    } catch (e) {
      console.error('Failed to update status', e);
      alert('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-slate-500">Loading delivery...</div>;
  }

  if (!delivery) {
    return <div className="text-sm text-slate-500">Delivery not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <Link to={`/deliveries/${delivery.id}/edit`}><Button variant="secondary">Edit delivery</Button></Link>
        {delivery.billFileUrl ? <a href={delivery.billFileUrl} target="_blank" rel="noreferrer"><Button>Open bill</Button></a> : null}
      </div>
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{delivery.customer?.businessName ?? delivery.id}</h2>
            <p className="mt-1 text-sm text-slate-500">Quoted delivery on {new Date(delivery.quotedDeliveryDate).toLocaleDateString()}</p>
          </div>
          <select 
              value={delivery.deliveryStatus}
              disabled={isUpdatingStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="rounded-md border border-slate-300 py-1 pl-3 pr-8 text-sm font-semibold focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
            >
              <option value="QUOTED">QUOTED</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="DISPATCHED">DISPATCHED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="NOT_DELIVERED">NOT DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="REVISIT_DUE">REVISIT DUE</option>
              <option value="OVERDUE">OVERDUE</option>
            </select>
        </div>
        <p className="mt-4 text-sm text-slate-600">{delivery.notes}</p>
      </Card>
      <Card>
        <h3 className="mb-3 text-lg font-semibold">Products</h3>
        <div className="space-y-3">
          {delivery.items.map((item, index) => (
            <div key={item.id ?? index} className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{item.productGroup} {item.productType ? `- ${item.productType}` : ""}</p>
                <p className="font-semibold">Rs. {(item.subtotal ?? item.quantity * item.quotedPrice).toFixed(2)}</p>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Qty {item.quantity} | Pack {item.packingSize} | Pack count {item.packingQuantity} | Unit Rs. {item.quotedPrice}
              </p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="mb-3 text-lg font-semibold">Linked revisit reminders</h3>
        <div className="space-y-3">
          {!delivery.reminders || delivery.reminders.length === 0 ? (
            <p className="text-center text-slate-500 py-4">No reminders</p>
          ) : (
            delivery.reminders.map((reminder) => (
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
  );
}
