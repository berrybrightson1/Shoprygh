import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import SettingsLayout from "@/components/admin/SettingsLayout";
import GeneralSettings from "./components/GeneralSettings";
import AccountSettings from "./components/AccountSettings";
import BillingSettings from "./components/BillingSettings";
import ActivitySettings from "./components/ActivitySettings";
import DangerSettings from "./components/DangerSettings";

export default async function SettingsPage({
    params,
    searchParams
}: {
    params: Promise<{ storeSlug: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await getSession();
    if (!session) redirect("/login");

    const { storeSlug } = await params;
    const { tab } = await searchParams;
    const activeTab = (typeof tab === "string" ? tab : "general") as string;

    // Fetch store details & Logs
    const store = await prisma.store.findUnique({
        where: { slug: storeSlug },
        select: {
            id: true,
            name: true,
            slug: true,
            tier: true,
            status: true,
            logo: true,
            ownerPhone: true,
            address: true,
            description: true,
        },
    });

    if (!store) redirect("/login");

    const logs = await prisma.auditLog.findMany({
        where: { userId: session.id },
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } }
    });

    return (
        <SettingsLayout storeSlug={storeSlug} activeTab={activeTab}>
            {activeTab === "general" && <GeneralSettings store={store} />}
            {activeTab === "account" && <AccountSettings session={session} />}
            {activeTab === "billing" && <BillingSettings store={store} />}
            {activeTab === "activity" && <ActivitySettings logs={logs} />}
            {activeTab === "danger" && <DangerSettings />}
        </SettingsLayout>
    );
}
