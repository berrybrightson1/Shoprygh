"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";

export async function requestPayout(formData: FormData) {
    const session = await getSession();
    if (!session || !session.storeId) throw new Error("Unauthorized");

    // Capture strictly as string to satisfy TS inside the transaction closure
    const storeId = session.storeId;

    const amount = parseFloat(formData.get("amount") as string);
    const method = formData.get("method") as string;
    const destination = formData.get("destination") as string;

    if (isNaN(amount) || amount <= 0) throw new Error("Invalid amount");

    // Transactional consistency
    await prisma.$transaction(async (tx) => {
        // 1. Get current balance (fresh read)
        const store = await tx.store.findUnique({
            where: { id: storeId },
            select: { walletBalance: true }
        });

        if (!store || Number(store.walletBalance) < amount) {
            throw new Error("Insufficient funds");
        }

        // 2. Create Payout Request
        const payout = await tx.payoutRequest.create({
            data: {
                storeId: storeId,
                amount,
                method,
                destination,
                status: "PENDING"
            }
        });

        // 3. Create Debit Transaction
        await tx.walletTransaction.create({
            data: {
                storeId: storeId,
                amount: -amount, // Negative for debit
                type: "PAYOUT_REQUEST",
                description: `Payout Request via ${method}`,
                referenceId: payout.id
            }
        });

        // 4. Update Balance
        await tx.store.update({
            where: { id: storeId },
            data: {
                walletBalance: { decrement: amount }
            }
        });
    });

    await logActivity("PAYOUT_REQUESTED", `Requested payout of ₵${amount} via ${method} to ${destination}`, "STORE", storeId, { amount, method });
    revalidatePath(`/${session.storeSlug}/admin/finance`);
}
