
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.auditLog.count();
        console.log(`Total Audit Logs: ${count}`);

        const logs = await prisma.auditLog.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: true }
        });

        console.log("Recent Logs:", JSON.stringify(logs, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
