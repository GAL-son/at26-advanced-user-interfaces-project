import "dotenv/config";
import { defineConfig } from "prisma/config";

function stripSslParams(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    url.searchParams.delete('sslmode');
    url.searchParams.delete('uselibpqcompat');
    return url.toString();
  } catch {
    return connectionString;
  }
}

// Wyciągamy URL niepoolowany i czyścimy go ze zbędnych flag dla CLI Prismy
const rawUrl = process.env["POSTGRES_URL_NON_POOLING"] || process.env["POSTGRES_PRISMA_URL"] || "";
const cleanUrl = stripSslParams(rawUrl);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: cleanUrl,
  },
});