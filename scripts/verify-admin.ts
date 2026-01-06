
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual parser for .env.local
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
                    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
                    if (!process.env[key]) process.env[key] = value;
                }
            });
        }
    } catch (e) {
        console.error("Failed to load .env.local", e);
    }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// We specifically want to test the Service Role Key here
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Testing Service Role Key:");
console.log("URL:", SUPABASE_URL);
console.log("Key Length:", SERVICE_KEY ? SERVICE_KEY.length : 0);
console.log("Key Preview:", SERVICE_KEY ? SERVICE_KEY.substring(0, 10) + "..." : "Missing");

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("Missing credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function verifyAdmin() {
    // Try to list users - this requires Service Role permissions
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error("ADMIN CHECK FAILED:", error.message);
        console.error("The key provided is likely INVALID or has insufficient scopes.");
    } else {
        console.log("ADMIN CHECK SUCCESS!");
        console.log(`Found ${data.users.length} users.`);
    }
}

verifyAdmin();
