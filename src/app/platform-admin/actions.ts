"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { StoreStatus } from "@prisma/client";
import { getSession, encrypt } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

export async function impersonateStoreOwner(formData: FormData) {
    const storeId = formData.get("storeId") as string;

    // 1. Verify Requestor is Platform Admin
    const session = await getSession();
    if (!session || !session.isPlatformAdmin) {
        throw new Error("Unauthorized");
    }

    // 2. Find Target User (Store Owner)
    // Assuming the first user in the store is the owner for now
    const store = await prisma.store.findUnique({
        where: { id: storeId },
        include: { users: { take: 1 } }
    });

    const targetUser = store?.users[0];
    if (!targetUser) throw new Error("Store has no users");

    // 3. Create Session for Target User
    // We re-use logic similar to login/actions.ts
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const sessionPayload = {
        user: {
            email: targetUser.email,
            id: targetUser.id,
            name: targetUser.name,
            role: targetUser.role
        },
        storeSlug: store.slug,
        storeId: store.id,
        expires
    };

    // 4. Set Cookie & Redirect
    (await cookies()).set("session", await encrypt(sessionPayload), {
        expires,
        httpOnly: true
    });

    redirect(`/${store.slug}/admin/reports`);
}

export async function updateStoreTierManually(formData: FormData) {
    const storeId = formData.get("storeId") as string;
    const newTier = formData.get("tier") as "HUSTLER" | "PRO" | "WHOLESALER";

    // 1. Verify Platform Admin
    const session = await getSession();
    if (!session || !session.isPlatformAdmin) {
        throw new Error("Unauthorized");
    }

    // 2. Update Store Tier
    await prisma.store.update({
        where: { id: storeId },
        data: { tier: newTier }
    });

    revalidatePath("/platform-admin");
}

export async function verifyStore(formData: FormData) {
    const storeId = formData.get("storeId") as string;
    await prisma.store.update({
        where: { id: storeId },
        data: {
            isVerified: true,
            verificationStatus: "APPROVED"
        }
    });
    revalidatePath("/platform-admin");
}

export async function rejectStore(formData: FormData) {
    const storeId = formData.get("storeId") as string;
    await prisma.store.update({
        where: { id: storeId },
        data: {
            isVerified: false,
            verificationStatus: "REJECTED"
        }
    });
    revalidatePath("/platform-admin");
}

