'use server';

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import { encrypt } from "@/lib/auth";
import { cookies } from "next/headers";

export async function login(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        // In a real app, returning state with error is better, using redirect for simplicity per current pattern
        return;
    }

    // 1. Find User
    const user = await prisma.user.findUnique({
        where: { email },
        include: { store: true } // Crucial: Fetch the linked store
    });

    // 2. Verify Password
    const isValid = await compare(password, user.password);
    if (!isValid) return;

    // Check for Store OR Platform Admin privileges
    if (!user.store && !user.isPlatformAdmin) {
        return; // Regular users must have a store
    }

    // 3. Create Session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    const sessionPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isPlatformAdmin: user.isPlatformAdmin,
        storeId: user.store?.id,
        storeSlug: user.store?.slug,
        expires
    };

    const session = await encrypt(sessionPayload);

    (await cookies()).set("session", session, { expires, httpOnly: true });

    // 4. Redirect based on Role
    if (user.isPlatformAdmin) {
        redirect('/platform-admin');
    } else if (user.store) {
        redirect(`/${user.store.slug}/admin/inventory`);
    } else {
        // Fallback (shouldn't happen given check above)
        redirect('/login');
    }
}
