'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/auth';
import { compare } from 'bcryptjs';

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('Login attempt for:', email);
    // Explicitly check if user model exists on prisma instance
    // @ts-ignore
    if (!prisma.user) {
        console.error('CRITICAL: prisma.user is undefined!');
        console.log('Available models:', Object.keys(prisma));
    }

    const user = await prisma.user.findUnique({
        where: { email },
        include: { store: true }
    });

    if (!user || !(await compare(password, user.password))) {
        // In a real app, returning state to show error would be better.
        // For now, valid login is the happy path.
        redirect('/admin/login?error=InvalidCredentials');
    }

    if (!user.store) {
        console.error('User has no store linked');
        redirect('/login?error=NoStore');
    }

    // Create Session (Standardized Flat Payload)
    const session = await encrypt({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        storeId: user.store.id,
        storeSlug: user.store.slug
    });

    (await cookies()).set('session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        path: '/',
    });

    // Correct Redirect to the store's inventory
    redirect(`/${user.store.slug}/admin/inventory`);
}

export async function logout() {
    (await cookies()).delete('session');
    redirect('/login');
}
