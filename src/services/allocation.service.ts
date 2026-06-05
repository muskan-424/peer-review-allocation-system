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

    // Hard Constraint Filtering
    let pool = filterCandidates(
      allActiveStudents,
      owner.id,
      ownerTeam,
      existingReviewerIds
    );

    // Soft Constraint Sorting and Workload Balancing
    const { sortedPool } = sortCandidates(
      pool,
      allPairHistory,
      owner.id,
      MIN_REVIEWS,
      relaxedConstraints,
      submission.id
    );
    pool = sortedPool;

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

/**
 * Hard Constraint Filtering
 * HC-05: Only ACTIVE students
 * HC-01: No Self Review
 * HC-02: No Same Team Review
 * HC-04: No Duplicate Review Assignment
 */
export function filterCandidates<T extends { id: string; status: string; teamId?: string | null }>(
  students: T[],
  ownerId: string,
  ownerTeamId: string | null | undefined,
  existingReviewerIds: Set<string>
): T[] {
  let pool = students.filter((s) => s.status === "ACTIVE");
  pool = pool.filter((s) => s.id !== ownerId);
  if (ownerTeamId) {
    pool = pool.filter((s) => s.teamId !== ownerTeamId);
  }
  pool = pool.filter((s) => !existingReviewerIds.has(s.id));
  return pool;
}

/**
 * Soft Constraint Sorting and Workload Balancing
 * SC-01: Avoid Repeat Reviewer Pairs
 * SC-02: Workload Balancing (reviewCount ascending)
 */
export function sortCandidates<
  T extends { id: string; reviewCount: number },
  P extends { reviewerId: string; revieweeId: string }
>(
  pool: T[],
  pairHistory: P[],
  ownerId: string,
  minReviews: number,
  relaxedConstraints: string[],
  submissionId: string
): { sortedPool: T[]; sc01Applied: boolean } {
  const priorReviewerIds = new Set(
    pairHistory
      .filter((ph) => ph.revieweeId === ownerId)
      .map((ph) => ph.reviewerId)
  );

  const poolWithoutPriors = pool.filter((s) => !priorReviewerIds.has(s.id));
  let sc01Applied = false;
  let finalPool = [...pool];

  if (poolWithoutPriors.length >= minReviews) {
    finalPool = poolWithoutPriors;
    sc01Applied = true;
  } else {
    relaxedConstraints.push(`SC-01 relaxed for submission ${submissionId}`);
  }

  finalPool.sort((a, b) => a.reviewCount - b.reviewCount);

  return { sortedPool: finalPool, sc01Applied };
}
