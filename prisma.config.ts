import "dotenv/config";
import { defineConfig } from "prisma/config";

const poolingUrl = process.env["POSTGRES_PRISMA_URL"] || "";
const directUrl = process.env["POSTGRES_URL_NON_POOLING"] || "";

// Sprawdzamy, czy aktualnie uruchomiona komenda to migracja (np. migrate deploy lub migrate dev)
// Szukamy frazy 'migrate' w argumentach procesowych Node.js
const isMigrationCommand = process.argv.some(arg => arg.includes("migrate") || arg.includes("push"));

// Do migracji ZAWSZE potrzebujemy directUrl (port 5432), niezależnie czy to Vercel, czy lokalny komputer.
// Do generowania klienta i działania aplikacji na Vercelu używamy poolingUrl (6543).
const selectedDatabaseUrl = isMigrationCommand ? (directUrl || poolingUrl) : poolingUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: selectedDatabaseUrl,
  },
});