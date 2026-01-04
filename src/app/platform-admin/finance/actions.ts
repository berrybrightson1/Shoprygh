"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function approvePayout(formData: FormData) {
    const session = await getSession();
    if (!session || !session.isPlatformAdmin) throw new Error("Unauthorized");

    const payoutId = formData.get("payoutId") as string;

    await prisma.payoutRequest.update({
        where: { id: payoutId },
        data: {
            status: "APPROVED",
            processedAt: new Date(),
            adminNote: "Approved via Platform Admin"
        }
    });

    // In a real app, this is where we would trigger the Transfer API (Paystack/Stripe)

    revalidatePath("/platform-admin/finance");
}

export async function rejectPayout(formData: FormData) {
    const session = await getSession();
    if (!session || !session.isPlatformAdmin) throw new Error("Unauthorized");

    const payoutId = formData.get("payoutId") as string;
    const reason = formData.get("reason") as string || "Rejected by Admin";

    await prisma.$transaction(async (tx) => {
        // 1. Get the Payout to know amount/store
        const payout = await tx.payoutRequest.findUnique({
            where: { id: payoutId }
        });

        if (!payout || payout.status !== "PENDING") throw new Error("Invalid Payout State");

        // 2. Mark as Rejected
        await tx.payoutRequest.update({
            where: { id: payoutId },
            data: {
                status: "REJECTED",
                processedAt: new Date(),
                adminNote: reason
            }
        });

        // 3. Refund the Wallet
        await tx.walletTransaction.create({
            data: {
                storeId: payout.storeId,
                amount: payout.amount, // Positive to credit back
                type: "REFUND",
                description: `Refund for Rejected Payout #${payoutId.slice(-4)}`,
                referenceId: payout.id
            }
        });

        // 4. Update Balance
        await tx.store.update({
            where: { id: payout.storeId },
            data: {
                walletBalance: { increment: payout.amount }
            }
        });
    });

    revalidatePath("/platform-admin/finance");
}
