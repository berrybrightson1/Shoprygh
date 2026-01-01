import CreatorStudio from "@/components/CreatorStudio";
import InventoryTable from "@/components/InventoryTable";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
    const data = await prisma.product.findMany({
        orderBy: { createdAt: "desc" }
    });

    const products = data.map(p => ({
        ...p,
        priceRetail: p.priceRetail.toNumber(),
        priceWholesale: p.priceWholesale ? p.priceWholesale.toNumber() : null,
    }));

    return (
        <div className="p-4 sm:p-8 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Inventory Management</h1>

            {/* Creator Studio (Client Component) */}
            <CreatorStudio />

            {/* Live Inventory Table (Client Component with RBAC) */}
            <InventoryTable products={products} />
        </div>
    );
}
