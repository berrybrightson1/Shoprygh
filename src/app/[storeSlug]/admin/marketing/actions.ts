"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";

export async function createCoupon(formData: FormData) {
    const session = await getSession();
    if (!session || !session.storeId) throw new Error("Unauthorized");

    const storeId = session.storeId;

    const code = (formData.get("code") as string).toUpperCase().replace(/\s/g, "");
    const type = formData.get("type") as string; // PERCENTAGE | FIXED
    const value = parseFloat(formData.get("value") as string);
    const maxUses = formData.get("maxUses") ? parseInt(formData.get("maxUses") as string) : null;

    // Expires At Handling (optional)
    const expiresAtRaw = formData.get("expiresAt") as string;
    const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;

    if (!code || isNaN(value) || value <= 0) throw new Error("Invalid Input");

    try {
        await prisma.coupon.create({
            data: {
                storeId,
                code,
                type,
                value,
                maxUses,
                expiresAt
            }
        });
        await logActivity("COUPON_CREATED", `Created coupon ${code} (${type}: ${value})`, "COUPON");
    } catch (e) {
        // Unique constraint violation usually
        throw new Error("Coupon code already exists.");
    }

    revalidatePath(`/${session.storeSlug}/admin/marketing`);
}

export async function toggleCouponStatus(formData: FormData) {
    const session = await getSession();
    if (!session || !session.storeId) throw new Error("Unauthorized");

    const storeId = session.storeId;

    const couponId = formData.get("couponId") as string;
    const isActive = formData.get("isActive") === "true";

    await prisma.coupon.update({
        where: { id: couponId, storeId },
        data: { isActive: !isActive }
    });

    await logActivity("COUPON_UPDATED", `${!isActive ? 'Activated' : 'Deactivated'} coupon`, "COUPON", couponId);
    revalidatePath(`/${session.storeSlug}/admin/marketing`);
}

export async function deleteCoupon(formData: FormData) {
    const session = await getSession();
    if (!session || !session.storeId) throw new Error("Unauthorized");

    const storeId = session.storeId;

    const couponId = formData.get("couponId") as string;

    await prisma.coupon.delete({
        where: { id: couponId, storeId }
    });

    await logActivity("COUPON_DELETED", `Deleted coupon`, "COUPON", couponId);
    revalidatePath(`/${session.storeSlug}/admin/marketing`);
}
