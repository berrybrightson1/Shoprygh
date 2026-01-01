import AdminSidebar from "@/components/AdminSidebar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            {/* Sidebar (Client Component) - Only show if logged in */}
            {session && <AdminSidebar user={session} />}

            <main className={`flex-1 transition-all duration-300 ${session ? "ml-0 md:ml-64" : ""}`}>
                {children}
            </main>
        </div>
    );
}
