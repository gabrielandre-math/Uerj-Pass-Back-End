import { prisma } from "../src/lib/prisma";
import { faker } from "@faker-js/faker";
import dayjs from "dayjs";
import { Prisma } from "../src/generated/prisma";

async function seed() {
  const eventId = "9e9bd979-9d10-4915-b339-3786b1634f33";

  await prisma.event.deleteMany();

  await prisma.event.create({
    data: {
      id: eventId,
      title: "Semana da Tecnologia Acadêmica UERJ",
      slug: "tecnologia-week",
      details:
        "Um evento para estudantes universitários que querem fazer network!",
      maximumAttendees: 120,
    },
  });

  const attendeesToInsert: Prisma.AttendeeUncheckedCreateInput[] = [];

  for (let i = 0; i <= 100; i++) {
    attendeesToInsert.push({
      id: 10000 + i,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      eventId,
      createdAt: faker.date.recent({
        days: 30,
        refDate: dayjs().subtract(8, "days").toDate(),
      }),
      checkIn: faker.helpers.arrayElement<
        Prisma.CheckInUncheckedCreateNestedOneWithoutAttendeeInput | undefined
      >([
        undefined,
        {
          create: {
            createdAt: faker.date.recent({ days: 7 }),
          },
        },
      ]),
    });
  }

  await Promise.all(
    attendeesToInsert.map((data) => {
      return prisma.attendee.create({
        data,
      });
    })
  );
}

seed().then(() => {
  console.log("Database seeded!");
  prisma.$disconnect();
});
