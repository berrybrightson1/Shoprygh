import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Shield, AlertCircle, CheckCircle, Ban } from "lucide-react";
import StoreActions from "./StoreActions";

// Platform Admin Dashboard - Force rebuild
export default async function PlatformAdminPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    // Check if user is platform admin
    const user = await prisma.user.findUnique({
        where: { email: session.email },
        select: { isPlatformAdmin: true },
    });

    if (!user?.isPlatformAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600">You do not have Platform Admin privileges.</p>
                    <Link href="/" className="mt-6 inline-block text-brand-orange hover:underline font-bold">
                        Go to Homepage
                    </Link>
                </div>
            </div>
        );
    }

    // Fetch all stores
    const stores = await prisma.store.findMany({
        include: {
            users: {
                where: { role: "OWNER" },
                select: { name: true, email: true },
            },
            _count: {
                select: { products: true, orders: true, users: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    const stats = {
        total: stores.length,
        active: stores.filter((s) => s.status === "ACTIVE").length,
        suspended: stores.filter((s) => s.status === "SUSPENDED").length,
        hustler: stores.filter((s) => s.tier === "HUSTLER").length,
        pro: stores.filter((s) => s.tier === "PRO").length,
        wholesaler: stores.filter((s) => s.tier === "WHOLESALER").length,
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-black to-gray-800 rounded-2xl p-8 mb-8 text-white">
                    <div className="flex items-center gap-4 mb-2">
                        <Shield size={40} />
                        <h1 className="text-4xl font-black">Platform Admin</h1>
                    </div>
                    <p className="text-gray-300">Manage all stores, subscriptions, and accounts</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <StatCard label="Total Stores" value={stats.total} color="bg-blue-500" />
                    <StatCard label="Active" value={stats.active} color="bg-green-500" />
                    <StatCard label="Suspended" value={stats.suspended} color="bg-red-500" />
                    <StatCard label="Hustler (Free)" value={stats.hustler} color="bg-gray-500" />
                    <StatCard label="Pro" value={stats.pro} color="bg-purple-500" />
                    <StatCard label="Wholesaler" value={stats.wholesaler} color="bg-orange-500" />
                </div>

                {/* Stores Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-black text-gray-900">All Stores</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Store</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Owner</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Tier</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Stats</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Created</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {stores.map((store) => (
                                    <tr key={store.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-gray-900">{store.name}</p>
                                                <p className="text-sm text-gray-500">/{store.slug}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{store.users[0]?.name || "N/A"}</p>
                                                <p className="text-sm text-gray-500">{store.users[0]?.email || "N/A"}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${store.tier === "WHOLESALER"
                                                    ? "bg-orange-100 text-orange-800"
                                                    : store.tier === "PRO"
                                                        ? "bg-purple-100 text-purple-800"
                                                        : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {store.tier}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${store.status === "ACTIVE"
                                                    ? "bg-green-100 text-green-800"
                                                    : store.status === "SUSPENDED"
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {store.status === "ACTIVE" ? <CheckCircle size={12} /> : <Ban size={12} />}
                                                {store.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div>{store._count.products} products</div>
                                            <div>{store._count.orders} orders</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(store.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <td className="px-6 py-4">
                                                <StoreActions store={store} />
                                            </td>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white font-black text-2xl mb-3`}>
                {value}
            </div>
            <p className="text-xs font-bold text-gray-600 uppercase">{label}</p>
        </div>
    );
}
