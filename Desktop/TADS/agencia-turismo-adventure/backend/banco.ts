import { PrismaClient } from "@prisma/client";

/** Reutiliza a conexão com o banco durante o desenvolvimento. */
const prismaGlobal = globalThis as unknown as { prisma?: PrismaClient };

/** Disponibiliza o Prisma para as rotas da aplicação. */
export const prisma = prismaGlobal.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") prismaGlobal.prisma = prisma;
