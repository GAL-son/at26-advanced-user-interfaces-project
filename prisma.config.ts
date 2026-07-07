import { config } from "dotenv";
import path from "path";

// Wymuszamy załadowanie pliku .env z głównego katalogu ZANIM Prisma odczyta config
config({ path: path.resolve(process.cwd(), ".env") });

import { defineConfig } from "@prisma/config";

// 1. Definiujemy stan środowiska
const isDev = process.env["NODE_ENV"] === "development" || !process.env["NODE_ENV"];
const isVercel = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

let selectedDatabaseUrl = "";
let schemaPath = "prisma/schema.prisma";

if (isDev) {
  // ---- STRONA DEWELOPERSKA (SQLITE) ----
  selectedDatabaseUrl = process.env["SQLITE_DB_URL"] || "file:./prisma/dev.db";
  schemaPath = "prisma/schema.dev.prisma";
} else {
  // ---- STRONA PRODUKCYJNA (POSTGRESQL) ----
  const poolingUrl = process.env["POSTGRES_PRISMA_URL"] || "";
  const directUrl = process.env["POSTGRES_URL_NON_POOLING"] || "";

  const isMigrationCommand = process.argv.some(arg => arg.includes("migrate") || arg.includes("push"));
  selectedDatabaseUrl = isMigrationCommand ? (directUrl || poolingUrl) : poolingUrl;

  if (!isVercel && selectedDatabaseUrl.startsWith("postgres")) {
    try {
      const urlObj = new URL(selectedDatabaseUrl);
      urlObj.searchParams.set("sslmode", "require");
      urlObj.searchParams.set("uselibpqcompat", "true");
      
      if (!isMigrationCommand) {
        urlObj.searchParams.set("pgbouncer", "true");
      }
      selectedDatabaseUrl = urlObj.toString();
    } catch (e) {
      // Fail-safe
    }
  }
}

// 2. Eksport konfiguracji Prismy 7
export default defineConfig({
  schema: schemaPath,
  datasource: {
    url: selectedDatabaseUrl,
  },
});