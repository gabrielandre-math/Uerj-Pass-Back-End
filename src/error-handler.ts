import { FastifyInstance } from "fastify";
import { BadRequest } from "./routes/_erorrs/bad-request";
import { ZodError } from "zod";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  // Erro de validação do Fastify (gerado pelo fastify-type-provider-zod)
  if (
    error.statusCode === 400 &&
    (error as any).code === "FST_ERR_VALIDATION"
  ) {
    const validationErrors = (error as any).validation;
    const errors: Record<string, string[]> = {};

    // Transforma os erros em formato simples: campo -> array de mensagens
    validationErrors.forEach((err: any) => {
      const field = err.instancePath.replace("/", "") || "root";
      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field].push(err.message);
    });

    return reply.status(400).send({
      message: "Error during validation",
      errors: errors,
    });
  }

  // Erro direto do Zod (fallback)
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Error during validation",
      errors: error.flatten(),
    });
  }

  // Erro customizado BadRequest
  if (error instanceof BadRequest) {
    return reply.status(400).send({ message: error.message });
  }

  // Erro genérico
  return reply.status(500).send({ message: "Internal server error!" });
};
