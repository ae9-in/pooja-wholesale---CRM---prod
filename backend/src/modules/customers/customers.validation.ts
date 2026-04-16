import { z } from "zod";

const customerPriorityValues = ["LOW", "MEDIUM", "HIGH"] as const;
const customerStatusValues = [
  "NEW",
  "CONTACTED",
  "QUOTED",
  "DELIVERY_PENDING",
  "DELIVERED",
  "REVISIT_REQUIRED",
  "FOLLOW_UP_REQUIRED",
  "INACTIVE",
] as const;
const deliveryStatusValues = ["QUOTED", "CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"] as const;
const productTypeValues = ["ROSE", "SANDALWOOD", "LAVENDER", "THREE_IN_ONE", "STANDARD"] as const;
const noteTypeValues = ["GENERAL", "DELIVERY", "REVISIT", "FOLLOW_UP"] as const;
const productGroupValues = ["DHOOP", "RAW_AGARBATTI", "CAMPHOR", "COTTON_WICKS", "HARSHNA_KUNKUM", "OIL"] as const;

const customerPrioritySchema = z.enum(customerPriorityValues);
const customerStatusSchemaEnum = z.enum(customerStatusValues);
const deliveryStatusSchemaEnum = z.enum(deliveryStatusValues);
const productTypeSchema = z.enum(productTypeValues);
const noteTypeSchema = z.enum(noteTypeValues);
const productGroupSchema = z.enum(productGroupValues);

export const customerBodySchema = z.object({
  businessName: z.string().min(2),
  ownerName: z.string().min(2),
  phoneNumber1: z.string().min(8),
  phoneNumber2: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  addressLine1: z.string().min(2),
  addressLine2: z.string().optional(),
  area: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(4),
  description: z.string().optional(),
  businessType: z.string().min(2),
  assignedStaffId: z.string().optional().nullable(),
  status: customerStatusSchemaEnum.default("NEW"),
  priority: customerPrioritySchema.default("MEDIUM"),
  source: z.string().optional(),
});

const initialOrderItemSchema = z.object({
  productGroup: productGroupSchema,
  productType: productTypeSchema.optional().nullable(),
  quantity: z.coerce.number().int().positive(),
  packingSize: z.string().min(1),
  packingQuantity: z.coerce.number().int().positive(),
  quotedPrice: z.coerce.number().positive(),
  notes: z.string().optional(),
});

const initialOrderSchema = z.object({
  quoteDate: z.string().or(z.date()),
  quotedDeliveryDate: z.string().or(z.date()),
  deliveryStatus: deliveryStatusSchemaEnum,
  notes: z.string().optional(),
  assignedStaffId: z.string().optional().nullable(),
  items: z.array(initialOrderItemSchema).min(1),
});

export const customerCreateSchema = z.object({
  body: customerBodySchema.extend({
    initialOrders: z.array(initialOrderSchema).optional(),
  }),
});

export const customerUpdateSchema = z.object({
  body: customerBodySchema.partial(),
});

export const customerStatusSchema = z.object({
  body: z.object({
    status: customerStatusSchemaEnum,
  }),
});

export const customerNoteSchema = z.object({
  body: z.object({
    content: z.string().min(2),
    deliveryId: z.string().optional(),
    noteType: noteTypeSchema.default("GENERAL"),
  }),
});
