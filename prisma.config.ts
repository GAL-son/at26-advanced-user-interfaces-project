import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Korzystamy bezpośrednio z głównego linku, który na Vercelu na pewno działa
    url: process.env["POSTGRES_PRISMA_URL"],
  },
});