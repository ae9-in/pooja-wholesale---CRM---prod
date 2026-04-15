import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, unwrap } from "../services/api";
import type { Customer, Delivery, User } from "../types";
import { deliveryStatuses, packagingPresets } from "../constants/domain";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { OrderBatchEditor } from "../components/order-batch-editor";

const itemSchema = z.object({
  productGroup: z.string().min(1),
  productType: z.string().optional().nullable(),
  quantity: z.coerce.number().positive(),
  packingSize: z.string().min(1),
  packingQuantity: z.coerce.number().positive(),
  quotedPrice: z.coerce.number().min(0),
  notes: z.string().optional(),
});

const schema = z.object({
  customerId: z.string().min(1),
  quoteDate: z.string().optional(),
  quotedDeliveryDate: z.string().min(1),
  deliveryStatus: z.string().min(1),
  assignedStaffId: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1),
  additionalOrders: z
    .array(
      z.object({
        quoteDate: z.string().optional(),
        quotedDeliveryDate: z.string().min(1),
        deliveryStatus: z.string().min(1),
        notes: z.string().optional(),
        items: z.array(itemSchema).min(1),
      }),
    )
    .optional(),
});

type FormValues = z.infer<typeof schema>;
type FormItem = FormValues["items"][number];
type AdditionalOrder = NonNullable<FormValues["additionalOrders"]>[number];

const defaultItem: FormItem = {
  productGroup: "RAW_AGARBATTI",
  productType: "ROSE",
  quantity: 1,
  packingSize: "1kg",
  packingQuantity: 1,
  quotedPrice: 0,
  notes: "",
};

