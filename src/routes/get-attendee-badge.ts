import { FastifyInstance, FastifyRequest } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
type GetAttendeeBadgeParams = {
  attendeeId: number;
};
export async function getAttendeeBadge(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/attendees/:attendeeId/badge",
    {
      schema: {
        params: z.object({
          attendeeId: z.coerce.number().int(),
        }),
        response: {},
      },
    },
    async (
      request: FastifyRequest<{ Params: GetAttendeeBadgeParams }>,
      reply
    ) => {
      const { attendeeId } = request.params;

      const attendee = await prisma.attendee.findUnique({
        select: {
          name: true,
          email: true,
          event: {
            select: {
              title: true,
            },
          },
        },
        where: {
          id: attendeeId,
        },
      });

      if (attendee === null) {
        throw new Error("Attendee not found.");
      }

      return reply.send({ attendee });
    }
  );
}
