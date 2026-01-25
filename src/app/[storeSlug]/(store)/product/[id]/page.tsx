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
            storeId: true
        }
    });

    if (!product) notFound();

    return <ProductDetailsClient product={product} storeSlug={storeSlug} />;
}
