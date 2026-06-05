import { Request, Response } from "express";
import * as AllocationService from "../services/allocation.service";
import { sendSuccess, sendError } from "../utils/response";

// POST /api/v1/allocation/run  – run batch allocation for an assignment
export async function runAllocation(req: Request, res: Response): Promise<void> {
  try {
    const { assignmentId } = req.body;
    if (!assignmentId) {
      sendError(res, "VALIDATION_ERROR", "assignmentId is required");
      return;
    }
    const summary = await AllocationService.allocateReviews(assignmentId);
    sendSuccess(res, summary, 201);
  } catch (err: unknown) {
    sendError(res, "ALLOCATION_ERROR", (err as Error).message, 422);
  }
}

// POST /api/v1/allocation/run/:submissionId – run for one late submission
export async function runSingleAllocation(req: Request, res: Response): Promise<void> {
  try {
    const result = await AllocationService.allocateSingle(req.params.submissionId);
    sendSuccess(res, result, 201);
  } catch (err: unknown) {
    sendError(res, "ALLOCATION_ERROR", (err as Error).message, 422);
  }
}
