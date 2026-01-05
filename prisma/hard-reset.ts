import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("⚠️ STARTING HARD RESET ⚠️");

    // 1. Delete all Stores (Cascades to Products, Orders, Customers, etc.)
    console.log("Deleting all Stores...");
    await prisma.store.deleteMany({});

    // 2. Delete all Users
    console.log("Deleting all Users...");
    await prisma.user.deleteMany({});

    // 3. Re-create Super Admin
    console.log("Seeding Super Admin...");
    await prisma.user.create({
        data: {
            email: "admin@shopry.app",
            name: "Super Admin",
            role: "PLATFORM_ADMIN",
            isPlatformAdmin: true,
            password: "password", // Placeholder, will use Magic Login
            isVerified: true
        }
    });

    console.log("✅ RESET COMPLETE. System is clean. Super Admin restored.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
