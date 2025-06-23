import { FastifyInstance, FastifyRequest } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";

type GetEventParams = {
  eventId: string;
};

type GetPageIndexQuery = {
  pageIndex: number;
  query: string | null;
  limit: number;
};

export async function getEventAttendees(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/events/:eventId/attendees",
    {
      schema: {
        params: z.object({
          eventId: z.string().uuid(),
        }),
        querystring: z.object({
          query: z.string().nullish(),
          pageIndex: z.string().nullish().default("0").transform(Number),
          limit: z
            .string()
            .nullish()
            .default("10")
            .transform(Number)
            .refine((val) => val >= 1 && val <= 100, {
              message: "Limit must be between 1 and 100",
            }),
        }),
        response: {
          200: z.object({
            attendees: z.array(
              z.object({
                id: z.number(),
                name: z.string(),
                email: z.string().email(),
                createdAt: z.date(),
                checkedInAt: z.date().nullable(),
              })
            ),
            pagination: z.object({
              pageIndex: z.number(),
              limit: z.number(),
              total: z.number(),
              totalPages: z.number(),
            }),
          }),
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: GetEventParams;
        Querystring: GetPageIndexQuery;
      }>,
      reply
    ) => {
      const { eventId } = request.params;
      const { pageIndex, query, limit } = request.query;

      const whereClause = query
        ? {
            eventId,
            name: {
              contains: query,
            },
          }
        : {
            eventId,
          };

      const totalCount = await prisma.attendee.count({
        where: whereClause,
      });

      const attendees = await prisma.attendee.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          checkIn: {
            select: {
              createdAt: true,
            },
          },
        },
        where: whereClause,
        take: limit,
        skip: pageIndex * limit,
        orderBy: {
          createdAt: "desc",
        },
      });

      const totalPages = Math.ceil(totalCount / limit);

      return reply.send({
        attendees: attendees.map((attendee) => {
          return {
            id: attendee.id,
            name: attendee.name,
            email: attendee.email,
            createdAt: attendee.createdAt,
            checkedInAt: attendee.checkIn?.createdAt ?? null,
          };
        }),
        pagination: {
          pageIndex,
          limit,
          total: totalCount,
          totalPages,
        },
      });
    }
  );
}
