import "dotenv/config";
import { defineConfig } from "prisma/config";

const poolingUrl = process.env["POSTGRES_PRISMA_URL"] || "";
const directUrl = process.env["POSTGRES_URL_NON_POOLING"] || "";

const isMigrationCommand = process.argv.some(arg => arg.includes("migrate") || arg.includes("push"));

let selectedDatabaseUrl = isMigrationCommand ? (directUrl || poolingUrl) : poolingUrl;

// Poprawka dla skryptów uruchamianych lokalnie (np. db:full-sync)
const isVercel = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

if (!isVercel && selectedDatabaseUrl.startsWith("postgres")) {
  try {
    const urlObj = new URL(selectedDatabaseUrl);
    // Te dwa parametry uciszają błąd certyfikatu i ostrzeżenie o pg-connection-string
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

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: selectedDatabaseUrl,
  },
});