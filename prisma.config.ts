import "dotenv/config";
import { defineConfig } from "prisma/config";

// Pobieramy Twój główny link z portem 6543
let databaseUrl = process.env["POSTGRES_PRISMA_URL"] || "";

// Jeśli link zawiera port poolera (6543), podmieniamy go na bezpośredni port bazy (5432)
// To pozwoli komendzie `prisma db push` przejść natychmiast bez zawieszania się!
if (databaseUrl.includes(":6543")) {
  databaseUrl = databaseUrl.replace(":6543", ":5432");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});