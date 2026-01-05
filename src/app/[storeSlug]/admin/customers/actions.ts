"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";

export async function syncCustomersFromOrders() {
    const session = await getSession();
    if (!session || !session.storeId) throw new Error("Unauthorized");

    // 1. Fetch all orders for this store
    const orders = await prisma.order.findMany({
        where: { storeId: session.storeId, status: { not: "CANCELLED" } }, // Only count valid orders
        select: {
            id: true,
            customerName: true,
            customerPhone: true,
            createdAt: true,
            total: true
        }
    });

    let newCount = 0;
    let updateCount = 0;

    // 2. Aggregate / Upsert
    // This is a naive implementation. Ideally, we do this on order creation.
    // But for a "Sync" button, this works.
    for (const order of orders) {
        if (!order.customerPhone) continue; // Skip if no identifier

        // Find existing customer by phone
        const existing = await prisma.customer.findUnique({
            where: {
                storeId_phone: {
                    storeId: session.storeId,
                    phone: order.customerPhone
                }
            }
        });

        if (existing) {
            // Update stats if needed (this is tricky because we might double count if we run blindly)
            // A better approach for "Sync" is to recalculate EVERYTHING for that user
            // But let's keep it simple: Ensure they exist. 
            // REALITY: We should probably recalculate totals from scratch for accuracy.

            // Let's do a "Recalculate Totals" approach for correctness
            const customerOrders = await prisma.order.findMany({
                where: { storeId: session.storeId, customerPhone: order.customerPhone, status: { not: "CANCELLED" } }
            });

            const totalSpent = customerOrders.reduce((sum, o) => sum + Number(o.total), 0);
            const totalOrders = customerOrders.length;
            const lastOrder = customerOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

            await prisma.customer.update({
                where: { id: existing.id },
                data: {
                    totalSpent,
                    totalOrders,
                    lastOrderAt: lastOrder.createdAt,
                    name: order.customerName || existing.name // Update name if newer/available
                }
            });
            updateCount++;
        } else {
            await prisma.customer.create({
                data: {
                    storeId: session.storeId,
                    name: order.customerName || "Unknown",
                    phone: order.customerPhone,
                    totalSpent: order.total,
                    totalOrders: 1,
                    lastOrderAt: order.createdAt
                }
            });
            newCount++;
        }
    }

    await logActivity("CUSTOMER_UPDATED", `Synced ${newCount} new and ${updateCount} existing customers from orders`, "CUSTOMER");
    revalidatePath(`/${session.storeSlug}/admin/customers`);
    // return { newCount, updateCount }; // Commented out to satisfy form action type
}

export async function updateCustomerNotes(formData: FormData) {
    const session = await getSession();
    if (!session || !session.storeId) throw new Error("Unauthorized");

    const customerId = formData.get("customerId") as string;
    const notes = formData.get("notes") as string;

    await prisma.customer.update({
        where: { id: customerId, storeId: session.storeId },
        data: { notes }
    });

    await logActivity("CUSTOMER_UPDATED", `Updated notes for customer`, "CUSTOMER", customerId);
    revalidatePath(`/${session.storeSlug}/admin/customers`);
}
