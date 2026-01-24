import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import PlatformSidebar from "@/components/PlatformSidebar";
import prisma from "@/lib/prisma";
import DashboardShell from "./DashboardShell";

export default async function PlatformAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    if (!session) redirect("/login");

    // Check if user is platform admin
    const user = await prisma.user.findUnique({
        where: { email: session.email },
        select: { isPlatformAdmin: true, name: true, email: true, image: true, role: true },
    });

    if (!user?.isPlatformAdmin) {
        redirect("/");
    }

    // Fetch audit logs for the sidebar
    const logs = await prisma.auditLog.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true, image: true } } }
    });

    return (
        <DashboardShell session={session} user={user} logs={logs}>
            {children}
        </DashboardShell>
    );
}
