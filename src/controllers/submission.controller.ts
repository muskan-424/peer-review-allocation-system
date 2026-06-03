import { Request, Response } from "express";
import * as SubmissionService from "../services/submission.service";
import { sendSuccess, sendError } from "../utils/response";

export async function createSubmission(req: Request, res: Response): Promise<void> {
  try {
    const { assignmentId, ownerId } = req.body;
    if (!assignmentId || !ownerId) {
      sendError(res, "VALIDATION_ERROR", "assignmentId and ownerId are required");
      return;
    }
    const submission = await SubmissionService.createSubmission({ assignmentId, ownerId });
    sendSuccess(res, submission, 201);
  } catch (err: unknown) {
    sendError(res, "INTERNAL_ERROR", (err as Error).message, 500);
  }
}

export async function getSubmissions(req: Request, res: Response): Promise<void> {
  try {
    const { assignmentId, status } = req.query as Record<string, string>;
    const submissions = await SubmissionService.getAllSubmissions(assignmentId, status);
    sendSuccess(res, submissions);
  } catch (err: unknown) {
    sendError(res, "INTERNAL_ERROR", (err as Error).message, 500);
  }
}

export async function getSubmission(req: Request, res: Response): Promise<void> {
  try {
    const submission = await SubmissionService.getSubmissionById(req.params.id);
    if (!submission) { sendError(res, "NOT_FOUND", "Submission not found", 404); return; }
    sendSuccess(res, submission);
  } catch (err: unknown) {
    sendError(res, "INTERNAL_ERROR", (err as Error).message, 500);
  }
}
