
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Manual parser for .env files
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf-8');
            content.split('\n').forEach(line => {
                const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
                if (match) {
                    const key = match[1];
                    let value = match[2] ? match[2].trim() : '';
                    if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.slice(1, -1);
                    }
                    if (!process.env[key]) {
                        process.env[key] = value;
                    }
                }
            });
            console.log("Loaded .env.local");
        }
    } catch (e) {
        console.error("Failed to load .env.local manually", e);
    }
}

loadEnv();

const prisma = new PrismaClient();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase credentials in .env.local (or env)");
    // Dump keys for debugging (masked)
    console.log("Keys found:", Object.keys(process.env).filter(k => k.includes("SUPABASE")));
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function main() {
    const EMAIL = "test-seller@shopry.com";
    const PASSWORD = "password123";
    const STORE_NAME = "Test Store";
    const STORE_SLUG = "test-store";
    const OWNER_NAME = "Test Seller";

    console.log(`Creating user: ${EMAIL}...`);

    // 1. Check if Supabase user exists (or create)
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error("Error listing users:", listError);
        process.exit(1);
    }

    let userId;
    const existingUser = users.find(u => u.email === EMAIL);

    if (existingUser) {
        console.log("Supabase user already exists.");
        userId = existingUser.id;
        // Optional: Update password to ensure it's known
        await supabase.auth.admin.updateUserById(userId, { password: PASSWORD });
    } else {
        const { data, error } = await supabase.auth.admin.createUser({
            email: EMAIL,
            password: PASSWORD,
            email_confirm: true,
            user_metadata: { display_name: OWNER_NAME }
        });

        if (error) {
            console.error("Error creating Supabase user:", error);
            process.exit(1);
        }
        userId = data.user.id;
        console.log("Supabase user created.");
    }

    // 2. Check/Create Store and Prisma User
    try {
        await prisma.$transaction(async (tx) => {
            // Create Store if not exists
            let store = await tx.store.findUnique({ where: { slug: STORE_SLUG } });
            if (!store) {
                store = await tx.store.create({
                    data: {
                        name: STORE_NAME,
                        slug: STORE_SLUG,
                        tier: "PRO", // Give them PRO for testing
                        isVerified: true,
                        status: "ACTIVE"
                    }
                });
                console.log("Store created.");
            } else {
                console.log("Store already exists.");
            }

            // Create/Update User
            const user = await tx.user.findUnique({ where: { email: EMAIL } });
            if (!user) {
                await tx.user.create({
                    data: {
                        id: userId,
                        email: EMAIL,
                        name: OWNER_NAME,
                        role: "OWNER",
                        storeId: store.id,
                        isVerified: true,
                        image: "",
                        password: "" // Not used
                    }
                });
                console.log("Prisma user created linked to store.");
            } else {
                // Ensure linked correctly if existed
                await tx.user.update({
                    where: { email: EMAIL },
                    data: { storeId: store.id, id: userId }
                });
                console.log("Prisma user updated.");
            }
        });

        console.log("\nSUCCESS! Credentials:");
        console.log(`Email: ${EMAIL}`);
        console.log(`Password: ${PASSWORD}`);
        console.log(`Store URL: http://localhost:3000/${STORE_SLUG}`);

    } catch (e) {
        console.error("Prisma Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
