import { Router } from "express";
import { getStudents, getStudent, updateStatus } from "../controllers/student.controller";
import { authenticate, requireInstructor } from "../middleware/auth.middleware";

const router = Router();

// GET  /api/v1/students          – instructor only
router.get("/",    authenticate, requireInstructor, getStudents);

// GET  /api/v1/students/:id      – instructor or self
router.get("/:id", authenticate, getStudent);

// PATCH /api/v1/students/:id     – instructor only
router.patch("/:id", authenticate, requireInstructor, updateStatus);

export default router;
