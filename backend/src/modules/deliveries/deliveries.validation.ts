import { DeliveryStatus, ProductType, ProductGroup } from "@prisma/client";
import { z } from "zod";

const productTypeSchema = z.nativeEnum(ProductType);

export const deliveryItemSchema = z
  .object({
    id: z.string().optional(),
    productGroup: z.nativeEnum(ProductGroup),
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
  deliveryStatus: z.nativeEnum(DeliveryStatus),
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
