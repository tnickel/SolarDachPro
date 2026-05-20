import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

/**
 * Custom application error with HTTP status code.
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Not Found error (404).
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(404, id ? `${resource} with ID '${id}' not found` : `${resource} not found`);
    this.name = "NotFoundError";
  }
}

/**
 * Global error handling middleware.
 * Sends structured JSON error responses.
 * Stack traces are only included in development mode.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || "Internal Server Error";

  console.error(`[ERROR] ${statusCode} – ${message}`, {
    name: err.name,
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
}
