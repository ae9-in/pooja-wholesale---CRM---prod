import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { logger } from "../lib/logger.js";
import { AppError } from "../utils/app-error.js";

function isPrismaKnownRequestError(error: unknown): error is Error & { code: string; meta?: unknown } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string" &&
    error.constructor?.name === "PrismaClientKnownRequestError"
  );
}

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

  if (isPrismaKnownRequestError(error)) {
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
