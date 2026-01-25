import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailsClient from "./ProductDetailsClient";

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string; storeSlug: string }> }) {
    const { id, storeSlug } = await params;
    const product = await prisma.product.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            description: true,
            image: true,
            gallery: true,
            category: true,
            priceRetail: true,
            storeId: true,
            stockQty: true,
            store: {
                select: {
                    ownerPhone: true,
                    name: true
                }
            }
        }
    });

    if (!product) notFound();

    // Serialize Decimal to number to prevent Client Component error
    const serializedProduct = {
        ...product,
        priceRetail: Number(product.priceRetail)
    };

    return <ProductDetailsClient product={serializedProduct} storeSlug={storeSlug} storeId={product.storeId} storePhone={product.store.ownerPhone} storeName={product.store.name} />;
}
