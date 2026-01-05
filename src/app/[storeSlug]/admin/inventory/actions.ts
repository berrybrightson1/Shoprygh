"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";

export async function createProduct(storeId: string, formData: FormData) {
    const name = formData.get("name") as string;
    const priceRetail = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const stockQty = parseInt(formData.get("stockQty") as string) || 0;

    // Complex fields
    const priceWholesaleStr = formData.get("priceWholesale") as string;
    const priceWholesale = priceWholesaleStr ? parseFloat(priceWholesaleStr) : null;
    const sku = formData.get("sku") as string || null;
    const weightStr = formData.get("weight") as string;
    const weight = weightStr ? parseFloat(weightStr) : null;
    const dimensions = formData.get("dimensions") as string || null;

    // --- Image Processing ---
    const mainFile = formData.get("image") as File;
    const galleryFiles = formData.getAll("gallery") as File[];

    let mainImagePath = "https://images.unsplash.com/photo-1515488042361-25f4682ae2ed?w=400"; // Default
    if (mainFile && mainFile.size > 0) {
        const buffer = await mainFile.arrayBuffer();
        mainImagePath = `data:${mainFile.type};base64,${Buffer.from(buffer).toString('base64')}`;
    }

    const galleryPaths: string[] = [];
    for (const file of galleryFiles) {
        if (file.size > 0) {
            const buffer = await file.arrayBuffer();
            galleryPaths.push(`data:${file.type};base64,${Buffer.from(buffer).toString('base64')}`);
        }
    }

    // --- Complex Data Parsing ---
    const tagsJson = formData.get("tags") as string;
    const tags = tagsJson ? JSON.parse(tagsJson) : [];

    const variantsJson = formData.get("variants") as string;
    const variantsData = variantsJson ? JSON.parse(variantsJson) : []; // Expecting [{name, price, stockQty, sku}]

    const product = await prisma.product.create({
        data: {
            name,
            priceRetail,
            priceWholesale,
            sku,
            weight,
            dimensions,
            category,
            description,
            stockQty,
            image: mainImagePath,
            gallery: galleryPaths,
            tags: tags,
            storeId,
            variants: {
                create: variantsData.map((v: any) => ({
                    name: v.name,
                    price: v.price ? parseFloat(v.price) : null,
                    stockQty: parseInt(v.stockQty) || 0,
                    sku: v.sku || null
                }))
            }
        }
    });

    await logActivity("CREATE_PRODUCT", `Created product: ${name}`, "PRODUCT", product.id, { price: priceRetail, stock: stockQty });

    revalidatePath(`/`, 'layout'); // Revalidate everything to be safe 
}

export async function deleteProduct(storeId: string, formData: FormData) {
    const id = formData.get("id") as string;
    if (!id) return;
    // Ensure product belongs to store
    // Ensure product belongs to store
    // Ensure product belongs to store
    await prisma.product.updateMany({
        where: { id, storeId },
        data: { isArchived: true }
    });
    await logActivity("ARCHIVE_PRODUCT", `Archived product ${id}`, "PRODUCT", id);
    revalidatePath(`/`); // Broad revalidation
}

export async function updateStock(storeId: string, formData: FormData) {
    const id = formData.get("id") as string;
    const stockQty = parseInt(formData.get("stockQty") as string);
    if (!id || isNaN(stockQty)) return;
    await prisma.product.updateMany({ where: { id, storeId }, data: { stockQty } });
    revalidatePath(`/`);
}

export async function updatePrice(storeId: string, formData: FormData) {
    const id = formData.get("id") as string;
    const price = parseFloat(formData.get("price") as string);
    if (!id || isNaN(price)) return;
    await prisma.product.updateMany({ where: { id, storeId }, data: { priceRetail: price } });
    revalidatePath(`/`);
}

export async function updateCategory(storeId: string, formData: FormData) {
    const id = formData.get("id") as string;
    const category = formData.get("category") as string;
    if (!id || !category) return;
    await prisma.product.updateMany({ where: { id, storeId }, data: { category } });
    revalidatePath(`/`);
}
