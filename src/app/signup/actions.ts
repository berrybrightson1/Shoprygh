"use server";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StoreTier } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";

export async function createStore(formData: FormData) {
    let authUser: User | null = null;

    try {
        const supabase = await createClient();

        // 1. Extract Data
        const storeName = formData.get("storeName") as string;
        const storeSlug = (formData.get("storeSlug") as string).trim();
        const storeAddress = (formData.get("storeAddress") as string).trim();
        const ownerName = formData.get("ownerName") as string;
        const email = (formData.get("email") as string).trim().toLowerCase();
        const password = formData.get("password") as string;
        const tier = (formData.get("tier") as any) || "HUSTLER";
        const avatar = formData.get("avatar") as string;

        if (!storeName || !storeSlug || !email || !password || !ownerName || !storeAddress) {
            return { error: "Missing required fields" };
        }

        // 2. Validate Uniqueness
        const existingStore = await prisma.store.findUnique({ where: { slug: storeSlug } });
        if (existingStore) return { error: "Store URL is already taken." };

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return { error: "Email is already registered. Please login." };

        // 3. Create Supabase Auth User
        // Try Admin Client first to skip verification
        let adminSupabase = null;
        try {
            const { createAdminClient } = await import("@/lib/supabase/admin");
            adminSupabase = createAdminClient();
        } catch (e) {
            console.warn("Failed to load admin client", e);
        }

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
                const { data: listData, error: listError } = await adminSupabase.auth.admin.listUsers();

                if (listError) {
                    console.error("Failed to list users for cleanup:", listError);
                } else if (listData && listData.users) {
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
            console.error("[SIGNUP] Auth Error:", authErrorMsg);
            return { error: authErrorMsg };
        }
        if (!authUser) return { error: "Failed to create account (Auth provider error)." };

        console.log("[SIGNUP] Auth Successful. Proceeding to Prisma Transaction...");
        const user = authUser;

        // 4. Create Prisma Data (Transaction)
        try {
            await prisma.$transaction(async (tx) => {
                console.log("[SIGNUP] Creating Store record...");
                // Create Store
                const store = await tx.store.create({
                    data: {
                        name: storeName,
                        slug: storeSlug,
                        tier: tier,
                        address: storeAddress,
                        isVerified: false,
                        status: "ACTIVE"
                    }
                });

                console.log("[SIGNUP] Creating User record...");
                // Create User (Owner)
                await tx.user.create({
                    data: {
                        id: user.id,
                        email,
                        password: "",
                        name: ownerName,
                        role: "OWNER",
                        storeId: store.id,
                        isVerified: false,
                        image: avatar,
                    }
                });
            }, {
                timeout: 10000 // 10 second timeout for transaction
            });

            console.log("[SIGNUP] Database Transaction Complete. Attempting Auto-Login...");

            // 5. Auto-Login
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) {
                console.warn("[SIGNUP] Auto-login failed (Data created though):", signInError.message);
                return { success: true, redirectUrl: "/login" };
            }

            console.log("[SIGNUP] Signup Lifecycle Complete.");

        } catch (error: any) {
            console.error("[SIGNUP] Transaction/Post-Process Error:", error);

            // ROLLBACK: Attempt to delete the Supabase user if they were created but DB failed
            if (authUser && authUser.id && adminSupabase) {
                try {
                    console.log("[SIGNUP] Rolling back Supabase user...");
                    await adminSupabase.auth.admin.deleteUser(authUser.id);
                } catch (cleanupError) {
                    console.error("[SIGNUP] CRITICAL: Rollback failed for ID:", authUser.id);
                }
            }

            return { error: `Database Error: ${error.message || "Failed to set up store data."}` };
        }

        return { success: true, redirectUrl: `/${storeSlug}/admin/inventory` };

    } catch (error: any) {
        console.error("[SIGNUP CRITICAL FAILURE]", error);
        return { error: `System Error: ${error.message || "Unknown error occurred"}` };
    }
}
