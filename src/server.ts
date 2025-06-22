// Importa o framework Fastify
import fastify from "fastify";

// Importa os compiladores de validação e serialização do Zod para Fastify
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

// Importa a função utilitária para gerar slugs
import { createEvent } from "./routes/create-event";
import { registerForEvent } from "./routes/register-for-event";
import { getEvent } from "./routes/get-event";
import { getAttendeeBadge } from "./routes/get-attendee-badge";

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createEvent);
app.register(registerForEvent);
app.register(getEvent);
app.register(getAttendeeBadge);

app.listen({ port: 3333 }).then(() => {
  console.log("HTTP server running!");
});
