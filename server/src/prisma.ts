import { PrismaClient } from '@prisma/client'

// A single shared PrismaClient for the whole process (a new client per request
// would exhaust the database's connection pool).
export const prisma = new PrismaClient()
