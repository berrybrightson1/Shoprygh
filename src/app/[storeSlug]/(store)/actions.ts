"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";

export type CartItemSnapshot = {
    id: string;
    name: string;
    priceRetail: number;
    quantity: number;
};

export async function createOrder(
    storeId: string,
    items: CartItemSnapshot[],
    totalEstimate: number,
    customerPhone?: string,
    couponCode?: string,
    customerName?: string
) {
    if (!items.length) throw new Error("Cart is empty");
    if (!storeId) throw new Error("Store ID is required");

    // 1. Handle Coupon Usage
    if (couponCode) {
        try {
            await prisma.coupon.update({
                where: { storeId_code: { storeId, code: couponCode } },
                data: { uses: { increment: 1 } }
            });
        } catch (error) {
            console.warn(`Failed to track usage for coupon ${couponCode}:`, error);
        }
    }

    // 2. Create/Update Customer Record (if phone provided)
    let customerId: string | undefined;
    if (customerPhone) {
        try {
            // Check if customer exists
            const existingCustomer = await prisma.customer.findUnique({
                where: {
                    storeId_phone: {
                        storeId: storeId,
                        phone: customerPhone
                    }
                }
            });

            if (existingCustomer) {
                // Update existing customer
                const updatedCustomer = await prisma.customer.update({
                    where: { id: existingCustomer.id },
                    data: {
                        totalSpent: { increment: totalEstimate },
                        totalOrders: { increment: 1 },
                        lastOrderAt: new Date(),
                        name: customerName || existingCustomer.name // Update name if provided
                    }
                });
                customerId = updatedCustomer.id;
            } else {
                // Create new customer
                const newCustomer = await prisma.customer.create({
                    data: {
                        storeId: storeId,
                        name: customerName || null,
                        phone: customerPhone,
                        totalSpent: totalEstimate,
                        totalOrders: 1,
                        lastOrderAt: new Date()
                    }
                });
                customerId = newCustomer.id;
            }
        } catch (error) {
            console.error("Failed to create/update customer:", error);
            // Continue with order creation even if customer update fails
        }
    }

    // 3. Create the Order in DB
    const order = await prisma.order.create({
        data: {
            storeId, // Link to Store
            total: totalEstimate,
            status: "PENDING",
            customerName: customerName || null,
            customerPhone: customerPhone ? (couponCode ? `${customerPhone} (Code: ${couponCode})` : customerPhone) : null,
            customerId: customerId, // Link to customer if created
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

    // 4. Revalidate Admin Pages (so they show up instantly)
    revalidatePath(`/${storeId}/admin/orders`);
    revalidatePath(`/${storeId}/admin/customers`);

    return { success: true, orderId: order.id };
}

export async function updateOrderStatus(storeId: string, orderId: string, newStatus: string) {
    // Get the order with its items before updating
    const order = await prisma.order.findUnique({
        where: { id: orderId, storeId },
        include: { items: true }
    });

    if (!order) throw new Error("Order not found");

    const oldStatus = order.status;

    // If marking as COMPLETED, check stock availability first
    if (newStatus === "COMPLETED" && oldStatus !== "COMPLETED") {
        const insufficientStock: Array<{ name: string; available: number; needed: number }> = [];

        for (const item of order.items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
                select: { name: true, stockQty: true }
            });

            if (!product) {
                throw new Error(`Product not found: ${item.name}`);
            }

            if (product.stockQty < item.quantity) {
                insufficientStock.push({
                    name: product.name,
                    available: product.stockQty,
                    needed: item.quantity
                });
            }
        }

        if (insufficientStock.length > 0) {
            const errorMessage = insufficientStock
                .map(item => `${item.name}: need ${item.needed}, only ${item.available} available`)
                .join('; ');
            throw new Error(`Insufficient stock - ${errorMessage}`);
        }
    }

    // Update order status
    await prisma.order.update({
        where: { id: orderId, storeId },
        data: { status: newStatus }
    });

    // If order is being marked as COMPLETED, deduct inventory
    if (newStatus === "COMPLETED" && oldStatus !== "COMPLETED") {
        for (const item of order.items) {
            try {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stockQty: {
                            decrement: item.quantity
                        }
                    }
                });
            } catch (error) {
                console.error(`Failed to deduct stock for product ${item.productId}:`, error);
                // Continue with other items even if one fails
            }
        }

        await logActivity(
            "INVENTORY_UPDATED",
            `Stock deducted for order #${orderId.slice(-6)}`,
            "ORDER",
            orderId,
            { items: order.items.map(i => ({ productId: i.productId, quantity: i.quantity })) }
        );
    }

    // If order is being changed FROM COMPLETED to something else, restore inventory
    if (oldStatus === "COMPLETED" && newStatus !== "COMPLETED") {
        for (const item of order.items) {
            try {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stockQty: {
                            increment: item.quantity
                        }
                    }
                });
            } catch (error) {
                console.error(`Failed to restore stock for product ${item.productId}:`, error);
            }
        }

        await logActivity(
            "INVENTORY_UPDATED",
            `Stock restored for order #${orderId.slice(-6)}`,
            "ORDER",
            orderId,
            { items: order.items.map(i => ({ productId: i.productId, quantity: i.quantity })) }
        );
    }

    await logActivity("ORDER_UPDATED", `Order #${orderId.slice(-6)} status: ${newStatus}`, "ORDER", orderId, { status: newStatus });
    revalidatePath(`/${storeId}/admin/orders`);
    revalidatePath(`/${storeId}/admin/catalog`);
    revalidatePath(`/${storeId}/admin/inventory`);
}

export async function deleteOrder(storeId: string, orderId: string) {
    await prisma.order.delete({
        where: { id: orderId, storeId } // Ensure tenancy
    });
    await logActivity("ORDER_DELETED", `Order #${orderId.slice(-6)} deleted`, "ORDER", orderId);
    revalidatePath(`/${storeId}/admin/orders`);
}

export async function validateCoupon(code: string, storeId: string, subtotal: number) {
    if (!code) return { valid: false, message: "Code required" };

    const coupon = await prisma.coupon.findUnique({
        where: {
            storeId_code: {
                storeId,
                code: code
            }
        }
    });

    if (!coupon) {
        return { valid: false, message: "Invalid Coupon Code" };
    }

    if (!coupon.isActive) {
        return { valid: false, message: "This coupon is no longer active" };
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
        return { valid: false, message: "This coupon has expired" };
    }

    // Calculate Discount
    let discountAmount = 0;
    const value = Number(coupon.value);

    if (coupon.type === 'PERCENTAGE') {
        discountAmount = subtotal * (value / 100);
    } else {
        discountAmount = value;
    }

    // Ensure we don't discount more than the subtotal
    if (discountAmount > subtotal) {
        discountAmount = subtotal;
    }

    return {
        valid: true,
        code: coupon.code,
        discountAmount,
        message: "Coupon applied!"
    };
}
