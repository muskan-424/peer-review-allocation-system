import { Request, Response } from "express";
import * as StudentService from "../services/student.service";
import { sendSuccess, sendError } from "../utils/response";

export async function getStudents(req: Request, res: Response): Promise<void> {
  try {
    const { teamId, status } = req.query as Record<string, string>;
    const students = await StudentService.getAllStudents(teamId, status);
    sendSuccess(res, students);
  } catch (err: unknown) {
    sendError(res, "INTERNAL_ERROR", (err as Error).message, 500);
  }
}

export async function getStudent(req: Request, res: Response): Promise<void> {
  try {
    const student = await StudentService.getStudentById(req.params.id);
    if (!student) { sendError(res, "NOT_FOUND", "Student not found", 404); return; }
    sendSuccess(res, student);
  } catch (err: unknown) {
    sendError(res, "INTERNAL_ERROR", (err as Error).message, 500);
  }
}

export async function updateStatus(req: Request, res: Response): Promise<void> {
  try {
    const { status } = req.body;
    const allowed = ["ACTIVE", "INACTIVE", "DROPPED"];
    if (!allowed.includes(status)) {
      sendError(res, "VALIDATION_ERROR", `status must be one of: ${allowed.join(", ")}`);
      return;
    }
    const updated = await StudentService.updateStudentStatus(req.params.id, status);
    sendSuccess(res, updated);
  } catch (err: unknown) {
    sendError(res, "INTERNAL_ERROR", (err as Error).message, 500);
  }
}
