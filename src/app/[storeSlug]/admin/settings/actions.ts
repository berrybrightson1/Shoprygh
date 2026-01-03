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

    // Verify Paystack Setup
    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET) {
        console.error("Missing PAYSTACK_SECRET_KEY");
        // Fallback for dev without keys or user notification
        // For now, we will throw an error to alert the user they need keys
        throw new Error("Payment gateway is not configured (Missing Secret Key).");
    }

    // Determine Amount (in Pesewas)
    // Pro: 50 GHS, Wholesaler: 100 GHS (Example prices)
    const prices: Record<StoreTier, number> = {
        HUSTLER: 0,
        PRO: 4900, // 49.00 GHS
        WHOLESALER: 9900, // 99.00 GHS
    };

    // Safety check for valid tier
    if (!(newTier in prices)) {
        throw new Error("Invalid tier selected.");
    }

    const amount = prices[newTier];

    // If Free/Hustler, just update
    if (amount === 0) {
        await prisma.store.update({
            where: { id: storeId },
            data: { tier: newTier },
        });
        const store = await prisma.store.findUnique({ where: { id: storeId }, select: { slug: true } });
        redirect(`/${store?.slug}/admin/settings?success=true`);
    }

    // Fetch User Email for Paystack
    const storeData = await prisma.store.findUnique({
        where: { id: storeId },
        include: { users: { select: { email: true } } }
    });

    const email = storeData?.users[0]?.email;
    if (!email) throw new Error("Store owner email not found.");

    // Initialize Paystack Transaction
    try {
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                amount,
                callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${storeData.slug}/admin/settings?payment=verify`,
                metadata: {
                    storeId,
                    newTier,
                    custom_fields: [
                        { display_name: "Store", variable_name: "store_slug", value: storeData.slug },
                        { display_name: "Tier", variable_name: "tier", value: newTier }
                    ]
                }
            }),
        });

        const data = await response.json();

        if (!data.status) {
            throw new Error(data.message || "Paystack initialization failed");
        }

        // Redirect user to Paystack Checkout
        redirect(data.data.authorization_url);

    } catch (error: any) {
        // Must re-throw redirect error as it's a special Next.js error
        if (error.message === "NEXT_REDIRECT") throw error;

        console.error("Paystack Error:", error);
        throw new Error("Payment initialization failed. Please try again.");
    }
}
