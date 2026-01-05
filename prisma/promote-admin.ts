import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TARGET_EMAIL = "berrybrightson@gmail.com";

async function main() {
    console.log(`Checking for user: ${TARGET_EMAIL}...`);

    const user = await prisma.user.findUnique({
        where: { email: TARGET_EMAIL }
    });

    if (user) {
        console.log("User found. Promoting to Platform Admin...");
        await prisma.user.update({
            where: { email: TARGET_EMAIL },
            data: {
                isPlatformAdmin: true,
                role: "PLATFORM_ADMIN" // Optional, if this enum exists or string is used
            }
        });
        console.log("SUCCESS: User promoted to Platform Admin.");
    } else {
        console.log("User NOT found. Creating placeholder Admin user...");
        // If user doesn't exist, we can create them OR just rely on admin@shopry.app
        console.log("Please sign up first with this email, or login with 'admin@shopry.app'");
    }

    // Also verify admin@shopry.app exists
    const defaultAdmin = await prisma.user.findUnique({ where: { email: "admin@shopry.app" } });
    if (defaultAdmin) {
        console.log("Confimred: Default admin 'admin@shopry.app' exists and isPlatformAdmin=" + defaultAdmin.isPlatformAdmin);
    } else {
        console.log("WARNING: Default admin 'admin@shopry.app' does NOT exist.");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
