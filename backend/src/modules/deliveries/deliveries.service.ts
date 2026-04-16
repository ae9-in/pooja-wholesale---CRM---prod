import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";
import { createPaginationMeta, getPagination } from "../../utils/pagination.js";
import { logActivity } from "../activity/activity.service.js";
import { syncRevisitReminderForDelivery } from "../reminders/reminders.service.js";
import { removeUploadedFile } from "../uploads/upload.service.js";
import { productPackagingPresets } from "./delivery.constants.js";

type DeliveryStatusValue = "QUOTED" | "CONFIRMED" | "DISPATCHED" | "DELIVERED" | "CANCELLED";
type ProductGroupValue = "DHOOP" | "RAW_AGARBATTI" | "CAMPHOR" | "COTTON_WICKS" | "HARSHNA_KUNKUM" | "OIL";
type ProductTypeValue = "ROSE" | "SANDALWOOD" | "LAVENDER" | "THREE_IN_ONE" | "STANDARD";
type ReminderTypeValue = "WHOLESALE_REVISIT_15_DAY";
type DeliveryItemRow = {
  productGroup: ProductGroupValue;
  productType: ProductTypeValue | null;
  quantity: number;
  packingSize: string;
  packingQuantity: number;
  quotedPrice: number | string;
};

export type DeliveryItemInput = {
  id?: string;
  productGroup: ProductGroupValue;
  productType?: ProductTypeValue | null;
  quantity: number;
  packingSize: string;
  packingQuantity: number;
  quotedPrice: number;
  subtotal?: number;
  notes?: string;
};

export type DeliveryCreateInput = {
  customerId: string;
  quoteDate: string | Date;
  quotedDeliveryDate: string | Date;
  deliveryStatus: DeliveryStatusValue;
  notes?: string;
  assignedStaffId?: string | null;
  items: DeliveryItemInput[];
};

export function calculateItemSubtotal(item: DeliveryItemInput) {
  return Number((item.quantity * item.quotedPrice).toFixed(2));
}

export function calculateDeliveryTotal(items: DeliveryItemInput[]) {
  return Number(items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0).toFixed(2));
}

function assertPackingAllowed(item: DeliveryItemInput) {
  const preset = productPackagingPresets[item.productGroup];
  if (!(preset.packaging as readonly string[]).includes(item.packingSize)) {
    throw new AppError(`Packing size ${item.packingSize} is not allowed for ${item.productGroup}`, 400);
  }
}

function assertVariantAllowed(item: DeliveryItemInput) {
  const preset = productPackagingPresets[item.productGroup];
  const requiresVariant = preset.products.length > 0;

  if (requiresVariant && !item.productType) {
    throw new AppError(`Variant is required for ${item.productGroup}`, 400);
  }

  if (!requiresVariant && item.productType) {
    throw new AppError(`Variant is not allowed for ${item.productGroup}`, 400);
  }
}

function buildWhere(query: Record<string, string>, user?: Express.UserPayload) {
  const and: Array<Record<string, unknown>> = [];

  if (user?.role === "STAFF") {
    and.push({ assignedStaffId: user.id });
  }

  if (query.customerId) and.push({ customerId: query.customerId });
  if (query.deliveryStatus) and.push({ deliveryStatus: query.deliveryStatus as DeliveryStatusValue });
  if (query.assignedStaffId) and.push({ assignedStaffId: query.assignedStaffId });
  if (query.quotedDateFrom || query.quotedDateTo) {
    and.push({
      quoteDate: {
        gte: query.quotedDateFrom ? new Date(query.quotedDateFrom) : undefined,
        lte: query.quotedDateTo ? new Date(query.quotedDateTo) : undefined,
      },
    });
  }
  if (query.quotedDeliveryDateFrom || query.quotedDeliveryDateTo) {
    and.push({
      quotedDeliveryDate: {
        gte: query.quotedDeliveryDateFrom ? new Date(query.quotedDeliveryDateFrom) : undefined,
        lte: query.quotedDeliveryDateTo ? new Date(query.quotedDeliveryDateTo) : undefined,
      },
    });
  }
  if (query.productGroup) {
    and.push({
      items: {
        some: {
          productGroup: query.productGroup as DeliveryItemInput["productGroup"],
        },
      },
    });
  }

  return and.length ? { AND: and } : {};
}

