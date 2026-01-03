import CreatorStudio from "@/components/CreatorStudio";
import InventoryTable from "@/components/InventoryTable";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { createProduct } from "./actions";
import SeedButton from "./SeedButton";

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{
        storeSlug: string;
    }>
}

export default async function InventoryPage({ params }: Props) {
    const { storeSlug } = await params;

    const store = await prisma.store.findUnique({
        where: { slug: storeSlug }
    });

    if (!store) {
        notFound();
    }

    // Fetch products strictly for this store
    const start = performance.now();
    const data = await prisma.product.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: "desc" }
    });
    // console.log("Fetch took:", performance.now() - start);

    const products = data.map(p => ({
        ...p,
        priceRetail: p.priceRetail.toNumber(),
        priceWholesale: p.priceWholesale ? p.priceWholesale.toNumber() : null,
    }));

    // Bind the storeId to the create action
    const createProductWithStore = createProduct.bind(null, store.id);

    return (
        <div className="p-4 sm:p-8 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Inventory Management</h1>
            <div className="mb-4 flex items-center gap-3">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Store: {store.name}</span>
                {products.length === 0 && <SeedButton storeId={store.id} />}
            </div>

            {/* Creator Studio (Client Component) */}
            <CreatorStudio createAction={createProductWithStore} storeTier={store.tier} />

            {/* Live Inventory Table (Client Component with RBAC) */}
            <InventoryTable products={products} storeId={store.id} />
        </div>
    );
}
