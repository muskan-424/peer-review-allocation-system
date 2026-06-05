import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types";
import { sendError } from "../utils/response";

// Extend Express Request to carry user info
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Verify the Bearer JWT on every protected route
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendError(res, "UNAUTHORISED", "No token provided", 401);
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    sendError(res, "UNAUTHORISED", "Invalid or expired token", 401);
  }
}

// Only allow instructors
export function requireInstructor(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== "INSTRUCTOR") {
    sendError(res, "FORBIDDEN", "Instructor access required", 403);
    return;
  }
  next();
}
