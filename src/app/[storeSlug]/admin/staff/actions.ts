'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/audit';
import { createAdminClient } from '@/lib/supabase/admin';

export async function createUser(storeId: string, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const role = formData.get('role') as string;

    const supabase = createAdminClient();

    if (!supabase) {
        throw new Error("Supabase Admin Client configuration missing");
    }

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm for staff created by admin
        user_metadata: { name, role, storeId }
    });

    if (authError) {
        throw new Error(authError.message);
    }

    if (!authData.user) {
        throw new Error("Failed to create user in Auth system");
    }

    // 2. Create user in Prisma with SAME ID
    await prisma.user.create({
        data: {
            id: authData.user.id, // Sync ID with Supabase
            email,
            name,
            password: "MANAGED_BY_SUPABASE", // Placeholder as actual auth is handled by Supabase
            role,
            storeId,
            isVerified: true // They are created by admin
        }
    });

    await logActivity("STAFF_INVITED", `Added new staff member: ${name} (${role})`, "STAFF", undefined, { email, role });
    revalidatePath(`/${storeId}/admin/staff`);
}

export async function deleteUser(storeId: string, formData: FormData) {
    const id = formData.get('id') as string;

    // 1. Delete from Prisma (Critical for access revocation)
    await prisma.user.delete({ where: { id, storeId } });

    // 2. Delete from Supabase (Best effort cleanup)
    const supabase = createAdminClient();
    if (supabase) {
        // Only attempt if it looks like a Supabase ID (UUID) or just try anyway
        await supabase.auth.admin.deleteUser(id).catch(err => {
            console.error("Failed to delete user from Supabase Auth (might be legacy user):", err);
        });
    }

    await logActivity("STAFF_REMOVED", `Removed staff member`, "STAFF", id);
    revalidatePath(`/${storeId}/admin/staff`);
}
