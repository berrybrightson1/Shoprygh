"use server";

import prisma from "@/lib/prisma";
import { encrypt } from "@/lib/auth";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/audit";

export async function login(formData: FormData) {
    try {
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
            console.error("[LOGIN] Supabase Auth Error:", authError?.message);
            return { error: "Invalid email or password" };
        }

        // 2. Find Prisma User (Source of Truth for App Data)
        const user = await prisma.user.findUnique({
            where: { email }, // Link via email
            include: { store: true }
        });

        if (!user) {
            console.error("[LOGIN] User missing in Prisma but present in Supabase:", email);

            // SELF-HEALING: Auto-create the user and store to allow access ("record new signups but free access")
            // This handles cases where the signup transaction failed but Supabase user was created.
            try {
                console.log("[LOGIN] Attempting to self-heal orphaned account...");
                const newStoreName = `Store ${email.split('@')[0]}`;
                const newSlug = `store-${Date.now()}`; // Unique slug

                // Create Store & User in a transaction
                const result = await prisma.$transaction(async (tx) => {
                    const store = await tx.store.create({
                        data: {
                            name: newStoreName,
                            slug: newSlug,
                            tier: "HUSTLER", // Default free tier
                            address: "Digital Address",
                            isVerified: false,
                            status: "ACTIVE"
                        }
                    });

                    const newUser = await tx.user.create({
                        data: {
                            id: supabaseUser.id,
                            email: email,
                            password: "", // Managed by Supabase
                            name: supabaseUser.user_metadata?.display_name || email.split('@')[0],
                            role: "OWNER",
                            storeId: store.id,
                            isVerified: false
                        },
                        include: { store: true }
                    });

                    return newUser;
                });

                // Use the newly created user for the session
                // We need to re-assign 'user' (which is const), so we'll just use 'result' and update the flow below.
                // However, since 'user' is declared as const 'const user = ...', we cannot reassign it.
                // We will redirect recursively or handle session creation here.

                // Best approach: Recursively call login? No, infinite loop risk if it fails again.
                // Let's just update the local variables needed for session creation.

                // We can't update 'user' variable. 
                // We will proceed by creating the session manually with 'result' data

                const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
                const sessionPayload = {
                    id: result.id,
                    email: result.email,
                    name: result.name,
                    role: result.role,
                    isPlatformAdmin: result.isPlatformAdmin,
                    storeId: result.store?.id,
                    storeSlug: result.store?.slug,
                    phone: result.phone,
                    isVerified: result.isVerified,
                    expires
                };

                const session = await encrypt(sessionPayload);
                (await cookies()).set("session", session, { expires, httpOnly: true });

                const redirectTo = `/${result.store?.slug}/admin/inventory`;
                await logActivity("LOGIN", "Orphaned account self-healed", "USER", result.id);

                return { success: true, url: redirectTo };

            } catch (recoveryError) {
                console.error("[LOGIN RECOVERY FAILED]", recoveryError);
                return { error: "Account error. Please contact support." };
            }
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

    } catch (error: any) {
        console.error("[LOGIN CRITICAL FAILURE]", error);
        return {
            error: `Login failed: ${error.message || "Unknown server error"}`
        };
    }
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
