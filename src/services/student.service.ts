import prisma from "../utils/prisma";
import { StudentInput } from "../types";

export async function getAllStudents(teamId?: string, status?: string) {
  return prisma.student.findMany({
    where: {
      ...(teamId  ? { teamId }                                 : {}),
      ...(status  ? { status: status as "ACTIVE" | "INACTIVE" | "DROPPED" } : {}),
    },
    include: { team: true },
    orderBy: { name: "asc" },
  });
}

export async function getStudentById(id: string) {
  return prisma.student.findUnique({
    where:   { id },
    include: { team: true, reviewTasks: true },
  });
}

export async function updateStudentStatus(id: string, status: "ACTIVE" | "INACTIVE" | "DROPPED") {
  return prisma.student.update({
    where: { id },
    data:  { status },
  });
}
