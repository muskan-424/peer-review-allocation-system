import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes       from "./routes/auth.routes";
import studentRoutes    from "./routes/student.routes";
import teamRoutes       from "./routes/team.routes";
import submissionRoutes from "./routes/submission.routes";
import allocationRoutes from "./routes/allocation.routes";
import reviewRoutes     from "./routes/review.routes";

import { errorHandler } from "./middleware/error.middleware";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ message: "Peer Review Allocation API is running ✅", version: "1.0.0" });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/v1/auth",        authRoutes);
app.use("/api/v1/students",    studentRoutes);
app.use("/api/v1/teams",       teamRoutes);
app.use("/api/v1/submissions", submissionRoutes);
app.use("/api/v1/allocation",  allocationRoutes);
app.use("/api/v1/reviews",     reviewRoutes);

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
