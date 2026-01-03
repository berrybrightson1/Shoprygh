const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'dev@shopry.app';
    const password = 'DevAccess2024!';

    console.log(`Checking login for: ${email}`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: { store: true }
    });

    if (!user) {
        console.log('❌ User not found');
        return;
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (isValid) {
        console.log('✅ Password MATCHES!');
        console.log(`Is Platform Admin: ${user.isPlatformAdmin}`);
        console.log(`Has Store: ${!!user.store}`);

        if (!user.store && !user.isPlatformAdmin) {
            console.log('⚠️ Login logic would FAIL: No store and not platform admin');
        } else {
            console.log('🚀 Login logic should SUCCEED');
        }
    } else {
        console.log('❌ Password DOES NOT match');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