export function DeliveryFormPage({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const { register, control, handleSubmit, watch, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      deliveryStatus: "QUOTED",
      items: [defaultItem],
      additionalOrders: [],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");

  useEffect(() => {
    unwrap(api.get<{ data: Customer[] }>("/customers")).then((result) => setCustomers(result.data));
    unwrap(api.get<{ data: User[] }>("/users")).then((result) => setStaff(result.data));
    if (mode === "edit" && id) {
      unwrap(api.get<Delivery>(`/deliveries/${id}`)).then((delivery) =>
        reset({
          customerId: delivery.customerId,
          quoteDate: delivery.quoteDate.slice(0, 10),
          quotedDeliveryDate: delivery.quotedDeliveryDate.slice(0, 10),
          deliveryStatus: delivery.deliveryStatus,
          notes: delivery.notes ?? "",
          assignedStaffId: "",
          items: delivery.items.map((item: any) => ({
            productGroup: "POOJA",
            productType: item.productType ?? "SANDALWOOD",
            quantity: item.quantity,
            packingSize: item.packingSize,
            packingQuantity: item.packingQuantity,
            quotedPrice: item.quotedPrice,
            notes: item.notes ?? "",
          })),
          additionalOrders: [],
        } as any),
      );
    }
  }, [id, mode, reset]);

  const total = useMemo(
    () => items?.reduce((sum, item) => sum + item.quantity * item.quotedPrice, 0) ?? 0,
    [items],
  );

  const onSubmit = handleSubmit(async (values) => {
    const { additionalOrders = [], ...baseValues } = values;
    const payload = {
      ...baseValues,
      quoteDate: baseValues.quotedDeliveryDate,
      items: baseValues.items.map((item: FormItem) => ({
        ...item,
        productGroup: "POOJA",
      })),
    };

    if (mode === "create" && additionalOrders.length > 0) {
      await api.post("/deliveries/bulk", {
        orders: [
          {
            customerId: baseValues.customerId,
            quoteDate: baseValues.quoteDate,
            quotedDeliveryDate: baseValues.quotedDeliveryDate,
            deliveryStatus: baseValues.deliveryStatus,
            assignedStaffId: baseValues.assignedStaffId,
            notes: baseValues.notes,
            items: payload.items,
          },
          ...additionalOrders.map((order: AdditionalOrder) => ({
            customerId: baseValues.customerId,
            quoteDate: order.quotedDeliveryDate,
            quotedDeliveryDate: order.quotedDeliveryDate,
            deliveryStatus: order.deliveryStatus,
            assignedStaffId: baseValues.assignedStaffId,
            notes: order.notes,
            items: order.items.map((item: FormItem) => ({
              ...item,
              productGroup: "POOJA",
            })),
          })),
        ],
      });
    } else if (mode === "create") {
      await api.post("/deliveries", payload);
    } else {
      await api.patch(`/deliveries/${id}`, payload);
    }

    navigate("/deliveries");
  });

  return (
    <Card className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{mode === "create" ? "Add Delivery" : "Edit Delivery"}</h2>
          <p className="mt-1 text-sm text-slate-500">Every quoted delivery auto-creates a revisit reminder exactly 15 days later.</p>
        </div>
        <Link to="/reminders" className="text-sm text-brand-700">View reminders</Link>
      </div>
      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Business / Shop</label>
            <Select {...register("customerId")}>
              <option value="">Select business / shop</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.businessName}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned staff</label>
            <Select {...register("assignedStaffId")}>
              <option value="">Assigned staff</option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.fullName}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Service Date</label>
            <Input type="date" {...register("quotedDeliveryDate")} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Delivery Status</label>
            <Select {...register("deliveryStatus")}>
              {deliveryStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </Select>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
            <p className="text-slate-500">Auto total quoted value</p>
            <p className="text-xl font-bold">Rs. {total.toFixed(2)}</p>
          </div>
          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Overall notes</label>
            <Textarea rows={3} placeholder="Overall notes" {...register("notes")} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Order Items</h3>
            <Button type="button" variant="secondary" onClick={() => append(defaultItem)}>+ Add line</Button>
          </div>
          {fields.map((field, index) => {
            const subtotal = (items[index]?.quantity ?? 0) * (items[index]?.quotedPrice ?? 0);
            const selectedGroup = items[index]?.productGroup || "RAW_AGARBATTI";
            const availableProducts = packagingPresets[selectedGroup as keyof typeof packagingPresets]?.products || [];
            const availablePackaging = packagingPresets[selectedGroup as keyof typeof packagingPresets]?.packaging || [];
            
            return (
              <div key={field.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Product Group</label>
                    <Select {...register(`items.${index}.productGroup`)}>
                      <option value="DHOOP">Dhoop</option>
                      <option value="RAW_AGARBATTI">Raw Agarbatti</option>
                      <option value="CAMPHOR">Camphor</option>
                      <option value="COTTON_WICKS">Cotton Wicks</option>
                      <option value="HARSHNA_KUNKUM">Harshna & Kunkum</option>
                      <option value="OIL">Oil</option>
                    </Select>
                  </div>
                  {availableProducts.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Type</label>
                      <Select {...register(`items.${index}.productType`)}>
                        {availableProducts.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </Select>
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quantity</label>
                    <Select {...register(`items.${index}.packingSize`)}>
                      {availablePackaging.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">No. of Packets</label>
                    <Input type="number" step="1" min="1" placeholder="1" {...register(`items.${index}.quantity`)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price / packet (₹)</label>
                    <Input type="number" step="0.01" min="0" placeholder="0.00" {...register(`items.${index}.quotedPrice`)} />
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-xl bg-white border border-slate-200 px-3 py-2 shadow-sm">
                    <p className="text-[10px] uppercase font-semibold text-slate-400">Subtotal</p>
                    <p className="font-bold text-slate-700">₹ {subtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex items-end">
                    <Button type="button" variant="danger" className="w-full" onClick={() => remove(index)}>Remove</Button>
                  </div>
                  <div className="md:col-span-2 xl:col-span-4 flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 text-slate-400 font-normal">
                      Notes (If any other items need, write here)
                    </label>
                    <Textarea
                      rows={3}
                      placeholder={"Write other item details here..."}
                      {...register(`items.${index}.notes`)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button>{mode === "create" ? "Create delivery" : "Save delivery"}</Button>
        </div>

        {mode === "create" ? (
          <OrderBatchEditor
            control={control as any}
            register={register as any}
            name="additionalOrders"
            title="Optional additional orders for the same shop"
          />
        ) : null}
      </form>
    </Card>
  );
}
