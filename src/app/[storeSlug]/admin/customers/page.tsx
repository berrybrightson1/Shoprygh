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
        <div className="p-8 lg:p-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <header className="mb-12 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-brand-purple flex items-center justify-center border border-purple-100 shadow-sm">
                            <Users size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            Client Relations
                        </h1>
                    </div>
                    <p className="text-sm text-gray-400 font-bold ml-1 uppercase tracking-widest">Customer history & trust scores</p>
                </div>

                <form action={syncCustomersFromOrders}>
                    <button
                        type="submit"
                        className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 transition-all flex items-center gap-3 active:scale-95"
                    >
                        <RefreshCw size={18} strokeWidth={3} className="group-active:animate-spin" />
                        Sync Pipeline
                    </button>
                </form>
            </header>

            {/* Main CRM Container */}
            <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="p-8 lg:p-10 border-b border-gray-50 bg-white flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative w-full sm:w-[400px]">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            placeholder="Search identities, phone, tags..."
                            className="bg-gray-50/50 border border-gray-100 pl-11 pr-4 py-4 rounded-2xl text-[13px] font-black text-gray-900 outline-none focus:border-brand-purple focus:bg-white transition-all w-full placeholder:text-gray-400 shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="bg-gray-50/30 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                <th className="p-6 pl-10 w-[30%]">Client Identity</th>
                                <th className="p-6">Contact Channels</th>
                                <th className="p-6">Cumulative Value</th>
                                <th className="p-6">Logistics Count</th>
                                <th className="p-6 pr-10 text-right">Recency</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {customers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-32 text-center text-gray-500">
                                        <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mx-auto mb-6">
                                            <Users size={40} className="text-gray-200" />
                                        </div>
                                        <p className="font-black text-gray-900 text-xl">Identity list is empty</p>
                                        <p className="text-gray-400 font-bold mt-2">Sync with orders to populate your database.</p>
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer.id} className="group hover:bg-white hover:shadow-[0_0_80px_rgba(0,0,0,0.02)] transition-all cursor-default">
                                        <td className="p-6 pl-10">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 text-brand-purple flex items-center justify-center font-black text-lg border border-purple-100 shadow-sm transition-transform group-hover:scale-110">
                                                    {customer.name?.charAt(0) || <Smartphone size={18} />}
                                                </div>
                                                <div>
                                                    <div className="font-black text-[15px] text-gray-900 group-hover:text-brand-purple transition-colors mb-0.5">{customer.name || "UNIDENTIFIED"}</div>
                                                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        Active Pipeline
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-6">
                                            <div className="flex flex-col gap-2">
                                                {customer.phone && (
                                                    <div className="flex items-center gap-2.5 text-[13px] font-black text-gray-600">
                                                        <div className="p-1 px-1.5 bg-gray-50 rounded-lg border border-gray-100"><Smartphone size={12} className="text-gray-400" /></div>
                                                        {customer.phone}
                                                    </div>
                                                )}
                                                {customer.email && (
                                                    <div className="flex items-center gap-2.5 text-[13px] font-black text-gray-600">
                                                        <div className="p-1 px-1.5 bg-gray-50 rounded-lg border border-gray-100"><Mail size={12} className="text-gray-400" /></div>
                                                        {customer.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="p-6">
                                            <div className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1">
                                                ₵{Number(customer.totalSpent).toFixed(2)}
                                            </div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Liquidity</div>
                                        </td>

                                        <td className="p-6">
                                            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gray-50 border border-gray-100 transition-all group-hover:bg-black group-hover:text-white group-hover:border-black">
                                                <DollarSign size={12} className="opacity-50" />
                                                <span className="text-[11px] font-black uppercase tracking-widest">{customer.totalOrders} Shipments</span>
                                            </div>
                                        </td>

                                        <td className="p-6 pr-10 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-2 text-[13px] font-black text-gray-900">
                                                    <Calendar size={14} className="text-gray-300" />
                                                    {customer.lastOrderAt ? new Date(customer.lastOrderAt).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' }) : "---"}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Last Interaction</div>
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
