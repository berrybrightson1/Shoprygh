"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateStoreProfile(formData: FormData) {
    const storeId = formData.get("storeId") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const description = formData.get("description") as string;
    const logo = formData.get("logo") as string; // Base64 or URL

    if (!storeId || !name) {
        throw new Error("Store ID and name are required");
    }

    // Update store profile
    const store = await prisma.store.update({
        where: { id: storeId },
        data: {
            name,
            ownerPhone: phone || null,
            address: address || null,
            description: description || null,
            logo: logo || null,
        },
    });

    revalidatePath(`/${store.slug}/admin/settings`);
    redirect(`/${store.slug}/admin/settings?updated=true`);
}
