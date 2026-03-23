import { PrismaClient } from '@prisma/client';
import { config } from './index';

// Create Prisma client with logging in development
const prisma = new PrismaClient({
  log: config.isDevelopment ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Gatewayful shutdown handling
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma };
