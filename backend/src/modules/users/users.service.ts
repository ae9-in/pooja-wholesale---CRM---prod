import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import { getPagination, createPaginationMeta } from "../../utils/pagination.js";
import { logActivity } from "../activity/activity.service.js";

export const usersService = {
  async list(query: Record<string, string>) {
    const { page, limit, skip } = getPagination(Number(query.page), Number(query.limit));
    const [total, data] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return { data, meta: createPaginationMeta(total, page, limit) };
  },

  async create(input: {
    fullName: string;
    email: string;
    password: string;
    role: "SUPER_ADMIN" | "ADMIN" | "STAFF";
    phone?: string;
    actorId: string;
  }) {
    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        passwordHash,
        role: input.role,
        phone: input.phone,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
      },
    });

    await logActivity({
      entityType: "USER",
      entityId: user.id,
      action: "CREATED",
      message: `User ${user.fullName} created`,
      actorId: input.actorId,
    });

    return user;
  },

  async getById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async update(id: string, input: Record<string, unknown>, actorId: string) {
    const user = await prisma.user.update({
      where: { id },
      data: input,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
      },
    });

    await logActivity({
      entityType: "USER",
      entityId: user.id,
      action: "UPDATED",
      message: `User ${user.fullName} updated`,
      actorId,
    });

    return user;
  },

  async setActive(id: string, isActive: boolean, actorId: string) {
    return this.update(id, { isActive }, actorId);
  },
};
