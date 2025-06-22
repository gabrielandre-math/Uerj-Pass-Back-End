// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/server.ts",
    "src/lib/prisma.ts",
    "src/utils/**/*.ts",
    "src/routes/**/*.ts",
  ],
  clean: true,
  dts: false,
  format: ["cjs"], // ← usar CJS em vez de esm
  target: "es2022",
  platform: "node", // garante compatibilidade com Node
  external: ["@prisma/client"],
});
