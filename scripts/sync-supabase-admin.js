const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

// Simple .env parser
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '../.env');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf8');
            envConfig.split(/\r?\n/).forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^['"]|['"]$/g, '');
                    if (!process.env[key]) process.env[key] = value;
                }
            });
        }
    } catch (e) {
        console.warn("Error loading .env", e);
    }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('ERROR: Missing Supabase env vars!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const prisma = new PrismaClient();

async function main() {
    const email = 'dev@shopry.app';
    const password = 'DevAccess2024!';

    console.log(`[1/3] Connecting to Supabase...`);

    // 1. Supabase Sync
    try {
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
        if (listError) throw listError;

        const existingUser = users.find(u => u.email === email);
        let userId;

        if (existingUser) {
            console.log(`   User found (ID: ${existingUser.id}). Updating password...`);
            const { error } = await supabase.auth.admin.updateUserById(
                existingUser.id,
                { password: password, email_confirm: true }
            );
            if (error) throw error;
            userId = existingUser.id;
            console.log('   ✅ Password updated in Supabase.');
        } else {
            console.log('   User not found. Creating in Supabase...');
            const { data, error } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { display_name: 'Shopry Dev' }
            });
            if (error) throw error;
            userId = data.user.id;
            console.log('   ✅ User created in Supabase.');
        }
    } catch (e) {
        console.error("   ❌ Supabase Error:", e.message);
        // We continue to try Prisma update just in case, but warn user
    }

    // 2. Prisma Sync
    console.log(`[2/3] Connecting to Prisma DB...`);
    try {
        await prisma.$connect();

        console.log('   Upserting Store...');
        // Ensure System Store
        const store = await prisma.store.upsert({
            where: { slug: 'shopry-hq' },
            update: {},
            create: {
                name: 'Shopry HQ',
                slug: 'shopry-hq',
                tier: 'WHOLESALER',
                ownerPhone: '0000000000',
                address: 'Headquarters' // Added required field based on schema? Schema says address is String (required)
            }
        });

        console.log('   Upserting User...');
        // Upsert User
        await prisma.user.upsert({
            where: { email },
            update: {
                isPlatformAdmin: true,
                role: 'OWNER',
                storeId: store.id
            },
            create: {
                email,
                name: 'Shopry Dev',
                password: '', // Managed by Supabase
                role: 'OWNER',
                isPlatformAdmin: true,
                storeId: store.id
            },
        });
        console.log('   ✅ Prisma updated.');
    } catch (e) {
        console.error("   ❌ Prisma Error:", e);
        throw e;
    }

    console.log('\n[3/3] DONE.');
    console.log(' Credentials:');
    console.log(` Email:    ${email}`);
    console.log(` Password: ${password}`);
}

main()
    .catch((e) => {
        console.error("\nCRITICAL FAILURE:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
