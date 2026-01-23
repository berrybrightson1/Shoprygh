const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking for 'amaghana' slug...");
    const store = await prisma.store.findUnique({
        where: { slug: 'amaghana' }
    });
    console.log("Store found:", !!store);
    if (store) console.log(JSON.stringify(store, null, 2));

    console.log("\nChecking for 'amaghana@gmail.com' email...");
    const user = await prisma.user.findUnique({
        where: { email: 'amaghana@gmail.com' }
    });
    console.log("User found:", !!user);
    if (user) console.log(JSON.stringify(user, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
