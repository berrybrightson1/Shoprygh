import CreatorStudio from "@/components/CreatorStudio";
import InventoryTable from "@/components/InventoryTable";
import ProductCardList from "@/components/ProductCardList";
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
        where: {
            storeId: store.id,
            isArchived: false
        },
        orderBy: { createdAt: "desc" }
    });
    // console.log("Fetch took:", performance.now() - start);

    const products = data.map(p => ({
        ...p,
        priceRetail: p.priceRetail.toNumber(),
        priceWholesale: p.priceWholesale ? p.priceWholesale.toNumber() : null,
        costPrice: p.costPrice ? p.costPrice.toNumber() : null,
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

            {/* Live Inventory Table (Desktop) */}
            <div className="hidden md:block">
                <InventoryTable products={products} storeId={store.id} storeName={store.name} storeSlug={storeSlug} />
            </div>

            {/* Mobile Card List */}
            <ProductCardList
                products={products.map(p => ({ ...p, category: p.category, image: p.image || null }))}
                onEdit={(product) => {
                    // We will implement the edit sheet trigger here or reuse the existing table's sheet logic if possible.
                    // For now, let's just log or use a placeholder since the sheet is internal to InventoryTable.
                    // Actually, to share the Edit Sheet, we might need to lift the state up or refactor InventoryTable.
                    // Given the constraints, let's try to expose the handler or wrap both in a parent client component.
                    // Wait, `InventoryTable` is a client component. Let's make `InventoryPage` just render `InventoryTable` which handles responsiveness internally?
                    // The plan says: "Modify src/app/[storeSlug]/admin/inventory/page.tsx... Mobile: Hide the table. Show a <ProductCardList /> instead."
                    // But `InventoryTable` likely holds the "Edit" state.
                    // Let's modify `InventoryTable.tsx` instead to handle the responsive switch? This is cleaner.
                    // But user specifically asked to modify `page.tsx`.
                    // Let's stick to the plan: Render `ProductCardList` here. But how to trigger edit?
                    // `InventoryTable` likely has the `Sheet` for editing.
                    // I should check `InventoryTable.tsx` first.
                }}
            />
        </div>
    );
}
