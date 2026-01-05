"use server";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StoreTier } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";

export async function createStore(formData: FormData) {
    const supabase = await createClient();

    // 1. Extract Data
    const storeName = formData.get("storeName") as string;
    const storeSlug = (formData.get("storeSlug") as string).trim();
    const ownerName = formData.get("ownerName") as string;
    const email = (formData.get("email") as string).trim().toLowerCase();
    const password = formData.get("password") as string;
    const tier = (formData.get("tier") as any) || "HUSTLER";
    const avatar = formData.get("avatar") as string;

    if (!storeName || !storeSlug || !email || !password || !ownerName) {
        throw new Error("Missing required fields");
    }

    // 2. Validate Uniqueness
    const existingStore = await prisma.store.findUnique({ where: { slug: storeSlug } });
    if (existingStore) throw new Error("Store URL is already taken.");

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("Email is already registered. Please login.");

    // 3. Create Supabase Auth User
    // Try Admin Client first to skip verification
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const adminSupabase = createAdminClient();

    let authUser = null;
    let authErrorMsg = null;

    if (adminSupabase) {
        console.log("Using Admin Client for Signup (Auto-Confirming Email)...");

        // Helper to Create
        const tryCreate = async () => await adminSupabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Bypass verification
            user_metadata: { display_name: ownerName }
        });

        let { data, error } = await tryCreate();

        // HANDLE ORPHANED SUPABASE USERS (Leftover from Hard Reset)
        if (error && error.message?.includes("already been registered")) {
            console.warn("Orphaned Supabase user found. Cleaning up...");
            // We know they are not in Prisma (checked above), so delete from Supabase
            // Unfortunately no direct 'getUserByEmail' in Admin API, so we list (inefficient but works for recovery)
            const { data: listData } = await adminSupabase.auth.admin.listUsers();
            const orphan = listData.users.find(u => u.email?.toLowerCase() === email);

            if (orphan) {
                await adminSupabase.auth.admin.deleteUser(orphan.id);
                console.log("Orphan deleted. Retrying creation...");
                // Retry creation
                const retry = await tryCreate();
                data = retry.data;
                error = retry.error;
            }
        }

        if (error) authErrorMsg = error.message;
        authUser = data?.user;
    } else {
        console.log("Using Standard Client for Signup (Verification likely required)...");
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { display_name: ownerName }
            }
        });
        if (error) authErrorMsg = error.message;
        authUser = data?.user;
    }

    if (authErrorMsg) {
        throw new Error(authErrorMsg);
    }

    if (!authUser) {
        throw new Error("Failed to create account.");
    }

    // 4. Create Prisma Data (Transaction)
    try {
        await prisma.$transaction(async (tx) => {
            // Create Store
            const store = await tx.store.create({
                data: {
                    name: storeName,
                    slug: storeSlug,
                    tier: tier,
                    isVerified: false, // Default to false, but allow operation
                    status: "ACTIVE"
                }
            });

            // Create User (Owner)
            await tx.user.create({
                data: {
                    id: authUser.id, // Sync ID
                    email,
                    password: "", // We don't store pw hash here (Supabase handles it)
                    name: ownerName,
                    role: "OWNER",
                    storeId: store.id,
                    isVerified: false,
                    image: avatar, // Save avatar URL
                }
            });
        });

        // 5. Auto-Login
        // Now that the user exists, log them in to set the session cookie
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (signInError) {
            console.error("Auto-login failed:", signInError);
            // Fallback to login page if auto-login fails
            return { success: true, redirectUrl: "/login" };
        }

    } catch (error: any) {
        console.error("Signup Transaction Error:", error);

        // ROLLBACK: Attempt to delete the Supabase user so they can try again
        if (authUser && authUser.id) {
            try {
                // Ensure we have the admin client
                const { createAdminClient } = await import("@/lib/supabase/admin");
                const cleanupSupabase = createAdminClient();
                if (cleanupSupabase) {
                    console.log("Rolling back Supabase user creation...");
                    await cleanupSupabase.auth.admin.deleteUser(authUser.id);
                }
            } catch (cleanupError) {
                console.error("CRITICAL: Failed to rollback Supabase user. Manual cleanup required for ID:", authUser.id);
            }
        }

        throw new Error("Failed to set up store data. Please contact support.");
    }

    // 6. Return Success & URL (Let client handle redirect for UX)
    return { success: true, redirectUrl: `/${storeSlug}/admin/inventory` };
}
