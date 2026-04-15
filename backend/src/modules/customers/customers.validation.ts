import { CustomerPriority, CustomerStatus, DeliveryStatus, ProductType, NoteType, ProductGroup } from "@prisma/client";
import { z } from "zod";

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
  status: z.nativeEnum(CustomerStatus).default(CustomerStatus.NEW),
  priority: z.nativeEnum(CustomerPriority).default(CustomerPriority.MEDIUM),
  source: z.string().optional(),
});

const initialOrderItemSchema = z.object({
  productGroup: z.nativeEnum(ProductGroup),
  productType: z.nativeEnum(ProductType).optional().nullable(),
  quantity: z.coerce.number().int().positive(),
  packingSize: z.string().min(1),
  packingQuantity: z.coerce.number().int().positive(),
  quotedPrice: z.coerce.number().positive(),
  notes: z.string().optional(),
});

const initialOrderSchema = z.object({
  quoteDate: z.string().or(z.date()),
  quotedDeliveryDate: z.string().or(z.date()),
  deliveryStatus: z.nativeEnum(DeliveryStatus),
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
    status: z.nativeEnum(CustomerStatus),
  }),
});

export const customerNoteSchema = z.object({
  body: z.object({
    content: z.string().min(2),
    deliveryId: z.string().optional(),
    noteType: z.nativeEnum(NoteType).default(NoteType.GENERAL),
  }),
});
