import "dotenv/config";
import { defineConfig } from "prisma/config";

const poolingUrl = process.env["POSTGRES_PRISMA_URL"] || "";
const directUrl = process.env["POSTGRES_URL_NON_POOLING"] || "";

// Sprawdzamy, czy kod uruchamia się na Vercelu
const isVercel = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

// Jeśli jesteśmy na Vercelu, używamy poolingUrl. 
// Jeśli lokalnie w terminalu (np. do migracji), używamy directUrl, żeby komenda nie wisiała.
const selectedDatabaseUrl = isVercel ? poolingUrl : (directUrl || poolingUrl);

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: selectedDatabaseUrl,
  },
});