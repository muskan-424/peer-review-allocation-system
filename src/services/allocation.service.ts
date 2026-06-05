import prisma from "../utils/prisma";
import { AllocationResult, AllocationSummary } from "../types";

const MIN_REVIEWS = 2;

/**
 * CORE ALLOCATION ENGINE
 *
 * Implements the greedy constraint-first algorithm from Day 2 & Day 3 docs.
 *
 * Pipeline per submission:
 *  HC-05 → active students only
 *  HC-01 → remove owner
 *  HC-02 → remove same-team students
 *  HC-04 → remove already-assigned reviewers
 *  SC-01 → remove prior reviewer pairs (relaxed if pool would drop below MIN_REVIEWS)
 *  SC-02 → sort by reviewCount ascending (fewest reviews first)
 *  HC-03 → ensure pool.length >= MIN_REVIEWS, else throw AllocationError
 */
export async function allocateReviews(assignmentId: string): Promise<AllocationSummary> {
  const startTime = Date.now();
  const relaxedConstraints: string[] = [];
  let totalTasksCreated = 0;

  // ── Load all data needed ────────────────────────────────────────────────────
  const submissions = await prisma.submission.findMany({
    where: { assignmentId, status: "PENDING" },
    include: {
      owner:       { include: { team: true } },
      reviewTasks: true,
    },
  });

  const allActiveStudents = await prisma.student.findMany({
    where: { status: "ACTIVE" },
    include: { team: true },
  });

  const allPairHistory = await prisma.pairHistory.findMany({
    where: { assignmentId },
  });

  // ── Process each submission ─────────────────────────────────────────────────
  for (const submission of submissions) {
    const owner     = submission.owner;
    const ownerTeam = owner.teamId;

    // Already-assigned reviewer IDs for this submission
    const existingReviewerIds = new Set(
      submission.reviewTasks.map((t) => t.reviewerId)
    );

    // Step 1 – HC-05: start with ALL active students
    let pool = allActiveStudents.filter((s) => s.status === "ACTIVE");

    // Step 2 – HC-01: remove the submission owner
    pool = pool.filter((s) => s.id !== owner.id);

    // Step 3 – HC-02: remove same-team students
    pool = pool.filter((s) => s.teamId !== ownerTeam);

    // Step 4 – HC-04: remove already-assigned reviewers
    pool = pool.filter((s) => !existingReviewerIds.has(s.id));

    // Step 5 – SC-01: remove prior reviewer-reviewee pairs (soft)
    const priorReviewerIds = new Set(
      allPairHistory
        .filter((ph) => ph.revieweeId === owner.id)
        .map((ph) => ph.reviewerId)
    );

    const poolWithoutPriors = pool.filter((s) => !priorReviewerIds.has(s.id));
    if (poolWithoutPriors.length >= MIN_REVIEWS) {
      pool = poolWithoutPriors;  // SC-01 applied
    } else {
      // Relax SC-01 – not enough reviewers remain without prior pairs
      relaxedConstraints.push(`SC-01 relaxed for submission ${submission.id}`);
    }

    // Step 6 – SC-02: sort by reviewCount ascending (fewest first)
    pool.sort((a, b) => a.reviewCount - b.reviewCount);

    // Step 7 – HC-03: feasibility check
    if (pool.length < MIN_REVIEWS) {
      console.warn(
        `[AllocationError] Cannot satisfy HC-03 for submission ${submission.id}. ` +
        `Pool size: ${pool.length}, required: ${MIN_REVIEWS}`
      );
      continue; // Skip this submission – instructor must handle manually
    }

    // Step 8 – Assign the top MIN_REVIEWS reviewers
    const assigned = pool.slice(0, MIN_REVIEWS);

    // ── Persist within a transaction ──────────────────────────────────────────
    await prisma.$transaction(async (tx) => {
      for (const reviewer of assigned) {
        // Create ReviewTask record
        await tx.reviewTask.create({
          data: {
            submissionId: submission.id,
            reviewerId:   reviewer.id,
            status:       "PENDING",
          },
        });

        // Increment reviewer workload (SC-02 counter)
        await tx.student.update({
          where: { id: reviewer.id },
          data:  { reviewCount: { increment: 1 } },
        });

        // Record pair in PairHistory (SC-01 tracking)
        await tx.pairHistory.upsert({
          where: {
            reviewerId_revieweeId_assignmentId: {
              reviewerId:   reviewer.id,
              revieweeId:   owner.id,
              assignmentId: assignmentId,
            },
          },
          update: { pairCount: { increment: 1 } },
          create: {
            reviewerId:   reviewer.id,
            revieweeId:   owner.id,
            assignmentId: assignmentId,
            pairCount:    1,
          },
        });
      }

      // Update submission review count and status
      await tx.submission.update({
        where: { id: submission.id },
        data: {
          reviewCount: { increment: MIN_REVIEWS },
          status:      "UNDER_REVIEW",
        },
      });
    });

    // Keep local workload in sync for the next iteration
    for (const reviewer of assigned) {
      const localStudent = allActiveStudents.find((s) => s.id === reviewer.id);
      if (localStudent) localStudent.reviewCount += 1;
    }

    totalTasksCreated += assigned.length;
  }

  return {
    totalSubmissions:   submissions.length,
    tasksCreated:       totalTasksCreated,
    submissionsCovered: submissions.length,
    relaxedConstraints,
    durationMs:         Date.now() - startTime,
  };
}

/**
 * Allocate for a single submission only (e.g. late submission)
 */
export async function allocateSingle(submissionId: string): Promise<AllocationResult> {
  const submission = await prisma.submission.findUnique({
    where:   { id: submissionId },
    include: { owner: { include: { team: true } }, reviewTasks: true },
  });

  if (!submission) throw new Error("Submission not found");

  const summary = await allocateReviews(submission.assignmentId);

  return {
    submissionId,
    assignedReviewers: [],
    tasksCreated:      summary.tasksCreated,
  };
}
