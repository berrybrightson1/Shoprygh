"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type CartItemSnapshot = {
    id: string;
    name: string;
    priceRetail: number;
    quantity: number;
};

export async function createOrder(storeId: string, items: CartItemSnapshot[], totalEstimate: number, customerPhone?: string) {
    if (!items.length) throw new Error("Cart is empty");
    if (!storeId) throw new Error("Store ID is required");

    // 1. Create the Order in DB
    const order = await prisma.order.create({
        data: {
            storeId, // Link to Store
            total: totalEstimate,
            status: "PENDING",
            customerPhone: customerPhone || null,
            items: {
                create: items.map(item => ({
                    productId: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.priceRetail
                }))
            }
        }
    });

    // 2. Revalidate Admin Orders page (so it shows up instantly)
    revalidatePath(`/${storeId}/admin/orders`);

    return { success: true, orderId: order.id };
}

export async function updateOrderStatus(storeId: string, orderId: string, newStatus: string) {
    await prisma.order.update({
        where: { id: orderId, storeId }, // Ensure tenancy
        data: { status: newStatus }
    });
    revalidatePath(`/${storeId}/admin/orders`);
}

export async function deleteOrder(storeId: string, orderId: string) {
    await prisma.order.delete({
        where: { id: orderId, storeId } // Ensure tenancy
    });
    revalidatePath(`/${storeId}/admin/orders`);
}
