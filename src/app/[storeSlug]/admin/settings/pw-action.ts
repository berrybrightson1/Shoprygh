"use server";

import prisma from "@/lib/prisma";
import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updatePassword(formData: FormData) {
    const email = formData.get("email") as string;
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!email || !currentPassword || !newPassword) {
        return { error: "All fields are required" };
    }

    try {
        // 1. Fetch user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) return { error: "User not found" };

        // 2. Verify current password
        const isValid = await compare(currentPassword, user.password);
        if (!isValid) {
            return { error: "Incorrect current password" };
        }

        // 3. Hash new password
        const hashedPassword = await hash(newPassword, 10);

        // 4. Update user
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });

        return { success: true };

    } catch (e) {
        console.error(e);
        return { error: "Failed to update password" };
    }
}
