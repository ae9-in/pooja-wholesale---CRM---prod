import { prisma } from "../../lib/prisma.js";
import { createPaginationMeta, getPagination } from "../../utils/pagination.js";
import { logActivity } from "../activity/activity.service.js";
import { deliveriesService, type DeliveryCreateInput } from "../deliveries/deliveries.service.js";

type CustomerStatusValue =
  | "NEW"
  | "CONTACTED"
  | "QUOTED"
  | "DELIVERY_PENDING"
  | "DELIVERED"
  | "REVISIT_REQUIRED"
  | "FOLLOW_UP_REQUIRED"
  | "INACTIVE";

type CustomerCreateInput = {
  businessName: string;
  ownerName: string;
  phoneNumber1: string;
  phoneNumber2?: string | null;
  email?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  area: string;
  city: string;
  state: string;
  pincode: string;
  description?: string | null;
  businessType: string;
  status?: CustomerStatusValue;
  priority?: string;
  source?: string | null;
  assignedStaffId?: string | null;
  createdById: string;
  initialOrders?: DeliveryCreateInput[];
};

type CustomerUpdateInput = Partial<{
  businessName: string;
  ownerName: string;
  phoneNumber1: string;
  phoneNumber2: string | null;
  email: string | null;
  addressLine1: string;
  addressLine2: string | null;
  area: string;
  city: string;
  state: string;
  pincode: string;
  description: string | null;
  businessType: string;
  status: CustomerStatusValue;
  priority: string;
  source: string | null;
  assignedStaffId: string | null;
  isArchived: boolean;
}>;

const CUSTOMER_STATUS = {
  INACTIVE: "INACTIVE",
} as const;

function customerWhere(query: Record<string, string>, user?: Express.UserPayload) {
  const search = query.search?.trim();
  const and: Array<Record<string, unknown>> = [{ isArchived: false }];

  if (user?.role === "STAFF") {
    and.push({ assignedStaffId: user.id });
  }

  if (search) {
    and.push({
      OR: [
        { businessName: { contains: search, mode: "insensitive" } },
        { ownerName: { contains: search, mode: "insensitive" } },
        { phoneNumber1: { contains: search, mode: "insensitive" } },
        { phoneNumber2: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { area: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (query.status) and.push({ status: query.status as CustomerStatusValue });
  if (query.city) and.push({ city: query.city });
  if (query.area) and.push({ area: query.area });
  if (query.assignedStaffId) and.push({ assignedStaffId: query.assignedStaffId });
  if (query.createdFrom || query.createdTo) {
    and.push({
      createdAt: {
        gte: query.createdFrom ? new Date(query.createdFrom) : undefined,
        lte: query.createdTo ? new Date(query.createdTo) : undefined,
      },
    });
  }

  return { AND: and };
}

export const customersService = {
  async list(query: Record<string, string>, user?: Express.UserPayload) {
    const { page, limit, skip } = getPagination(Number(query.page), Number(query.limit));
    const where = customerWhere(query, user);
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

    const [total, data] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          assignedStaff: { select: { id: true, fullName: true } },
          _count: { select: { deliveries: true, reminders: true } },
        },
      }),
    ]);

    return { data, meta: createPaginationMeta(total, page, limit) };
  },

  async create(
    input: CustomerCreateInput,
    actorId: string,
  ) {
    const { initialOrders = [], ...customerInput } = input;
    const customer = await prisma.customer.create({
      data: customerInput as any,
      include: {
        assignedStaff: { select: { id: true, fullName: true } },
      },
    });

    await logActivity({
      entityType: "CUSTOMER",
      entityId: customer.id,
      action: "CREATED",
      message: `Customer ${customer.businessName} created`,
      actorId,
    });

    if (initialOrders.length > 0) {
      await deliveriesService.createMany(
        initialOrders.map((order) => ({
          ...(order as DeliveryCreateInput),
          ...order,
          customerId: customer.id,
        })),
        actorId,
      );
    }

    return customer;
  },

  async getById(id: string, user?: Express.UserPayload) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        assignedStaff: { select: { id: true, fullName: true } },
        deliveries: {
          select: {
            id: true,
            deliveryStatus: true,
            totalQuotedValue: true,
            quotedDeliveryDate: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10, // Limit to 10 most recent
        },
        reminders: {
          select: {
            id: true,
            title: true,
            status: true,
            reminderDate: true,
          },
          orderBy: { reminderDate: "asc" },
          take: 10, // Limit to 10 upcoming
        },
        notes: {
          select: {
            id: true,
            content: true,
            noteType: true,
            createdAt: true,
            author: { select: { id: true, fullName: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10, // Limit to 10 most recent
        },
      },
    });

    if (customer && user?.role === "STAFF" && customer.assignedStaffId !== user.id) {
      return null;
    }

    return customer;
  },

  async update(id: string, input: CustomerUpdateInput, actorId: string) {
    const customer = await prisma.customer.update({
      where: { id },
      data: input as any,
    });

    await logActivity({
      entityType: "CUSTOMER",
      entityId: customer.id,
      action: "UPDATED",
      message: `Customer ${customer.businessName} updated`,
      actorId,
    });

    return customer;
  },

  async updateStatus(id: string, status: CustomerStatusValue, actorId: string) {
    const customer = await prisma.customer.update({
      where: { id },
      data: { status },
    });

    await logActivity({
      entityType: "CUSTOMER",
      entityId: customer.id,
      action: "STATUS_CHANGED",
      message: `Customer status changed to ${status}`,
      actorId,
    });

    return customer;
  },

  async remove(id: string, actorId: string) {
    const customer = await prisma.customer.update({
      where: { id },
      data: { isArchived: true, status: CUSTOMER_STATUS.INACTIVE },
    });

    await logActivity({
      entityType: "CUSTOMER",
      entityId: customer.id,
      action: "ARCHIVED",
      message: `Customer ${customer.businessName} archived`,
      actorId,
    });

    return { success: true };
  },

  async listNotes(customerId: string) {
    return prisma.note.findMany({
      where: { customerId },
      include: { author: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async addNote(
    customerId: string,
    input: { content: string; deliveryId?: string; noteType: "GENERAL" | "DELIVERY" | "REVISIT" | "FOLLOW_UP" },
    actorId: string,
  ) {
    const note = await prisma.note.create({
      data: {
        customerId,
        deliveryId: input.deliveryId,
        content: input.content,
        noteType: input.noteType,
        authorId: actorId,
      },
      include: { author: { select: { id: true, fullName: true } } },
    });

    await logActivity({
      entityType: "NOTE",
      entityId: note.id,
      action: "CREATED",
      message: `Note added to customer ${customerId}`,
      actorId,
    });

    return note;
  },

  async listDeliveries(customerId: string) {
    return prisma.delivery.findMany({
      where: { customerId },
      include: { items: true, reminders: true },
      orderBy: { createdAt: "desc" },
    });
  },
};
