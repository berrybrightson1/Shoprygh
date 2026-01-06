
import { createClient } from '@supabase/supabase-js';
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // using ANON key like client

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Missing Supabase credentials");
    console.log("URL:", SUPABASE_URL);
    console.log("ANON:", SUPABASE_ANON_KEY ? "[Present]" : "[Missing]");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verify() {
    console.log(`Testing Login against: ${SUPABASE_URL.substring(0, 20)}...`);

    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test-seller@shopry.com',
        password: 'password123'
    });

    if (error) {
        console.error("LOGIN FAILED:", error.message);
    } else {
        console.log("LOGIN SUCCESS!");
        console.log("User ID:", data.user?.id);
    }
}

verify();
