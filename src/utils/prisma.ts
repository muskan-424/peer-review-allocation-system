import { PrismaClient } from "@prisma/client";

// Singleton – reuse the same connection across the app
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
});

export default prisma;
