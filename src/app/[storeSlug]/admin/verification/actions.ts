"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function requestVerification(storeId: string) {
    if (!storeId) return { error: "Store ID is required" };

    try {
        await prisma.store.update({
            where: { id: storeId },
            data: { verificationStatus: "PENDING" }
        });

        revalidatePath(`/${storeId}/admin/verification`);
        return { success: true };
    } catch (error) {
        console.error("Failed to request verification", error);
        return { error: "Failed to submit request" };
    }
}
