"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { StoreStatus } from "@prisma/client";

export async function suspendStore(formData: FormData) {
    const storeId = formData.get("storeId") as string;

    await prisma.store.update({
        where: { id: storeId },
        data: {
            status: StoreStatus.SUSPENDED,
            suspensionReason: "Suspended by Platform Admin",
            suspendedAt: new Date(),
        },
    });

    revalidatePath("/platform-admin");
}

export async function unsuspendStore(formData: FormData) {
    const storeId = formData.get("storeId") as string;

    await prisma.store.update({
        where: { id: storeId },
        data: {
            status: StoreStatus.ACTIVE,
            suspensionReason: null,
            suspendedAt: null,
        },
    });

    revalidatePath("/platform-admin");
}

export async function deleteStore(formData: FormData) {
    const storeId = formData.get("storeId") as string;

    try {
        await prisma.$transaction(async (tx) => {
            // Delete dependent records first to avoid Foreign Key constraints
            // (Adjust this list based on your actual schema relations)

            // 1. Delete Products
            await tx.product.deleteMany({ where: { storeId } });

            // 2. Delete Orders
            await tx.order.deleteMany({ where: { storeId } });

            // 3. Delete Store Settings/Profile (if split) - assuming included in store or separate table
            // await tx.storeSettings.deleteMany({ where: { storeId } }); 

            // 4. Finally, Delete the Store
            await tx.store.delete({
                where: { id: storeId },
            });
        });

        revalidatePath("/platform-admin");
    } catch (error) {
        console.error("Failed to delete store:", error);
        // In a real app, we should return an error state to the UI
        // For now, we log it. The UI might not reflect failure immediately without a toast.
    }
}
