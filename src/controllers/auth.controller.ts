import { Request, Response } from "express";
import * as AuthService from "../services/auth.service";
import { sendSuccess, sendError } from "../utils/response";

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      sendError(res, "VALIDATION_ERROR", "email and password are required");
      return;
    }
    const result = await AuthService.loginUser(email, password);
    sendSuccess(res, result);
  } catch (err: unknown) {
    sendError(res, "UNAUTHORISED", (err as Error).message, 401);
  }
}
