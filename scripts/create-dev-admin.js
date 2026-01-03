const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'dev@shopry.app';
    const password = 'DevAccess2024!';

    console.log(`creating dev user: ${email}...`);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            isPlatformAdmin: true,
            role: 'PLATFORM_ADMIN' // Setting role too for clarity, though bool is what we check
        },
        create: {
            email,
            name: 'Shopry Dev',
            password: hashedPassword,
            role: 'PLATFORM_ADMIN',
            isPlatformAdmin: true,
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
