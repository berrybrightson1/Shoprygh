"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";

export async function createDeliveryZone(formData: FormData) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const fee = formData.get("fee") as string;
    const description = formData.get("description") as string;

    if (!name || !fee) throw new Error("Missing fields");

    await prisma.deliveryZone.create({
        data: {
            storeId: session.storeId,
            name,
            fee: parseFloat(fee),
            description
        }
    });

    await logActivity("DELIVERY_ZONE_CREATED", `Created delivery zone: ${name} (₵${fee})`, "DELIVERY_ZONE", undefined, { name, fee });
    revalidatePath(`/${session.storeSlug}/admin/settings/delivery`);
}

export async function deleteDeliveryZone(formData: FormData) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const id = formData.get("id") as string;
    await prisma.deliveryZone.delete({
        where: { id, storeId: session.storeId }
    });

    await logActivity("DELIVERY_ZONE_DELETED", `Deleted delivery zone`, "DELIVERY_ZONE", id);
    revalidatePath(`/${session.storeSlug}/admin/settings/delivery`);
}
