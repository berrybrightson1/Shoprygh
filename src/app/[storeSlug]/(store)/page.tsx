import { prisma } from "@/lib/prisma";
import StoreInterface from "@/components/store/StoreInterface";

export default async function StorePage({ params }: { params: Promise<{ storeSlug: string }> }) {
    const { storeSlug } = await params;
    const store = await prisma.store.findUnique({ where: { slug: storeSlug } });

    // Minimal return - NO functions, NO heavy logic
    if (!store) return <div>Store not found</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Debug Mode: {store.name}</h1>
            <p>If you see this, the Server Crash is fixed.</p>
            {/* We commented out the interface to prove the crash is gone */}
            {/* <StoreInterface storeId={store.id} storeSlug={storeSlug} initialProducts={[]} /> */}
        </div>
    );
}