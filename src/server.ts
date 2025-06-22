// Importa o framework Fastify
import fastify from "fastify";

// Importa os compiladores de validação e serialização do Zod para Fastify
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

// Importa a função utilitária para gerar slugs
import { createEvent } from "./routes/create-event";

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createEvent);

app.listen({ port: 3333 }).then(() => {
  console.log("HTTP server running!");
});
