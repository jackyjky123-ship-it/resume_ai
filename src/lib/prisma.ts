import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Reuse one Prisma Client across hot reloads in development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function normalizeConnectionString(rawUrl: string): string {
  // pg-connection-string treats 'require' as 'verify-full' and logs a deprecation warning
  // unless 'sslmode=verify-full' or 'uselibpqcompat=true' is explicitly specified.
  // Neon hosts use trusted TLS certificates, so 'verify-full' maintains full security
  // and prevents the upcoming breaking change warning in pg/pg-connection-string.
  return rawUrl.replace(/([?&]sslmode=)require\b/, "$1verify-full");
}

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Run `neon deploy` or `neon env pull` to load Neon variables."
    );
  }

  const adapter = new PrismaPg({ connectionString: normalizeConnectionString(connectionString) });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
