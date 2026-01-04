// Placeholder to ensure I update schema first.

export type CartItemSnapshot = {
    id: string;
    name: string;
    priceRetail: number;
    quantity: number;
};

export async function createOrder(storeId: string, items: CartItemSnapshot[], totalEstimate: number, customerPhone?: string, couponCode?: string) {
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

    // 2. Create the Order in DB
    const order = await prisma.order.create({
        data: {
            storeId, // Link to Store
            total: totalEstimate,
            status: "PENDING",
            customerPhone: customerPhone ? (couponCode ? `${customerPhone} (Code: ${couponCode})` : customerPhone) : null,
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

    // 3. Revalidate Admin Orders page (so it shows up instantly)
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
