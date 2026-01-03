"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function seedTestProducts(storeId: string) {
    const defaultProducts = [
        {
            name: "Baby Feeding Vest",
            description: "Soft cotton feeding vest for infants, comfortable and easy to clean",
            category: "Feeding",
            priceRetail: 230,
            stockQty: 50,
            image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23FF6B35' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='white' text-anchor='middle' dy='.3em'%3EBaby Vest%3C/text%3E%3C/svg%3E"
        },
        {
            name: "Yolo Bedding Set",
            description: "Premium baby bedding set with soft materials, perfect for cribs",
            category: "Clothing",
            priceRetail: 300,
            stockQty: 30,
            image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%2300BCD4' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='white' text-anchor='middle' dy='.3em'%3EBedding Set%3C/text%3E%3C/svg%3E"
        },
        {
            name: "Baby Diapers Pack",
            description: "Super absorbent diapers, pack of 3, suitable for newborns",
            category: "Diapers",
            priceRetail: 99,
            stockQty: 100,
            image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23FFD700' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='white' text-anchor='middle' dy='.3em'%3EDiapers Pack%3C/text%3E%3C/svg%3E"
        },
        {
            name: "Visual Verify Toy",
            description: "Educational toy to help develop baby's visual skills",
            category: "All",
            priceRetail: 150,
            stockQty: 45,
            image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23FFEB3B' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='gray' text-anchor='middle' dy='.3em'%3EToy%3C/text%3E%3C/svg%3E"
        },
        {
            name: "Baby Bottle Set",
            description: "BPA-free baby bottles, set of 4, easy to clean",
            category: "Feeding",
            priceRetail: 180,
            stockQty: 60,
            image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%239C27B0' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='white' text-anchor='middle' dy='.3em'%3EBottle Set%3C/text%3E%3C/svg%3E"
        },
        {
            name: "Soft Baby Blanket",
            description: "Ultra-soft fleece blanket, perfect for keeping baby warm",
            category: "Clothing",
            priceRetail: 120,
            stockQty: 40,
            image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23E91E63' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='white' text-anchor='middle' dy='.3em'%3EBlanket%3C/text%3E%3C/svg%3E"
        },
    ];

    try {
        // Check if store already has products
        const existingCount = await prisma.product.count({
            where: { storeId }
        });

        if (existingCount > 0) {
            return { success: false, message: `Store already has ${existingCount} products` };
        }

        // Add test products
        for (const product of defaultProducts) {
            await prisma.product.create({
                data: {
                    ...product,
                    storeId,
                }
            });
        }

        revalidatePath(`/[storeSlug]`, 'page');

        return { success: true, message: `Added ${defaultProducts.length} test products` };
    } catch (error) {
        console.error('Error seeding products:', error);
        return { success: false, message: 'Failed to add products' };
    }
}
