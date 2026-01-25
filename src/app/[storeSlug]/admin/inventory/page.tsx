// app/[storeSlug]/admin/inventory/page.tsx
import CreatorStudio from "@/components/CreatorStudio";
import InventoryTable from "@/components/InventoryTable";
import ProductCardList from "@/components/ProductCardList";
import { Package } from "lucide-react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { createProduct } from "./actions";
import SeedButton from "./SeedButton";

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{
        storeSlug: string;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InventoryPage({ params, searchParams }: Props) {
    const { storeSlug } = await params;

    const store = await prisma.store.findUnique({
        where: { slug: storeSlug }
    });

    if (!store) {
        notFound();
    }

    const searchParamsValues = await searchParams;
    const page = Number(searchParamsValues?.page) || 1;
    const LIMIT = 20;
    const skip = (page - 1) * LIMIT;

    // Fetch products strictly for this store with pagination
    const [data, totalItems] = await Promise.all([
        prisma.product.findMany({
            where: {
                storeId: store.id,
                isArchived: false
            },
            take: LIMIT,
            skip: skip,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                stockQty: true,
                priceRetail: true,
                priceWholesale: true,
                costPrice: true,
                image: true,
                category: true,
                sku: true,
                createdAt: true
            }
        }),
        prisma.product.count({
            where: {
                storeId: store.id,
                isArchived: false
            }
        })
    ]);

    const totalPages = Math.ceil(totalItems / LIMIT);

    // --- FIX FOR VERCEL DIGEST ERROR ---
    const products = data.map(p => ({
        ...p,
        priceRetail: p.priceRetail.toNumber(),
        priceWholesale: p.priceWholesale ? p.priceWholesale.toNumber() : null,
        costPrice: p.costPrice ? p.costPrice.toNumber() : null,
        // Convert Date to String for Client Components
        createdAt: p.createdAt.toISOString()
    }));
    // -----------------------------------

    // Bind the storeId to the create action
    const createProductWithStore = createProduct.bind(null, store.id);

    return (
        <div className="p-8 lg:p-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <header className="mb-12 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-orange flex items-center justify-center border border-orange-100 shadow-sm">
                            <Package size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            Global Catalog
                        </h1>
                    </div>
                    <p className="text-sm text-gray-400 font-bold ml-1 uppercase tracking-widest">Inventory orchestration & logistical depth</p>
                </div>

                <div className="flex items-center gap-4">
                    {products.length === 0 && (
                        <div className="flex-shrink-0">
                            <SeedButton storeId={store.id} />
                        </div>
                    )}
                    <div className="bg-white px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl border border-gray-100 shadow-sm">
                        <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Total Assets</span>
                        <span className="text-sm md:text-xl font-black text-gray-900 tabular-nums">{products.length} Items</span>
                    </div>
                </div>
            </header>

            <div className="space-y-12">
                {/* Creator Studio (Client Component) */}
                <CreatorStudio createAction={createProductWithStore} storeTier={store.tier} />

                {/* Live Inventory Table (Desktop) */}
                <div className="hidden md:block">
                    <InventoryTable
                        products={products}
                        storeId={store.id}
                        storeName={store.name}
                        storeSlug={storeSlug}
                        pagination={{
                            currentPage: page,
                            totalPages: totalPages,
                            totalItems: totalItems
                        }}
                    />
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Live Inventory</h3>
                        <span className="text-[10px] font-black text-brand-orange bg-orange-50 px-2 py-1 rounded-lg uppercase tracking-widest">Mobile View</span>
                    </div>
                    <ProductCardList
                        products={products.map(p => ({ ...p, category: p.category, image: p.image || null }))}
                    />
                </div>
            </div>
        </div>
    );
}
