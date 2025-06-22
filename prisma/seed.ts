import { prisma } from "../src/lib/prisma";
async function seed() {
  await prisma.event.create({
    data: {
      id: "1af1df85-a381-4619-a8b1-c5028e763bf7",
      title: "Uerj Sem Muros",
      slug: "uerj-sem-muros",
      details:
        "evento para divulgar trabalhos acadêmicos de alunos engajados com tecnologia e desenvolvimento.",
      maximumAttendees: 120,
    },
  });
}

seed().then(() => {
  console.log("Database seeded!");
  prisma.$disconnect();
});
