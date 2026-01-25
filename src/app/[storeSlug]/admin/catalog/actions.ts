"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";
import { getSession } from "@/lib/auth";

export interface BulkImportResult {
    success: boolean;
    imported: number;
    failed: number;
    errors: Array<{ row: number; error: string; data?: any }>;
}

export async function bulkImportProducts(
    storeId: string,
    csvData: Array<{
        name: string;
        priceRetail: string;
        stockQty: string;
        category?: string;
        description?: string;
        priceWholesale?: string;
        sku?: string;
    }>
): Promise<BulkImportResult> {
    const session = await getSession();
    if (!session || !session.storeId || session.storeId !== storeId) {
        throw new Error("Unauthorized");
    }

    const result: BulkImportResult = {
        success: true,
        imported: 0,
        failed: 0,
        errors: []
    };

    for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        const rowNumber = i + 2; // +2 because: 1 for header, 1 for 1-indexed

        try {
            // Validation
            if (!row.name || row.name.trim() === "") {
                throw new Error("Product name is required");
            }

            if (!row.priceRetail || isNaN(parseFloat(row.priceRetail))) {
                throw new Error("Valid retail price is required");
            }

            if (!row.stockQty || isNaN(parseInt(row.stockQty))) {
                throw new Error("Valid stock quantity is required");
            }

            const priceRetail = parseFloat(row.priceRetail);
            const stockQty = parseInt(row.stockQty);

            if (priceRetail <= 0) {
                throw new Error("Price must be positive");
            }

            if (stockQty < 0) {
                throw new Error("Stock quantity cannot be negative");
            }

            // Create product
            await prisma.product.create({
                data: {
                    storeId: storeId,
                    name: row.name.trim(),
                    priceRetail: priceRetail,
                    priceWholesale: row.priceWholesale ? parseFloat(row.priceWholesale) : null,
                    stockQty: stockQty,
                    category: row.category?.trim() || "General",
                    description: row.description?.trim() || null,
                    sku: row.sku?.trim() || null,
                    isArchived: false
                }
            });

            result.imported++;
        } catch (error: any) {
            result.failed++;
            result.errors.push({
                row: rowNumber,
                error: error.message || "Unknown error",
                data: row
            });
        }
    }

    if (result.imported > 0) {
        await logActivity(
            "PRODUCT_CREATED",
            `Bulk imported ${result.imported} products`,
            "PRODUCT",
            undefined,
            { imported: result.imported, failed: result.failed }
        );

        revalidatePath(`/${session.storeSlug}/admin/catalog`);
        revalidatePath(`/${session.storeSlug}/admin/inventory`);
    }

    return result;
}
