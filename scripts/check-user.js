const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'dev@shopry.app';
    const user = await prisma.user.findUnique({
        where: { email },
        include: { store: true }
    });

    if (user) {
        console.log(`✅ User found: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`Is Platform Admin: ${user.isPlatformAdmin}`);
        console.log(`Store: ${user.store ? user.store.slug : 'None (Correct for Dev Admin)'}`);
    } else {
        console.log('❌ User NOT found');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
