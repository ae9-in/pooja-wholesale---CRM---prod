import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma.js";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/app-error.js";
import { logActivity } from "../activity/activity.service.js";

function signAccessToken(payload: Express.UserPayload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export const authService = {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED);
    }

    const payload: Express.UserPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    await logActivity({
      entityType: "AUTH",
      entityId: user.id,
      action: "LOGIN",
      message: `${user.fullName} logged in`,
      actorId: user.id,
    });

    return {
      token: signAccessToken(payload),
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    };
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    return user;
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AppError("Current password is incorrect", StatusCodes.BAD_REQUEST);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { success: true };
  },
};
