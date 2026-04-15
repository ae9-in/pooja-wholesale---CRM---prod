import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { prisma } from "../src/lib/prisma.js";
import { authService } from "../src/modules/auth/auth.service.js";

describe("auth service", () => {
  it("logs in active users with valid passwords", async () => {
    vi.spyOn(prisma.user, "findUnique").mockResolvedValue({
      id: "user-1",
      fullName: "Super Admin",
      email: "superadmin@wholesale.local",
      passwordHash: "hashed",
      role: Role.SUPER_ADMIN,
      phone: "9999999999",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    vi.spyOn(bcrypt, "compare").mockResolvedValue(true as never);
    vi.spyOn(prisma.activityLog, "create").mockResolvedValue({} as never);

    const result = await authService.login("superadmin@wholesale.local", "Password123!");

    expect(result.user.email).toBe("superadmin@wholesale.local");
    expect(result.token).toBeTruthy();
  });
});
