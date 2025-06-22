// Importa o framework Fastify
import fastify, { FastifyInstance, FastifyRequest } from "fastify";

// Cria a instância do Fastify
const app = fastify();

// Configura os compiladores de validação e serialização do Zod para Fastify
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Importa o Zod para validação de dados
import { z } from "zod";

// Importa os compiladores de validação e serialização do Zod para Fastify
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { generateSlug } from "../utils/generate-slug";

// Importa o cliente Prisma para acesso ao banco de dados
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

type CreateEventBody = {
  title: string;
  details: string | null;
  maximumAttendees: number | null;
};

export async function createEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/events",
    {
      schema: {
        body: z.object({
          title: z.string().min(4),
          details: z.string().nullable(),
          maximumAttendees: z.number().int().positive().nullable(),
        }),
        response: {
          201: z.object({
            eventId: z.string().uuid(),
          }),
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateEventBody }>, reply) => {
      const { title, details, maximumAttendees } = request.body;

      const slug = generateSlug(title);

      const eventWithSameSlug = await prisma.event.findUnique({
        where: {
          slug: slug,
        },
      });

      if (eventWithSameSlug !== null) {
        throw new Error("Another event with same title already exists.");
      }

      const event = await prisma.event.create({
        data: {
          title,
          details,
          maximumAttendees,
          slug,
        },
      });
      return reply.status(201).send({
        eventId: event.id,
      });
    }
  );
}
