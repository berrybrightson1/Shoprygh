"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const CouponSchema = z.object({
    code: z.string().min(3, "Code must be at least 3 characters").regex(/^[A-Z0-9_-]+$/, "Code must be alphanumeric (uppercase)"),
    type: z.enum(["PERCENTAGE", "FIXED"]),
    value: z.number().min(0.01, "Value must be positive"),
    maxUses: z.number().optional(),
    expiresAt: z.string().optional(), // Date string from form
    storeId: z.string(),
});

export async function createCoupon(formData: FormData) {
    const rawData = {
        code: formData.get("code")?.toString().toUpperCase(),
        type: formData.get("type"), // PERCENTAGE or FIXED
        value: Number(formData.get("value")),
        maxUses: formData.get("maxUses") ? Number(formData.get("maxUses")) : undefined,
        expiresAt: formData.get("expiresAt")?.toString() || undefined,
        storeId: formData.get("storeId")?.toString(),
    };

    // Basic Validation
    if (!rawData.code || !rawData.storeId) return { error: "Code and Store ID are required" };

    try {
        await prisma.coupon.create({
            data: {
                code: rawData.code,
                type: rawData.type as any,
                value: rawData.value,
                maxUses: rawData.maxUses,
                expiresAt: rawData.expiresAt ? new Date(rawData.expiresAt) : null,
                storeId: rawData.storeId,
                isActive: true
            }
        });
    } catch (e) {
        console.error(e);
        return { error: "Failed to create coupon. Code might already exist." };
    }

    // Determine slug for redirect
    const store = await prisma.store.findUnique({ where: { id: rawData.storeId }, select: { slug: true } });
    if (store) {
        revalidatePath(`/${store.slug}/admin/discounts`);
        redirect(`/${store.slug}/admin/discounts`);
    }
}

export async function deleteCoupon(couponId: string, storeSlug: string) {
    try {
        await prisma.coupon.delete({ where: { id: couponId } });
        revalidatePath(`/${storeSlug}/admin/discounts`);
    } catch (e) {
        return { error: "Failed to delete" };
    }
}

export async function toggleCouponStatus(couponId: string, storeSlug: string, currentStatus: boolean) {
    await prisma.coupon.update({
        where: { id: couponId },
        data: { isActive: !currentStatus }
    });
    revalidatePath(`/${storeSlug}/admin/discounts`);
}

export async function validateCoupon(code: string, storeId: string, cartTotal: number) {
    if (!code) return { valid: false, message: "No code provided" };

    const coupon = await prisma.coupon.findFirst({
        where: {
            storeId,
            code: code.toUpperCase(),
            isActive: true
        }
    });

    if (!coupon) return { valid: false, message: "Invalid code" };

    // Check expiry
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
        return { valid: false, message: "Coupon expired" };
    }

    // Check usage limits
    if (coupon.maxUses && coupon.uses >= coupon.maxUses) {
        return { valid: false, message: "Usage limit reached" };
    }

    // Calculate Discount
    let discountAmount = 0;
    if (coupon.type === "PERCENTAGE") {
        discountAmount = (Number(coupon.value) / 100) * cartTotal;
    } else {
        discountAmount = Number(coupon.value);
    }

    // Cap at total
    if (discountAmount > cartTotal) discountAmount = cartTotal;

    return {
        valid: true,
        discountAmount,
        message: `Applied ${coupon.code}`,
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value)
    };
}
