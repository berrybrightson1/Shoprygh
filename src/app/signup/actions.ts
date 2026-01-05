"use server";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StoreTier } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";

export async function createStore(formData: FormData) {
    const supabase = await createClient();

    const storeName = formData.get("storeName") as string;
    const storeSlug = formData.get("storeSlug") as string;
    const ownerName = formData.get("ownerName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const tier = (formData.get("tier") as StoreTier) || StoreTier.HUSTLER;
    const avatar = formData.get("avatar") as string;
    const phone = formData.get("phone") as string;

    if (!storeName || !storeSlug || !ownerName || !email || !password) {
        throw new Error("All fields are required");
    }

    // 1. Get current Supabase user (if they verified email via OTP)
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

    let userId = supabaseUser?.id;
    let userEmail = supabaseUser?.email || email;

    // 2. If NOT logged in, try to sign up (Password flow fallback)
    // Note: If they verified via OTP, they are logged in.
    if (!supabaseUser) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: ownerName,
                    phone: phone, // Store phone in metadata
                }
            }
        });

        if (signUpError) throw new Error(signUpError.message);
        if (signUpData.user) {
            userId = signUpData.user.id;
            userEmail = signUpData.user.email!;
        } else {
            // Should not happen if no error
            throw new Error("Failed to create account");
        }
    } else {
        // If already logged in, update metadata if needed (optional)
        // await supabase.auth.updateUser({ data: { full_name: ownerName } });
    }

    // 3. Check for existing store/user in PRISMA
    const existingStore = await prisma.store.findUnique({ where: { slug: storeSlug } });
    if (existingStore) throw new Error("Store URL is already taken");

    const existingPrismaUser = await prisma.user.findUnique({ where: { email: userEmail } });
    if (existingPrismaUser) {
        // If user exists in Prisma but we are creating a store, maybe allow?
        // For now, throw if email registered to ensure 1:1 or specific logic
        throw new Error("Email is already registered in our system");
    }

    // 4. Create Store & User in Prisma
    await prisma.$transaction(async (tx) => {
        const store = await tx.store.create({
            data: {
                name: storeName,
                slug: storeSlug,
                tier: tier,
            }
        });

        await tx.user.create({
            data: {
                name: ownerName,
                email: userEmail,
                phone: phone,
                password: "SUPABASE_MANAGED", // Placeholder
                role: "OWNER",
                storeId: store.id,
                isVerified: true, // Supabase Auth implies verified if we enforce it, or we trust it
                image: avatar || `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(ownerName)}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
                // We could add a field `supabaseId` to schema later, or just map by email
            }
        });
    });

    redirect('/login'); // Or dashboard
}
