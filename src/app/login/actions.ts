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

    if (!user || !user.store) {
        // Security: Don't reveal if user exists
        return;
    }

    // 2. Verify Password
    const isValid = await compare(password, user.password);
    if (!isValid) return;

    // 3. Create Session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    const session = await encrypt({
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        },
        expires
    });

    (await cookies()).set("session", session, { expires, httpOnly: true });

    // 4. Redirect to Store Dashboard
    redirect(`/${user.store.slug}/admin/inventory`);
}
