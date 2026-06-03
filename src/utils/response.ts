import { Response } from "express";
import { ApiResponse } from "../types";

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  const payload: ApiResponse<T> = { success: true, data };
  res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode = 400,
  details?: Record<string, unknown>
): void {
  const payload: ApiResponse = {
    success: false,
    error: { code, message, details },
  };
  res.status(statusCode).json(payload);
}
