import { Router } from "express";
import prisma from "../utils/prisma";
import { sendSuccess, sendError } from "../utils/response";
import { authenticate, requireInstructor } from "../middleware/auth.middleware";

const router = Router();

// GET  /api/v1/teams
router.get("/", authenticate, requireInstructor, async (_req, res) => {
  try {
    const teams = await prisma.team.findMany({ include: { students: true } });
    sendSuccess(res, teams);
  } catch (err: unknown) {
    sendError(res, "INTERNAL_ERROR", (err as Error).message, 500);
  }
});

// POST /api/v1/teams
router.post("/", authenticate, requireInstructor, async (req, res) => {
  try {
    const { name, assignmentId } = req.body;
    if (!name || !assignmentId) {
      sendError(res, "VALIDATION_ERROR", "name and assignmentId are required");
      return;
    }
    const team = await prisma.team.create({ data: { name, assignmentId } });
    sendSuccess(res, team, 201);
  } catch (err: unknown) {
    sendError(res, "INTERNAL_ERROR", (err as Error).message, 500);
  }
});

export default router;
