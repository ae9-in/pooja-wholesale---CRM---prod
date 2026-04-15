import { Role } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { authorize } from "../src/middleware/auth.middleware.js";

describe("rbac middleware", () => {
  it("allows matching roles", () => {
    const middleware = authorize(Role.ADMIN, Role.SUPER_ADMIN);
    const next = vi.fn();
    middleware({ user: { id: "1", email: "a@a.com", role: Role.ADMIN } } as never, {} as never, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it("does not block non matching roles when auth is disabled", () => {
    const middleware = authorize(Role.SUPER_ADMIN);
    const next = vi.fn();
    middleware({ user: { id: "1", email: "a@a.com", role: Role.STAFF } } as never, {} as never, next);
    expect(next).toHaveBeenCalledOnce();
    expect(next.mock.calls[0][0]).toBeUndefined();
  });
});
