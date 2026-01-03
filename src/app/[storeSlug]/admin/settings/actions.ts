"use server";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StoreTier } from "@prisma/client";

export async function updateStoreTier(formData: FormData) {
    const storeId = formData.get("storeId") as string;
    const newTier = formData.get("tier") as StoreTier;
    const currentTier = formData.get("currentTier") as StoreTier;

    if (!storeId || !newTier) {
        throw new Error("Invalid request");
    }

    // If no change, just go back
    if (newTier === currentTier) {
        const store = await prisma.store.findUnique({ where: { id: storeId }, select: { slug: true } });
        redirect(`/${store?.slug}/admin/settings`);
    }

    // TODO: Integrate Paystack payment here
    // For now, just show a placeholder message

    // Update tier (in production, this would happen after payment confirmation)
    await prisma.store.update({
        where: { id: storeId },
        data: { tier: newTier },
    });

    const store = await prisma.store.findUnique({ where: { id: storeId }, select: { slug: true } });

    // In production with Paystack:
    // 1. Create payment intent with Paystack
    // 2. Redirect to Paystack checkout
    // 3. Handle webhook callback
    // 4. Update tier after successful payment

    redirect(`/${store?.slug}/admin/settings?success=true`);
}
