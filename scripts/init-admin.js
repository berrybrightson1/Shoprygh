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
        console.log('Users already exist. No action taken.');
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
