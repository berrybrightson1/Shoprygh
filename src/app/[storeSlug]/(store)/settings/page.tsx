import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import SettingsClient from "./SettingsClient";

interface Props {
    params: Promise<{ storeSlug: string }>;
}

export default async function SettingsPage({ params }: Props) {
    const { storeSlug } = await params;

    const store = await prisma.store.findUnique({
        where: { slug: storeSlug },
        select: {
            id: true,
            name: true,
            address: true,
            ownerPhone: true,
            logo: true,
        }
    });

    if (!store) {
        notFound();
    }

    return <SettingsClient store={store} params={{ storeSlug }} />;
}
