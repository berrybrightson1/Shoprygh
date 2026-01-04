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
        <div className="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-black text-brand-orange tracking-widest uppercase">Store Management</span>
                        <div className="h-px bg-gray-200 flex-1" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                        {store.name}
                    </h1>
                </div>
                {products.length === 0 && (
                    <div className="flex-shrink-0">
                        <SeedButton storeId={store.id} />
                    </div>
                )}
            </header>

            {/* Creator Studio (Client Component) */}
            <CreatorStudio createAction={createProductWithStore} storeTier={store.tier} />

            {/* Live Inventory Table (Client Component with RBAC) */}
            <InventoryTable products={products} storeId={store.id} />
        </div>
    );
}
