import { create } from "zustand";
import type { User } from "../types";

type AuthState = {
  user: User | null;
};

export const authStore = create<AuthState>((set) => ({
  user: {
    id: "60b8d295f1c4e724b48a1d00",
    email: "admin@wholesale.local",
    fullName: "System Operator",
    role: "ADMIN",
    isActive: true,
  } as User,
}));
