import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

// Cached Session Interface (matches what the app expects)
export interface SessionData {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    role: string;
    isPlatformAdmin: boolean;
    storeId?: string;
    storeSlug?: string;
    phone?: string | null;
    isVerified?: boolean;
}

/**
 * Retrieves the current user session from Supabase and enriches it with Prisma data.
 * This replaces the old "double auth" cookie system.
 */
export async function getSession(): Promise<SessionData | null> {
    const supabase = await createClient();

    // 1. Check Supabase Auth (The Source of Truth)
    const { data: { user: authUser }, error } = await supabase.auth.getUser();

    if (error || !authUser || !authUser.email) {
        return null; // Not logged in
    }

    // 2. Fetch User Profile from Prisma (The Data Layer)
    // We look up by email because it's the stable link between the two systems
    try {
        const user = await prisma.user.findUnique({
            where: { email: authUser.email },
            include: { store: true }
        });

        if (!user) {
            // Edge case: Auth exists but Data missing (The "Config Error" scenario)
            // We return null so the user is forced to re-login/signup or hit the self-healing flow
            return null;
        }

        // 3. Return Normalized Session Data
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role, // OWNER or STAFF
            isPlatformAdmin: user.isPlatformAdmin,
            storeId: user.store?.id,
            storeSlug: user.store?.slug,
            phone: user.phone,
            isVerified: user.isVerified
        };

    } catch (dbError) {
        console.error("Session DB Fetch Error:", dbError);
        return null;
    }
}
