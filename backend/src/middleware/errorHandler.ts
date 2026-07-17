import { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode =
    err instanceof AppError
      ? err.statusCode
      : typeof err === "object" &&
          err !== null &&
          "statusCode" in err &&
          typeof (err as { statusCode: unknown }).statusCode === "number"
        ? (err as { statusCode: number }).statusCode
        : 500;

  const message =
    err instanceof Error ? err.message : "An unexpected error occurred";

  if (statusCode >= 400) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
    },
  });
}
