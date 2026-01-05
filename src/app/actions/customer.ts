"use server";

import prisma from "@/lib/prisma";

export async function reportCustomer(customerId: string, storeId: string, reason: string) {
    try {
        // Create the report
        await prisma.customerReport.create({
            data: {
                customerId,
                storeId,
                reason
            }
        });

        // Update customer trust score (Example logic: decrease by 10)
        await prisma.customer.update({
            where: { id: customerId },
            data: {
                trustScore: { decrement: 10 }
            }
        });

        return { success: true, newStatus: "FLAGGED" };
    } catch (error) {
        console.error("Error reporting customer:", error);
        return { success: false, message: "Failed to report customer" };
    }
}
