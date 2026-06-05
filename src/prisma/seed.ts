/**
 * Seed file — populates the database with sample data from the Day 2 docs.
 * Run: npm run prisma:seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Instructor user ───────────────────────────────────────────────────────
  await prisma.user.upsert({
    where:  { email: "instructor@lms.com" },
    update: {},
    create: {
      email:        "instructor@lms.com",
      passwordHash: await bcrypt.hash("password123", 10),
      role:         "INSTRUCTOR",
    },
  });

  // ── Teams ─────────────────────────────────────────────────────────────────
  const assignmentId = "assignment-001";

  const t1 = await prisma.team.upsert({
    where:  { id: "team-t1" },
    update: {},
    create: { id: "team-t1", name: "T1 – Alpha", assignmentId },
  });
  const t2 = await prisma.team.upsert({
    where:  { id: "team-t2" },
    update: {},
    create: { id: "team-t2", name: "T2 – Beta",  assignmentId },
  });
  const t3 = await prisma.team.upsert({
    where:  { id: "team-t3" },
    update: {},
    create: { id: "team-t3", name: "T3 – Gamma", assignmentId },
  });

  // ── Students ──────────────────────────────────────────────────────────────
  const studentData = [
    { id: "student-a", name: "Alice", email: "alice@lms.com", teamId: t1.id },
    { id: "student-b", name: "Bob",   email: "bob@lms.com",   teamId: t1.id },
    { id: "student-c", name: "Carol", email: "carol@lms.com", teamId: t2.id },
    { id: "student-d", name: "David", email: "david@lms.com", teamId: t2.id },
    { id: "student-e", name: "Eva",   email: "eva@lms.com",   teamId: t3.id },
    { id: "student-f", name: "Frank", email: "frank@lms.com", teamId: t3.id },
  ];

  for (const s of studentData) {
    const user = await prisma.user.upsert({
      where:  { email: s.email },
      update: {},
      create: { email: s.email, passwordHash: await bcrypt.hash("password123", 10), role: "STUDENT" },
    });
    await prisma.student.upsert({
      where:  { id: s.id },
      update: {},
      create: { id: s.id, name: s.name, email: s.email, teamId: s.teamId, userId: user.id },
    });
  }

  // ── Submissions ───────────────────────────────────────────────────────────
  const submissionData = [
    { id: "sub-sa", ownerId: "student-a" },
    { id: "sub-sb", ownerId: "student-b" },
    { id: "sub-sc", ownerId: "student-c" },
    { id: "sub-sd", ownerId: "student-d" },
    { id: "sub-se", ownerId: "student-e" },
    { id: "sub-sf", ownerId: "student-f" },
  ];

  for (const s of submissionData) {
    await prisma.submission.upsert({
      where:  { id: s.id },
      update: {},
      create: { id: s.id, assignmentId, ownerId: s.ownerId },
    });
  }

  console.log("✅ Seed complete!");
  console.log("   Instructor: instructor@lms.com / password123");
  console.log("   Students:   alice@lms.com … frank@lms.com / password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
