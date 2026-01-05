
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Testing direct Prisma create...");
    try {
        // Need a valid user ID first
        const user = await prisma.user.findFirst();
        if (!user) {
            console.error("No users found in DB to attach log to!");
            return;
        }
        console.log("Found user:", user.email);

        const log = await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: "TEST_ACTION",
                description: "Manual test log from script",
                entityType: "SYSTEM",
                entityId: "TEST"
            }
        });
        console.log("Successfully created log:", log.id);

    } catch (e) {
        console.error("Failed to create log:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
