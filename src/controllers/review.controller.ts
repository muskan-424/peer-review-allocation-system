import { Request, Response } from "express";
import * as ReviewService from "../services/review.service";
import { sendSuccess, sendError } from "../utils/response";

// GET /api/v1/reviews/my-tasks  – reviewer sees their assigned tasks
export async function getMyTasks(req: Request, res: Response): Promise<void> {
  try {
    const reviewerId = req.user!.userId;
    const tasks = await ReviewService.getTasksForReviewer(reviewerId);
    sendSuccess(res, tasks);
  } catch (err: unknown) {
    sendError(res, "INTERNAL_ERROR", (err as Error).message, 500);
  }
}

// PATCH /api/v1/reviews/:id/start
export async function startTask(req: Request, res: Response): Promise<void> {
  try {
    const task = await ReviewService.startTask(req.params.id);
    sendSuccess(res, task);
  } catch (err: unknown) {
    sendError(res, "INTERNAL_ERROR", (err as Error).message, 500);
  }
}

// PATCH /api/v1/reviews/:id/submit  – student submits score
export async function submitReview(req: Request, res: Response): Promise<void> {
  try {
    const { score } = req.body;
    if (score === undefined || typeof score !== "number") {
      sendError(res, "VALIDATION_ERROR", "score (number 0–100) is required");
      return;
    }
    const task = await ReviewService.submitReview(req.params.id, score);
    sendSuccess(res, task);
  } catch (err: unknown) {
    sendError(res, "VALIDATION_ERROR", (err as Error).message, 400);
  }
}

// GET /api/v1/reviews/workload  – instructor sees workload summary
export async function getWorkload(req: Request, res: Response): Promise<void> {
  try {
    const workload = await ReviewService.getWorkloadSummary();
    sendSuccess(res, workload);
  } catch (err: unknown) {
    sendError(res, "INTERNAL_ERROR", (err as Error).message, 500);
  }
}
