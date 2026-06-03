import { Router } from "express";
import { runAllocation, runSingleAllocation } from "../controllers/allocation.controller";
import { authenticate, requireInstructor } from "../middleware/auth.middleware";

const router = Router();

// POST /api/v1/allocation/run              – batch allocation
router.post("/run",              authenticate, requireInstructor, runAllocation);

// POST /api/v1/allocation/run/:submissionId – single allocation
router.post("/run/:submissionId", authenticate, requireInstructor, runSingleAllocation);

export default router;
