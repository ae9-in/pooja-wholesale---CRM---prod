import { useFieldArray } from "react-hook-form";
import type { Control, UseFormRegister } from "react-hook-form";
import { deliveryStatuses } from "../constants/domain";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";

type Props = {
  control: Control<any>;
  register: UseFormRegister<any>;
  name: string;
  title: string;
  sameCustomerOnly?: boolean;
};

// Pooja Kit is the only product — always POOJA
const POOJA_FRAGRANCES = ["SANDALWOOD", "ROSE", "LAVENDER", "THREE_IN_ONE"] as const;
const POOJA_PACK_SIZES = [
  "Plastic Covers - 1kg",
  "Plastic Covers - 1/2kg",
  "Plastic Covers - 250 gm",
  "Bottle - 100gm",
] as const;

const defaultItem = {
  productGroup: "POOJA",
  productType: "SANDALWOOD",
  quantity: 1,
  packingSize: "Plastic Covers - 1kg",
  packingQuantity: 1,
  quotedPrice: 0,
  notes: "",
};

const defaultOrder = {
  quoteDate: new Date().toISOString().split("T")[0],
  quotedDeliveryDate: "",
  deliveryStatus: "QUOTED",
  notes: "",
  items: [defaultItem],
};

function PoojaItemRow({
  base,
  register,
  onRemove,
}: {
  base: string;
  register: UseFormRegister<any>;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">

        {/* Fragrance / Variant */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fragrance</label>
          <Select {...register(`${base}.productType`)}>
            {POOJA_FRAGRANCES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </Select>
        </div>

        {/* Pack Size */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pack Size</label>
          <Select {...register(`${base}.packingSize`)}>
            {POOJA_PACK_SIZES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
        </div>

        {/* Quantity */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Qty (1 Packet)</label>
          <Input type="number" step="1" min="1" placeholder="1" {...register(`${base}.quantity`)} />
        </div>

        {/* Price */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price per pack (₹)</label>
          <Input type="number" step="0.01" min="0" placeholder="0.00" {...register(`${base}.quotedPrice`)} />
        </div>

        {/* Items needed notes — full row */}
        <div className="flex flex-col gap-1 md:col-span-2 xl:col-span-4">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 text-slate-400 font-normal">
            Notes (If any other items need, write here)
          </label>
          <Textarea
            rows={3}
            placeholder={"Write other item details here..."}
            {...register(`${base}.notes`)}
          />
        </div>
      </div>

      <div className="mt-3">
        <Button type="button" variant="danger" onClick={onRemove}>
          Remove line
        </Button>
      </div>
    </div>
  );
}

function PoojaItemsEditor({
  control,
  register,
  name,
}: {
  control: Control<any>;
  register: UseFormRegister<any>;
  name: string;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${name}.items` as never,
  });

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <PoojaItemRow
          key={field.id}
          base={`${name}.items.${index}`}
          register={register}
          onRemove={() => remove(index)}
        />
      ))}
      <Button type="button" variant="secondary" onClick={() => append(defaultItem as never)}>
        + Add fragrance line
      </Button>
    </div>
  );
}

export function OrderBatchEditor({ control, register, name, title }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as never,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button type="button" variant="secondary" onClick={() => append(defaultOrder as never)}>
          + Add order
        </Button>
      </div>

      {fields.map((field, index) => {
        const base = `${name}.${index}`;
        return (
          <div key={field.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
            {/* Order header */}
            <div className="mb-4 grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quote Date</label>
                <Input type="date" {...register(`${base}.quoteDate`)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Delivery Date</label>
                <Input type="date" {...register(`${base}.quotedDeliveryDate`)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
                <Select {...register(`${base}.deliveryStatus`)}>
                  {deliveryStatuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order Notes</label>
                <Input
                  placeholder="Payment terms, special requests..."
                  {...register(`${base}.notes`)}
                />
              </div>
            </div>

            {/* Pooja Kit lines */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-brand-100 px-3 py-0.5 text-xs font-bold text-brand-700">
                  🪔 Pooja Kit
                </span>
                <span className="text-xs text-slate-400">Add one line per fragrance / pack size</span>
              </div>
              <PoojaItemsEditor control={control} register={register} name={base} />
            </div>

            <div className="mt-4">
              <Button type="button" variant="danger" onClick={() => remove(index)}>
                Remove order
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
