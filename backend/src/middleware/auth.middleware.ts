import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { AppError } from "../utils/app-error.js";

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  // Authentication removed as requested. Mocking user as Administrator.
  req.user = {
    id: "60b8d295f1c4e724b48a1d00", // Fake mock ObjectId
    email: "admin@wholesale.local",
    role: "ADMIN",
  };
  next();
}

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("No acting user is available for this request.", 500));
    }
    next();
  };
}
