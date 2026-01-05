"use server";

import prisma from "@/lib/prisma";
import { encrypt } from "@/lib/auth";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/audit";

export async function login(formData: FormData) {
    const supabase = await createClient();

    const email = (formData.get("email") as string).trim().toLowerCase();
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email and password are required" };
    }

    // 1. Authenticate with Supabase
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (authError || !supabaseUser) {
        return { error: "Invalid email or password" };
    }

    // 2. Find Prisma User (Source of Truth for App Data)
    const user = await prisma.user.findUnique({
        where: { email }, // Link via email
        include: { store: true }
    });

    if (!user) {
        // Edge case: User in Supabase but not Prisma?
        return { error: "Account config error. Contact support." };
    }

    // Check for Store OR Platform Admin privileges
    if (!user.store && !user.isPlatformAdmin) {
        return { error: "No store account found. Please signup." };
    }

    // 3. Create Legacy Session (Bridge for existing App Logic)
    // We keep this so we don't have to refactor every `getSession` call right now.
    // The "True" session is Supabase (checked here), this is just a cached claim.
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    const sessionPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isPlatformAdmin: user.isPlatformAdmin,
        storeId: user.store?.id,
        storeSlug: user.store?.slug,
        phone: user.phone,
        isVerified: user.isVerified, // Trust Prisma state
        expires
    };

    const session = await encrypt(sessionPayload);
    (await cookies()).set("session", session, { expires, httpOnly: true });


    // 4. Return Redirect URL
    let redirectTo = '/login';
    if (user.isPlatformAdmin) {
        redirectTo = '/platform-admin';
        await logActivity("LOGIN", "Super Admin logged in", "USER", user.id);
    } else if (user.store) {
        redirectTo = `/${user.store.slug}/admin/inventory`;
        await logActivity("LOGIN", `User logged into store: ${user.store.name}`, "STORE", user.store.id);
    } else {
        await logActivity("LOGIN", "User logged in (No Store)", "USER", user.id);
    }

    return { success: true, url: redirectTo };
}

export async function magicAdminLogin() {
    // DEV ONLY: Bypass for 'admin@shopry.app'
    const email = "admin@shopry.app";

    // 1. Find User
    const user = await prisma.user.findUnique({
        where: { email },
        include: { store: true }
    });

    if (!user) {
        return { error: "Admin user not found. Did you run the reset script?" };
    }

    // 2. Create Session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const sessionPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isPlatformAdmin: user.isPlatformAdmin,
        expires
    };

    const session = await encrypt(sessionPayload);
    (await cookies()).set("session", session, { expires, httpOnly: true });

    return { success: true, url: "/platform-admin" };
}
