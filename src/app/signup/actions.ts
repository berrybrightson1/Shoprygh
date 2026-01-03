"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { StoreTier } from "@prisma/client";

export async function createStore(formData: FormData) {
    const storeName = formData.get("storeName") as string;
    const storeSlug = formData.get("storeSlug") as string;
    const ownerName = formData.get("ownerName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!storeName || !storeSlug || !ownerName || !email || !password) {
        throw new Error("All fields are required");
    }

    // Check if store slug or email already exists
    const existingStore = await prisma.store.findUnique({ where: { slug: storeSlug } });
    if (existingStore) throw new Error("Store URL is already taken");

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("Email is already registered");

    const hashedPassword = await bcrypt.hash(password, 10);

    // Transaction: Create Store -> Create User
    await prisma.$transaction(async (tx) => {
        const store = await tx.store.create({
            data: {
                name: storeName,
                slug: storeSlug,
                tier: StoreTier.HUSTLER, // Default to free tier
            }
        });

        await tx.user.create({
            data: {
                name: ownerName,
                email,
                password: hashedPassword,
                role: "OWNER",
                storeId: store.id
            }
        });
    });

    redirect('/login');
}
