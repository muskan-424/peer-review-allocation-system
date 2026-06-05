import { Router } from "express";
import { createSubmission, getSubmissions, getSubmission } from "../controllers/submission.controller";
import { authenticate, requireInstructor } from "../middleware/auth.middleware";

const router = Router();

// POST /api/v1/submissions      – student submits
router.post("/",    authenticate, createSubmission);

// GET  /api/v1/submissions      – instructor views all
router.get("/",     authenticate, requireInstructor, getSubmissions);

// GET  /api/v1/submissions/:id  – instructor or owner
router.get("/:id",  authenticate, getSubmission);

export default router;
