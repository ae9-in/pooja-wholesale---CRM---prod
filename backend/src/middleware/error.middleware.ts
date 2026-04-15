import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { logger } from "../lib/logger.js";
import { AppError } from "../utils/app-error.js";

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  logger.error({ err: error }, "Request failed");

  if (error instanceof ZodError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Validation failed",
      errors: error.flatten(),
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Database request failed",
      code: error.code,
      meta: error.meta,
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details,
    });
  }

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: "Internal server error",
    ...(process.env.NODE_ENV !== "production" ? { error: error.message } : {}),
  });
}
