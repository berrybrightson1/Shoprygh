import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, Search, RefreshCw, Smartphone, Mail, DollarSign, Calendar } from "lucide-react";
import Link from "next/link";
import { syncCustomersFromOrders } from "./actions";

export default async function CustomersPage({ params }: { params: Promise<{ storeSlug: string }> }) {
    const session = await getSession();
    if (!session) redirect("/login");
    const { storeSlug } = await params;

    const customers = await prisma.customer.findMany({
        where: { storeId: session.storeId },
        orderBy: { lastOrderAt: "desc" }
    });

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <Users className="text-brand-purple" size={32} />
                        Customers
                    </h1>
                    <p className="text-gray-500 font-medium">Manage your customer relationships and history.</p>
                </div>

                <form action={syncCustomersFromOrders}>
                    <button type="submit" className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition shadow-sm">
                        <RefreshCw size={16} /> Sync from Orders
                    </button>
                </form>
            </header>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            placeholder="Search customers..."
                            className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-sm font-bold focus:ring-2 focus:ring-brand-purple/20 outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">Spent</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">Orders</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">Last Order</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/50">
                            {customers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Users size={32} className="opacity-50" />
                                        </div>
                                        <p className="font-bold">No customers found.</p>
                                        <p className="text-sm mt-1">Try clicking "Sync from Orders" if you have sales.</p>
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer.id} className="group hover:bg-blue-50/30 transition duration-200 cursor-pointer">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 text-purple-700 flex items-center justify-center font-black text-sm border border-purple-100">
                                                    {customer.name?.charAt(0) || "?"}
                                                </div>
                                                <span className="font-bold text-gray-900">{customer.name || "Unknown"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {customer.phone && (
                                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                                        <Smartphone size={12} className="text-gray-400" /> {customer.phone}
                                                    </div>
                                                )}
                                                {customer.email && (
                                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                                        <Mail size={12} className="text-gray-400" /> {customer.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black text-gray-900">₵{Number(customer.totalSpent).toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-gray-100 text-gray-800">
                                                {customer.totalOrders}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                                <Calendar size={12} />
                                                {customer.lastOrderAt ? new Date(customer.lastOrderAt).toLocaleDateString() : "N/A"}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
