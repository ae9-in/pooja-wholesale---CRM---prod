import { z } from "zod";

const deliveryStatusValues = ["QUOTED", "CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"] as const;
const productTypeValues = ["ROSE", "SANDALWOOD", "LAVENDER", "THREE_IN_ONE", "STANDARD"] as const;
const productGroupValues = ["DHOOP", "RAW_AGARBATTI", "CAMPHOR", "COTTON_WICKS", "HARSHNA_KUNKUM", "OIL"] as const;

const productTypeSchema = z.enum(productTypeValues);
const productGroupSchema = z.enum(productGroupValues);
const deliveryStatusSchema = z.enum(deliveryStatusValues);

export const deliveryItemSchema = z
  .object({
    id: z.string().optional(),
    productGroup: productGroupSchema,
    productType: productTypeSchema.optional().nullable(),
    quantity: z.coerce.number().int().positive(),
    packingSize: z.string().min(1),
    packingQuantity: z.coerce.number().int().positive(),
    quotedPrice: z.coerce.number().min(0),
    subtotal: z.coerce.number().min(0).optional(),
    notes: z.string().optional(),
  });

export const deliveryBodySchema = z.object({
  customerId: z.string().min(1),
  quoteDate: z.string().or(z.date()),
  quotedDeliveryDate: z.string().or(z.date()),
  deliveryStatus: deliveryStatusSchema,
  notes: z.string().optional(),
  assignedStaffId: z.string().optional().nullable(),
  items: z.array(deliveryItemSchema).min(1),
});

export const deliveryCreateSchema = z.object({
  body: deliveryBodySchema,
});

export const deliveryBulkCreateSchema = z.object({
  body: z.object({
    orders: z.array(deliveryBodySchema).min(1),
  }),
});

export const deliveryUpdateSchema = z.object({
  body: deliveryBodySchema.partial().extend({
    items: z.array(deliveryItemSchema).min(1).optional(),
  }),
});

export const deliveryItemCreateSchema = z.object({
  body: deliveryItemSchema,
});
