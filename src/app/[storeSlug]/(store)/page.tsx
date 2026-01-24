// FORCE DEPLOY: Fixed onEdit crash
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import StoreInterface from "@/components/StoreInterface";

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ storeSlug: string }>;
}

export default async function StorePage({ params }: Props) {
    const { storeSlug } = await params;

    const store = await prisma.store.findUnique({
        where: { slug: storeSlug },
    });

    if (!store) {
        notFound();
    }

    const products = await prisma.product.findMany({
        where: {
            storeId: store.id,
            isArchived: false,
        },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            priceRetail: true,
            priceWholesale: true,
            costPrice: true,
            image: true,
            category: true,
            createdAt: true,
        }
    });

    // Serialize Decimals to prevent serialization errors
    const serializedProducts = products.map((product) => ({
        ...product,
        priceRetail: product.priceRetail.toNumber(),
        priceWholesale: product.priceWholesale
            ? product.priceWholesale.toNumber()
            : null,
        costPrice: product.costPrice ? product.costPrice.toNumber() : null,
        createdAt: product.createdAt.toISOString()
    }));

    // NO onEdit function passed - this is critical for Server/Client component separation
    return (
        <StoreInterface
            storeId={store.id}
            storeSlug={storeSlug}
            storeName={store.name}
            initialProducts={serializedProducts}
        />
    );
}
