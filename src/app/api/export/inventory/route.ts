
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const session = await getSession();

    if (!session || !session.storeId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const products = await prisma.product.findMany({
            where: {
                storeId: session.storeId,
                isArchived: false
            },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                category: true,
                priceRetail: true,
                stockQty: true,
                createdAt: true,
                description: true,
                sku: true
            }
        });

        const headers = ["ID", "Name", "Category", "Price", "Stock", "Date Added", "Description", "SKU"];
        const csvContent = [
            headers.join(","),
            ...products.map(p => [
                p.id,
                `"${p.name.replace(/"/g, '""')}"`,
                p.category,
                p.priceRetail,
                p.stockQty,
                p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "",
                `"${(p.description || "").replace(/"/g, '""')}"`,
                p.sku || ""
            ].join(","))
        ].join("\n");

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="inventory_${new Date().toISOString().split('T')[0]}.csv"`
            }
        });

    } catch (error) {
        console.error("Export error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
