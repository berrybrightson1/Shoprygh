"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function requestVerification(storeId: string, kycDocument: string) {
    if (!storeId) return { error: "Store ID is required" };
    if (!kycDocument) return { error: "KYC Document is required" };

    try {
        await prisma.store.update({
            where: { id: storeId },
            data: {
                verificationStatus: "PENDING",
                kycDocumentUrl: kycDocument
            }
        });

        const store = await prisma.store.findUnique({ where: { id: storeId }, select: { slug: true } });
        if (store) {
            revalidatePath(`/${store.slug}/admin/verification`);
        }
        return { success: true };
    } catch (error) {
        console.error("Failed to request verification", error);
        return { error: "Failed to submit request" };
    }
}
