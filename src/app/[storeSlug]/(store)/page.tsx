import prisma from "@/lib/prisma";
import StoreInterface from "@/components/StoreInterface";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{
        storeSlug: string;
    }>
}

export default async function StorePage({ params }: Props) {
    const { storeSlug } = await params;

    const store = await prisma.store.findUnique({
        where: { slug: storeSlug }
    });

    if (!store) {
        notFound();
    }

    const products = await prisma.product.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: "desc" }
    });

    const serializedProducts = products.map(p => ({
        ...p,
        priceRetail: Number(p.priceRetail),
        priceWholesale: p.priceWholesale ? Number(p.priceWholesale) : null,
        stockQty: Number(p.stockQty),
        createdAt: p.createdAt.toISOString()
    }));

    return <StoreInterface initialProducts={serializedProducts} storeId={store.id} storeSlug={storeSlug} />;
}
