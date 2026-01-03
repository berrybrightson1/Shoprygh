'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { revalidatePath } from 'next/cache';

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

    revalidatePath(`/${storeId}/admin/staff`);
}

export async function deleteUser(storeId: string, formData: FormData) {
    const id = formData.get('id') as string;
    await prisma.user.delete({ where: { id, storeId } }); // Ensure we only delete users from this store
    revalidatePath(`/${storeId}/admin/staff`);
}
