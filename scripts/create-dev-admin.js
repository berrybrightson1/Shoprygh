const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'dev@shopry.app';
    const password = 'DevAccess2024!';

    console.log(`creating dev user: ${email}...`);

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Ensure a System Store exists
    const store = await prisma.store.upsert({
        where: { slug: 'shopry-hq' },
        update: {},
        create: {
            name: 'Shopry HQ',
            slug: 'shopry-hq',
            tier: 'WHOLESALER',
            ownerPhone: '0000000000'
        }
    });

    console.log(`Using System Store: ${store.name} (${store.id})`);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            isPlatformAdmin: true,
            role: 'OWNER',
            storeId: store.id // Ensure link on update
        },
        create: {
            email,
            name: 'Shopry Dev',
            password: hashedPassword,
            role: 'OWNER',
            isPlatformAdmin: true,
            storeId: store.id
        },
    });

    console.log('✅ Dev User Created/Updated!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('Login at: /login');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
