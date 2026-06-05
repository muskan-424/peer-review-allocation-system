const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {

  console.log("Seeding data...");

  // Teams
  const team1 = await prisma.team.create({
    data: {
      team_name: "Team Alpha"
    }
  });

  const team2 = await prisma.team.create({
    data: {
      team_name: "Team Beta"
    }
  });

  const team3 = await prisma.team.create({
    data: {
      team_name: "Team Gamma"
    }
  });

  // Students
  await prisma.student.createMany({
    data: [
      {
        name: "Student A",
        email: "a@test.com",
        team_id: team1.team_id
      },
      {
        name: "Student B",
        email: "b@test.com",
        team_id: team1.team_id
      },
      {
        name: "Student C",
        email: "c@test.com",
        team_id: team2.team_id
      },
      {
        name: "Student D",
        email: "d@test.com",
        team_id: team2.team_id
      },
      {
        name: "Student E",
        email: "e@test.com",
        team_id: team3.team_id
      },
      {
        name: "Student F",
        email: "f@test.com",
        team_id: team3.team_id
      }
    ]
  });

  console.log("Seed data inserted successfully!");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });