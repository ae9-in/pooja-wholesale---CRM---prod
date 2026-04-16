declare global {
  namespace Express {
    type RoleValue = "SUPER_ADMIN" | "ADMIN" | "STAFF";

    interface UserPayload {
      id: string;
      email: string;
      role: RoleValue;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
