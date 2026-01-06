import { PrismaClient, StoreTier, VerificationStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const password = await hash("password", 12);

    const store = await prisma.store.create({
        data: {
            name: "Anaya Baby Care",
            slug: "amaghana",
            tier: StoreTier.HUSTLER,
            status: "ACTIVE",
            address: "123 Test Street, Accra",
            verificationStatus: VerificationStatus.UNVERIFIED, // Default for testing
            users: {
                create: {
                    name: "Test User",
                    email: "test@example.com",
                    password: password,
                    role: "OWNER",
                },
            },
        },
    });

    console.log("Restored store:", store.name);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
