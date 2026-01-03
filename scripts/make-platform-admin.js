// Run this script to make yourself a Platform Admin
// Usage: node scripts/make-platform-admin.js YOUR_EMAIL@example.com

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makePlatformAdmin() {
    const email = process.argv[2];

    if (!email) {
        console.error('❌ Please provide an email address');
        console.log('Usage: node scripts/make-platform-admin.js YOUR_EMAIL@example.com');
        process.exit(1);
    }

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { isPlatformAdmin: true },
        });

        console.log('✅ Platform Admin access granted!');
        console.log(`📧 Email: ${user.email}`);
        console.log(`👤 Name: ${user.name}`);
        console.log('🔓 Access: /platform-admin');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Make sure the email exists in the database');
    } finally {
        await prisma.$disconnect();
    }
}

makePlatformAdmin();
