import prisma from "../utils/prisma";
import { SubmissionInput } from "../types";

export async function createSubmission(data: SubmissionInput) {
  return prisma.submission.create({
    data: {
      assignmentId: data.assignmentId,
      ownerId:      data.ownerId,
    },
    include: { owner: true },
  });
}

export async function getAllSubmissions(assignmentId?: string, status?: string) {
  return prisma.submission.findMany({
    where: {
      ...(assignmentId ? { assignmentId }                                                   : {}),
      ...(status       ? { status: status as "PENDING" | "UNDER_REVIEW" | "COMPLETE" }     : {}),
    },
    include: { owner: true, reviewTasks: { include: { reviewer: true } } },
    orderBy: { submittedAt: "desc" },
  });
}

export async function getSubmissionById(id: string) {
  return prisma.submission.findUnique({
    where:   { id },
    include: { owner: true, reviewTasks: { include: { reviewer: true } } },
  });
}
