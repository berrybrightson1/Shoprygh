"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function createProduct(formData: FormData) {
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const stockQty = parseInt(formData.get("stockQty") as string) || 0;
    const file = formData.get("image") as File;

    if (!name || !price) return;

    let imagePath = "https://images.unsplash.com/photo-1515488042361-25f4682ae2ed?w=400"; // Default

    if (file && file.size > 0) {
        const buffer = await file.arrayBuffer();
        const base64String = Buffer.from(buffer).toString('base64');
        imagePath = `data:${file.type};base64,${base64String}`;
    }

    await prisma.product.create({
        data: {
            name,
            priceRetail: price,
            category,
            description,
            stockQty,
            image: imagePath
        }
    });

    revalidatePath("/admin/inventory");
    revalidatePath("/");
}

export async function deleteProduct(formData: FormData) {
    const id = formData.get("id") as string;
    if (!id) return;
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin/inventory");
    revalidatePath("/");
}

export async function updateStock(formData: FormData) {
    const id = formData.get("id") as string;
    const stockQty = parseInt(formData.get("stockQty") as string);
    if (!id || isNaN(stockQty)) return;
    await prisma.product.update({ where: { id }, data: { stockQty } });
    revalidatePath("/admin/inventory");
    revalidatePath("/");
}

export async function updatePrice(formData: FormData) {
    const id = formData.get("id") as string;
    const price = parseFloat(formData.get("price") as string);
    if (!id || isNaN(price)) return;
    await prisma.product.update({ where: { id }, data: { priceRetail: price } });
    revalidatePath("/admin/inventory");
    revalidatePath("/");
}

export async function updateCategory(formData: FormData) {
    const id = formData.get("id") as string;
    const category = formData.get("category") as string;
    if (!id || !category) return;
    await prisma.product.update({ where: { id }, data: { category } });
    revalidatePath("/admin/inventory");
    revalidatePath("/");
}
