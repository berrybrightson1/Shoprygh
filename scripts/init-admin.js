/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.user.count();
    console.log(`Found ${count} users.`);

    if (count === 0) {
        console.log('Creating default admin store and user...');

        // 1. Create Default Store
        const store = await prisma.store.create({
            data: {
                name: 'Anaya Admin',
                slug: 'admin',
                tier: 'WHOLESALER',
            }
        });

        // 2. Create Admin User linked to Store
        const hashedPassword = await hash('admin123', 10);
        await prisma.user.create({
            data: {
                email: 'admin@anaya.com',
                name: 'Mama Anaya',
                role: 'OWNER', // Fixed role enum/string
                password: hashedPassword,
                storeId: store.id,
            },
        });
        console.log('Created user: admin@anaya.com / admin123');
    } else {
        console.log('Users already exist. Skipping default setup.');
    }

    // 3. ALWAYS Ensure Dev Platform Admin Exists
    const devEmail = 'dev@shopry.app';
    const devPassword = 'DevAccess2024!';
    const devHashed = await hash(devPassword, 10);

    // Ensure Platform HQ Store exists (Required by Schema: User -> Store relation is mandatory)
    const hqStore = await prisma.store.upsert({
        where: { slug: 'shopry-hq' },
        update: {},
        create: {
            name: 'Shopry HQ',
            slug: 'shopry-hq',
            tier: 'WHOLESALER',
            ownerPhone: '0000000000'
        }
    });

    const devUser = await prisma.user.upsert({
        where: { email: devEmail },
        update: {
            password: devHashed,
            isPlatformAdmin: true,
            role: 'PLATFORM_ADMIN'
        },
        create: {
            email: devEmail,
            name: 'Shopry Dev',
            password: devHashed,
            role: 'PLATFORM_ADMIN',
            isPlatformAdmin: true,
            storeId: hqStore.id
        },
    });
    console.log(`✅ Ensured Dev Admin exists: ${devEmail} (ID: ${devUser.id}) linked to ${hqStore.name}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
