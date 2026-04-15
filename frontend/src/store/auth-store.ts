import { create } from "zustand";
import type { User } from "../types";

type AuthState = {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
};

export const authStore = create<AuthState>((set) => ({
  token: "mock-token",
  user: {
    id: "60b8d295f1c4e724b48a1d00",
    email: "admin@wholesale.local",
    fullName: "Administrator",
    role: "ADMIN",
    isActive: true,
  } as User,
  setAuth: (token, user) => set({ token, user }),
  clearAuth: () => set({ token: null, user: null }),
}));
