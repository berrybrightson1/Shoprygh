/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.user.count();
    console.log(`Found ${count} users.`);

    if (count === 0) {
        console.log('Creating default admin user...');
        const hashedPassword = await hash('admin123', 10);
        await prisma.user.create({
            data: {
                email: 'admin@anaya.com',
                name: 'Mama Anaya',
                role: 'Owner Access',
                password: hashedPassword,
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
