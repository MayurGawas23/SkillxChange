import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";


console.log("DB URL:", process.env.DATABASE_URL);
// ✅ Create connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ✅ Create adapter
const adapter = new PrismaPg(pool);

// ✅ Singleton pattern (important)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}