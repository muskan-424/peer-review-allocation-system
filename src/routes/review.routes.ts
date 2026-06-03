import { Router } from "express";
import { getMyTasks, startTask, submitReview, getWorkload } from "../controllers/review.controller";
import { authenticate, requireInstructor } from "../middleware/auth.middleware";

const router = Router();

// GET   /api/v1/reviews/my-tasks       – student sees their assigned reviews
router.get("/my-tasks",       authenticate, getMyTasks);

// GET   /api/v1/reviews/workload       – instructor sees workload summary
router.get("/workload",       authenticate, requireInstructor, getWorkload);

// PATCH /api/v1/reviews/:id/start      – student starts a review
router.patch("/:id/start",   authenticate, startTask);

// PATCH /api/v1/reviews/:id/submit     – student submits score
router.patch("/:id/submit",  authenticate, submitReview);

export default router;
