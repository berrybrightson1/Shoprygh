"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type CartItemSnapshot = {
    id: string;
    name: string;
    priceRetail: number;
    quantity: number;
};

export async function createOrder(items: CartItemSnapshot[], totalEstimate: number, customerPhone?: string) {
    if (!items.length) throw new Error("Cart is empty");

    // 1. Create the Order in DB
    const order = await prisma.order.create({
        data: {
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
    revalidatePath("/admin/orders");

    return { success: true, orderId: order.id };
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
    await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus }
    });
    revalidatePath("/admin/orders");
}

export async function deleteOrder(orderId: string) {
    await prisma.order.delete({
        where: { id: orderId }
    });
    revalidatePath("/admin/orders");
}
