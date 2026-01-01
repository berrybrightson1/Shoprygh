import prisma from "@/lib/prisma";
import StoreInterface from "@/components/StoreInterface";

export const dynamic = 'force-dynamic';

export default async function StorePage() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" }
    });

    const serializedProducts = products.map(p => ({
        ...p,
        priceRetail: Number(p.priceRetail),
        priceWholesale: p.priceWholesale ? Number(p.priceWholesale) : null,
        stockQty: Number(p.stockQty),
        createdAt: p.createdAt.toISOString()
    }));

    return <StoreInterface initialProducts={serializedProducts} />;
}
