"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function postSystemUpdate(formData: FormData) {
    const session = await getSession();
    if (!session || !session.isPlatformAdmin) {
        throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const version = formData.get("version") as string;
    const content = formData.get("content") as string;

    await prisma.systemUpdate.create({
        data: {
            title,
            version,
            content,
            type: "UPDATE"
        }
    });

    revalidatePath("/"); // Revalidate everything to show the green dot
    redirect("/platform-admin");
}
