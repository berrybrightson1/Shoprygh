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
        where: {
            storeId: store.id,
            isArchived: false
        },
        orderBy: { createdAt: 'desc' }
    });

    // 👇 THIS IS THE FIX
    const serializedProducts = products.map(product => ({
        ...product,
        priceRetail: product.priceRetail.toNumber(),
        priceWholesale: product.priceWholesale ? product.priceWholesale.toNumber() : null,
        costPrice: product.costPrice ? product.costPrice.toNumber() : null,
        createdAt: product.createdAt.toISOString()
    }));

    return <StoreInterface initialProducts={serializedProducts} storeId={store.id} storeSlug={storeSlug} />;
}
