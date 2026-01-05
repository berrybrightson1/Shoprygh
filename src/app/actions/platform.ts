"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";

export async function deleteStore(storeId: string) {
    const session = await getSession();
    if (!session || !session.isPlatformAdmin) {
        throw new Error("Unauthorized");
    }

    try {
        const store = await prisma.store.findUnique({ where: { id: storeId } });
        if (!store) throw new Error("Store not found");

        // PROTECTED: System Store
        if (store.slug === "shopry-hq") {
            throw new Error("Cannot delete System Store (Protected)");
        }

        // PROTECTED: Dev Account Check (Double Safety)
        const devUser = await prisma.user.findFirst({
            where: {
                storeId,
                email: "dev@shopry.app"
            }
        });
        if (devUser) {
            throw new Error("Cannot delete store containing Super Admin");
        }

        await logActivity("DELETE_STORE", `Deleted store ${store.name}`, "STORE", storeId);
        await prisma.store.delete({
            where: { id: storeId }
        });
        revalidatePath("/platform-admin");
    } catch (error) {
        // ... existing code ...
        console.error("Failed to delete store:", error);
        throw new Error("Failed to delete store");
    }
}

export async function createBroadcast({ title, message, type }: { title: string, message: string, type: string }) {
    const session = await getSession();
    if (!session || !session.isPlatformAdmin) {
        throw new Error("Unauthorized");
    }

    try {
        await prisma.systemUpdate.create({
            data: {
                title,
                content: message,
                type,
                version: "BROADCAST", // Special flag for manual broadcasts
            }
        });

        await logActivity("BROADCAST", `Sent system broadcast: ${title}`, "SYSTEM", "ALL");
        revalidatePath("/");
    } catch (error) {
        console.error("Failed to create broadcast:", error);
        throw new Error("Failed to send broadcast");
    }
}
