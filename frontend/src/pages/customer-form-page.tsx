import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { api, unwrap } from "../services/api";
import { customerStatuses } from "../constants/domain";
import type { User } from "../types";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { OrderBatchEditor } from "../components/order-batch-editor";
import { ZonePlacePicker } from "../components/ui/zone-place-picker";

const schema = z.object({
  businessName: z.string().min(2),
  ownerName: z.string().min(2),
  phoneNumber1: z.string().min(8),
  phoneNumber2: z.string().optional(),
  email: z.string().optional(),
  addressLine1: z.string().min(2),
  addressLine2: z.string().optional(),
  area: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(2),
  pincode: z.string().min(4),
  businessType: z.string().min(2),
  status: z.string(),
  priority: z.string(),
  source: z.string().optional(),
  description: z.string().optional(),
  assignedStaffId: z.string().optional(),
  initialOrders: z
    .array(
      z.object({
        quoteDate: z.string().min(1),
        quotedDeliveryDate: z.string().min(1),
        deliveryStatus: z.string().min(1),
        notes: z.string().optional(),
        items: z.array(
          z.object({
            productGroup: z.string(),
            productType: z.string().optional().nullable(),
            quantity: z.coerce.number().positive(),
            packingSize: z.string().min(1),
            packingQuantity: z.coerce.number().positive(),
            quotedPrice: z.coerce.number().positive(),
            notes: z.string().optional(),
          }),
        ),
      }),
    )
    .optional(),
});

type Values = z.infer<typeof schema>;

export function CustomerFormPage({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<User[]>([]);
  const { register, handleSubmit, reset, control, setValue, watch } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { status: "NEW", priority: "MEDIUM", initialOrders: [] },
  });

  // Track zone/place as a controlled pair
  const city = watch("city");
  const area = watch("area");
  const [zonePlace, setZonePlace] = useState({ zone: city ?? "", place: area ?? "" });

  // Sync ZonePlacePicker → form fields
  const handleZonePlaceChange = (val: { zone: string; place: string }) => {
    setZonePlace(val);
    setValue("city", val.zone, { shouldValidate: true });
    setValue("area", val.place, { shouldValidate: true });
  };

  useEffect(() => {
    unwrap(api.get<{ data: User[] }>("/users")).then((result) => setStaff(result.data));
    if (mode === "edit" && id) {
      unwrap(api.get<Values>(`/customers/${id}`)).then((customer) => {
        reset(customer);
        setZonePlace({ zone: (customer as any).city ?? "", place: (customer as any).area ?? "" });
      });
    }
  }, [id, mode, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const { initialOrders = [], ...customerPayload } = values;
    if (mode === "create") {
      await api.post("/customers", { ...customerPayload, initialOrders });
    } else {
      await api.patch(`/customers/${id}`, customerPayload);
    }
    navigate("/customers");
  });

  return (
    <Card>
      <h2 className="mb-5 text-xl font-semibold">
        {mode === "create" ? "Add Business / Shop" : "Edit Business / Shop"}
      </h2>
      <form className="space-y-5" onSubmit={onSubmit}>

        {/* Basic info — 2 column grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Business / shop name" {...register("businessName")} />
          <Input placeholder="Owner name" {...register("ownerName")} />
          <Input placeholder="Phone number 1" {...register("phoneNumber1")} />
          <Input placeholder="Phone number 2" {...register("phoneNumber2")} />
          <Input placeholder="Email" {...register("email")} />
          <Input placeholder="Business type" {...register("businessType")} />
          <Input placeholder="Address line 1" {...register("addressLine1")} />
          <Input placeholder="Address line 2" {...register("addressLine2")} />
          <Input placeholder="State" {...register("state")} />
          <Input placeholder="Pincode" {...register("pincode")} />
          <Select {...register("status")}>
            {customerStatuses.map((s) => <option key={s}>{s}</option>)}
          </Select>
          <Select {...register("priority")}>
            <option>LOW</option>
            <option>MEDIUM</option>
            <option>HIGH</option>
          </Select>
          <Select {...register("assignedStaffId")}>
            <option value="">Unassigned</option>
            {staff.map((user) => <option key={user.id} value={user.id}>{user.fullName}</option>)}
          </Select>
          <Input placeholder="Source" {...register("source")} />
          <div className="md:col-span-2">
            <Textarea rows={3} placeholder="Description or notes" {...register("description")} />
          </div>
        </div>

        {/* Zone / Place picker — accordion */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Area / Location
            {zonePlace.zone && (
              <span className="ml-2 font-normal normal-case text-slate-400">
                — {zonePlace.place ? `${zonePlace.zone} → ${zonePlace.place}` : `${zonePlace.zone} (pick a place)`}
              </span>
            )}
          </p>
          <ZonePlacePicker value={zonePlace} onChange={handleZonePlaceChange} />
          {/* Hidden inputs to keep react-hook-form in sync */}
          <input type="hidden" {...register("city")} />
          <input type="hidden" {...register("area")} />
        </div>

        {/* Initial orders */}
        <div>
          <OrderBatchEditor
            control={control as any}
            register={register as any}
            name="initialOrders"
            title="Optional initial orders for this shop"
          />
        </div>

        <div>
          <Button>{mode === "create" ? "Create Business / Shop" : "Save Changes"}</Button>
        </div>
      </form>
    </Card>
  );
}
