'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/audit';

export async function createUser(storeId: string, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const role = formData.get('role') as string;

    const hashedPassword = await hash(password, 10);

    await prisma.user.create({
        data: {
            email,
            name,
            password: hashedPassword,
            role,
            storeId,
        }
    });

    await logActivity("STAFF_INVITED", `Added new staff member: ${name} (${role})`, "STAFF", undefined, { email, role });
    revalidatePath(`/${storeId}/admin/staff`);
}

export async function deleteUser(storeId: string, formData: FormData) {
    const id = formData.get('id') as string;
    await prisma.user.delete({ where: { id, storeId } });
    await logActivity("STAFF_REMOVED", `Removed staff member`, "STAFF", id);
    revalidatePath(`/${storeId}/admin/staff`);
}
