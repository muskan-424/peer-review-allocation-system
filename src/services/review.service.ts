import prisma from "../utils/prisma";

export async function getTasksForReviewer(reviewerId: string) {
  return prisma.reviewTask.findMany({
    where:   { reviewerId },
    include: { submission: { include: { owner: true } } },
    orderBy: { assignedAt: "desc" },
  });
}

export async function startTask(taskId: string) {
  return prisma.reviewTask.update({
    where: { id: taskId },
    data:  { status: "IN_PROGRESS" },
  });
}

export async function submitReview(taskId: string, score: number) {
  if (score < 0 || score > 100) {
    throw new Error("Score must be between 0 and 100");
  }

  const task = await prisma.reviewTask.update({
    where: { id: taskId },
    data: {
      score,
      status:      "SUBMITTED",
      completedAt: new Date(),
    },
  });

  // Update submission review count once fully reviewed
  const submission = await prisma.submission.findUnique({
    where:   { id: task.submissionId },
    include: { reviewTasks: true },
  });

  const allSubmitted = submission?.reviewTasks.every((t) => t.status === "SUBMITTED");
  if (allSubmitted) {
    await prisma.submission.update({
      where: { id: task.submissionId },
      data:  { status: "COMPLETE" },
    });
  }

  return task;
}

export async function getWorkloadSummary() {
  return prisma.student.findMany({
    where:  { status: "ACTIVE" },
    select: {
      id:          true,
      name:        true,
      reviewCount: true,
      reviewTasks: {
        select: { status: true },
      },
    },
  });
}
