// app/[storeSlug]/admin/inventory/page.tsx
import CreatorStudio from "@/components/CreatorStudio";
import { Package } from "lucide-react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { createProduct } from "./actions";

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

    // Bind the storeId to the create action
    const createProductWithStore = createProduct.bind(null, store.id);

    return (
        <div className="p-8 lg:p-12 pb-40 animate-in fade-in duration-700">
            {/* Header Section */}
            <header className="mb-12 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-brand-purple flex items-center justify-center border border-purple-100 shadow-sm">
                            <Package size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            Creator Studio
                        </h1>
                    </div>
                    <p className="text-sm text-gray-400 font-bold ml-1 uppercase tracking-widest">Craft & Orchestrate Products</p>
                </div>
            </header>

            <div className="space-y-12">
                {/* Creator Studio (Client Component) */}
                <CreatorStudio createAction={createProductWithStore} storeTier={store.tier} />
            </div>
        </div>
    );
}
