// Prisma 7: connection URL lives here, not in the schema datasource block.
// Schema migrations use the DIRECT (unpooled) Neon URL — the pooled URL breaks
// Prisma Migrate (prepared statements, session state). See neon-postgres skill.
// The app connects at runtime through the pooled DATABASE_URL via @prisma/adapter-pg.
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Neon CLI writes branch env to .env.local (or .env). The Prisma CLI does not
// load these by itself, so load them here.
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:
      process.env.DATABASE_URL_UNPOOLED ||
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=require",
  },
});
