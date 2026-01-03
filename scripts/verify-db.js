const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log("🔄 Attempting to connect to Supabase...");
    try {
        const storeCount = await prisma.store.count();
        const userCount = await prisma.user.count();
        console.log(`✅ Connection Successful!`);
        console.log(`📊 Current Stats:`);
        console.log(`   - Stores: ${storeCount}`);
        console.log(`   - Users: ${userCount}`);

        if (storeCount > 0) {
            const firstStore = await prisma.store.findFirst();
            console.log(`ℹ️ Sample Store: ${firstStore.name} (Slug: ${firstStore.slug})`);
        }
    } catch (e) {
        console.error("❌ Connection Failed:", e.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