export const deliveriesService = {
  async list(query: Record<string, string>, user?: Express.UserPayload) {
    const { page, limit, skip } = getPagination(Number(query.page), Number(query.limit));
    const where = buildWhere(query, user);
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

    const [total, data] = await Promise.all([
      prisma.delivery.count({ where }),
      prisma.delivery.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: true,
          assignedStaff: { select: { id: true, fullName: true } },
          items: true,
          reminders: true,
        },
      }),
    ]);

    return { data, meta: createPaginationMeta(total, page, limit) };
  },

  async create(input: DeliveryCreateInput, actorId: string) {
    input.items.forEach((item) => {
      assertPackingAllowed(item);
      assertVariantAllowed(item);
    });
    const totalQuotedValue = calculateDeliveryTotal(input.items);

    const delivery = await prisma.$transaction(async (tx: any) => {
      const created = await tx.delivery.create({
        data: {
          customerId: input.customerId,
          quoteDate: new Date(input.quoteDate),
          quotedDeliveryDate: new Date(input.quotedDeliveryDate),
          deliveryStatus: input.deliveryStatus,
          notes: input.notes,
          assignedStaffId: input.assignedStaffId,
          createdById: actorId,
          totalQuotedValue,
          items: {
            create: input.items.map((item) => ({
              productGroup: item.productGroup,
              productType: item.productType ?? null,
              quantity: item.quantity,
              packingSize: item.packingSize,
              packingQuantity: item.packingQuantity,
              quotedPrice: item.quotedPrice,
              subtotal: calculateItemSubtotal(item),
              notes: item.notes,
            })),
          },
        },
        include: {
          customer: true,
          items: true,
        },
      });

      await syncRevisitReminderForDelivery(created, tx);
      return created;
    });

    await logActivity({
      entityType: "DELIVERY",
      entityId: delivery.id,
      action: "CREATED",
      message: `Delivery created for ${(delivery as any).customer.businessName}`,
      actorId,
      metadata: { totalQuotedValue },
    });

    return this.getById(delivery.id);
  },

  async createMany(inputs: DeliveryCreateInput[], actorId: string) {
    const results = [] as Awaited<ReturnType<typeof deliveriesService.getById>>[];

    for (const input of inputs) {
      const created = await this.create(input, actorId);
      results.push(created);
    }

    return results;
  },

  async getById(id: string) {
    return prisma.delivery.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            businessName: true,
            ownerName: true,
            phoneNumber1: true,
          },
        },
        assignedStaff: { select: { id: true, fullName: true } },
        items: true,
        reminders: {
          select: {
            id: true,
            title: true,
            status: true,
            reminderDate: true,
          },
          orderBy: { reminderDate: "asc" },
          take: 5, // Limit to 5 reminders
        },
      },
    });
  },

  async update(
    id: string,
    input: Partial<{
      customerId: string;
      quoteDate: string | Date;
      quotedDeliveryDate: string | Date;
      deliveryStatus: DeliveryStatusValue;
      notes?: string;
      assignedStaffId?: string | null;
      items: DeliveryItemInput[];
    }>,
    actorId: string,
  ) {
    if (input.items) {
      input.items.forEach(assertPackingAllowed);
      input.items.forEach(assertVariantAllowed);
    }

    const existing = await prisma.delivery.findUnique({
      where: { id },
      include: { customer: true, items: true },
    });

    if (!existing) {
      throw new AppError("Delivery not found", StatusCodes.NOT_FOUND);
    }

    const items = input.items ?? existing.items.map((item: any) => ({
      id: item.id,
      productGroup: item.productGroup,
      productType: item.productType,
      quantity: item.quantity,
      packingSize: item.packingSize,
      packingQuantity: item.packingQuantity,
      quotedPrice: Number(item.quotedPrice),
      subtotal: Number(item.subtotal),
      notes: item.notes ?? undefined,
    }));
    const totalQuotedValue = calculateDeliveryTotal(items);

    await prisma.$transaction(async (tx: any) => {
      await tx.delivery.update({
        where: { id },
        data: {
          customerId: input.customerId ?? existing.customerId,
          quoteDate: input.quoteDate ? new Date(input.quoteDate) : undefined,
          quotedDeliveryDate: input.quotedDeliveryDate ? new Date(input.quotedDeliveryDate) : undefined,
          deliveryStatus: input.deliveryStatus,
          notes: input.notes,
          assignedStaffId: input.assignedStaffId,
          totalQuotedValue,
        },
      });

      if (input.items) {
        await tx.deliveryItem.deleteMany({ where: { deliveryId: id } });
        await tx.deliveryItem.createMany({
          data: input.items.map((item) => ({
            deliveryId: id,
            productGroup: item.productGroup,
            productType: item.productType ?? null,
            quantity: item.quantity,
            packingSize: item.packingSize,
            packingQuantity: item.packingQuantity,
            quotedPrice: item.quotedPrice,
            subtotal: calculateItemSubtotal(item),
            notes: item.notes,
          })),
        });
      }

      const updatedDelivery = await tx.delivery.findUniqueOrThrow({
        where: { id },
        include: { customer: true },
      });

      await syncRevisitReminderForDelivery(updatedDelivery, tx);
    });

    await logActivity({
      entityType: "DELIVERY",
      entityId: id,
      action: "UPDATED",
      message: `Delivery ${id} updated`,
      actorId,
      metadata: { reminderType: "WHOLESALE_REVISIT_15_DAY" as ReminderTypeValue },
    });

    return this.getById(id);
  },

  async remove(id: string, actorId: string) {
    await prisma.delivery.delete({ where: { id } });
    await logActivity({
      entityType: "DELIVERY",
      entityId: id,
      action: "DELETED",
      message: `Delivery ${id} deleted`,
      actorId,
    });
    return { success: true };
  },

  async addItem(deliveryId: string, item: DeliveryItemInput, actorId: string) {
    assertPackingAllowed(item);
    await prisma.deliveryItem.create({
      data: {
        deliveryId,
        productGroup: item.productGroup,
        productType: item.productType ?? null,
        quantity: item.quantity,
        packingSize: item.packingSize,
        packingQuantity: item.packingQuantity,
        quotedPrice: item.quotedPrice,
        subtotal: calculateItemSubtotal(item),
        notes: item.notes,
      },
    });

    const items = await prisma.deliveryItem.findMany({ where: { deliveryId } });
    await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        totalQuotedValue: calculateDeliveryTotal(
          items.map((row: DeliveryItemRow) => ({
            productGroup: row.productGroup,
            quantity: row.quantity,
            packingSize: row.packingSize,
            packingQuantity: row.packingQuantity,
            quotedPrice: Number(row.quotedPrice),
            productType: row.productType,
          })),
        ),
      },
    });

    await logActivity({
      entityType: "DELIVERY",
      entityId: deliveryId,
      action: "ITEM_ADDED",
      message: "Delivery item added",
      actorId,
    });

    return this.getById(deliveryId);
  },

  async updateItem(deliveryId: string, itemId: string, item: DeliveryItemInput, actorId: string) {
    assertPackingAllowed(item);
    await prisma.deliveryItem.update({
      where: { id: itemId },
      data: {
        productGroup: item.productGroup,
        productType: item.productType ?? null,
        quantity: item.quantity,
        packingSize: item.packingSize,
        packingQuantity: item.packingQuantity,
        quotedPrice: item.quotedPrice,
        subtotal: calculateItemSubtotal(item),
        notes: item.notes,
      },
    });

    const delivery = await this.getById(deliveryId);
    if (!delivery) {
      throw new AppError("Delivery not found", StatusCodes.NOT_FOUND);
    }

    await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        totalQuotedValue: calculateDeliveryTotal(
          delivery.items.map((row: DeliveryItemRow) => ({
            productGroup: row.productGroup,
            quantity: row.quantity,
            packingSize: row.packingSize,
            packingQuantity: row.packingQuantity,
            quotedPrice: Number(row.quotedPrice),
            productType: row.productType,
          })),
        ),
      },
    });

    await logActivity({
      entityType: "DELIVERY",
      entityId: deliveryId,
      action: "ITEM_UPDATED",
      message: "Delivery item updated",
      actorId,
    });

    return this.getById(deliveryId);
  },

  async deleteItem(deliveryId: string, itemId: string, actorId: string) {
    await prisma.deliveryItem.delete({ where: { id: itemId } });
    const remainingItems = await prisma.deliveryItem.findMany({ where: { deliveryId } });
    await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        totalQuotedValue: calculateDeliveryTotal(
          remainingItems.map((row: DeliveryItemRow) => ({
            productGroup: row.productGroup,
            quantity: row.quantity,
            packingSize: row.packingSize,
            packingQuantity: row.packingQuantity,
            quotedPrice: Number(row.quotedPrice),
            productType: row.productType,
          })),
        ),
      },
    });
    await logActivity({
      entityType: "DELIVERY",
      entityId: deliveryId,
      action: "ITEM_DELETED",
      message: "Delivery item deleted",
      actorId,
    });
    return this.getById(deliveryId);
  },

  async attachBill(deliveryId: string, file: Express.Multer.File, actorId: string) {
    const delivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        billFileName: file.originalname,
        billFileUrl: `/${file.destination.split("\\").pop()}/${file.filename}`.replace(/\\/g, "/"),
        billMimeType: file.mimetype,
      },
    });

    await logActivity({
      entityType: "DELIVERY",
      entityId: deliveryId,
      action: "BILL_UPLOADED",
      message: "Delivery bill uploaded",
      actorId,
    });

    return delivery;
  },

  async removeBill(deliveryId: string, actorId: string) {
    const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId } });
    if (delivery?.billFileUrl) {
      removeUploadedFile(delivery.billFileUrl);
    }
    await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        billFileUrl: null,
        billFileName: null,
        billMimeType: null,
      },
    });
    await logActivity({
      entityType: "DELIVERY",
      entityId: deliveryId,
      action: "BILL_REMOVED",
      message: "Delivery bill removed",
      actorId,
    });
    return { success: true };
  },
};
