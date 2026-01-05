"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";

export async function updateUserProfile(formData: FormData) {
    const session = await getSession();
    if (!session || !session.id) {
        throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    const image = formData.get("image") as string;

    if (!name) throw new Error("Name is required");

    try {
        await prisma.user.update({
            where: { id: session.id },
            data: {
                name,
                image: image || null
            }
        });

        await logActivity("UPDATE_PROFILE", "Updated personal profile", "USER", session.id);

        revalidatePath("/");
    } catch (error) {
        console.error("Failed to update user profile:", error);
        throw new Error("Failed to update profile");
    }
}
