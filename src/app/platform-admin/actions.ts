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

    // Soft delete by marking as DELETED
    await prisma.store.update({
        where: { id: storeId },
        data: {
            status: StoreStatus.DELETED,
        },
    });

    revalidatePath("/platform-admin");
}
