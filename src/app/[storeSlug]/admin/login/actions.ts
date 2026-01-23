'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { logActivity } from '@/lib/audit';

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const supabase = await createClient();

    // 1. Authenticate with Supabase
    const { data: { user: authUser }, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error || !authUser) {
        console.error("Store Admin Login Failed:", error?.message);
        redirect('/admin/login?error=InvalidCredentials');
    }

    // 2. Fetch User Context from Prisma (to know where to redirect)
    const user = await prisma.user.findUnique({
        where: { email },
        include: { store: true }
    });

    if (!user || !user.store) {
        redirect('/login?error=NoStore');
    }

    // 3. Log & Redirect
    // No need to set cookies manually, Supabase client handled it.
    await logActivity("LOGIN", `Store Admin logged in to ${user.store.name}`, "STORE", user.store.id);

    redirect(`/${user.store.slug}/admin/inventory`);
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
}
