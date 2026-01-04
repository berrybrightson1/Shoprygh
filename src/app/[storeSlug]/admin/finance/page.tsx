import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, DollarSign, CreditCard } from "lucide-react";
import { requestPayout } from "./actions";

export default async function FinancePage({ params }: { params: Promise<{ storeSlug: string }> }) {
    const session = await getSession();
    if (!session) redirect("/login");
    const { storeSlug } = await params;

    const store = await prisma.store.findUnique({
        where: { id: session.storeId },
        include: {
            transactions: { orderBy: { createdAt: "desc" }, take: 20 },
            payouts: { orderBy: { createdAt: "desc" }, take: 10 }
        }
    });

    if (!store) return <div className="p-10">Store not found</div>;

    const balance = Number(store.walletBalance).toFixed(2);

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <header>
                <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                    <Wallet className="text-brand-cyan" size={32} />
                    Finance & Payouts
                </h1>
                <p className="text-gray-600 font-bold mt-1">Manage your earnings, view history, and request withdrawals.</p>
            </header>

            {/* Wallet Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-[#111827] text-white rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-gray-900/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/20 blur-[80px] rounded-full pointer-events-none" />
                    <div className="relative z-10">
                        <p className="text-gray-300 font-black uppercase tracking-wider mb-2 text-xs">Available Balance</p>
                        <div className="text-5xl font-black mb-6 tracking-tight">GH₵ {balance}</div>

                        <div className="flex gap-4">
                            {/* Payout Trigger - Simple Modal-ish using Popover or just inline for now for MVP */}
                            <form
                                action={requestPayout}
                                className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 w-full max-w-sm"
                            >
                                <p className="text-xs font-bold text-gray-300 mb-3 uppercase">Request Withdrawal</p>
                                <div className="flex gap-2 mb-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-2.5 text-gray-400 text-sm">₵</span>
                                        <input
                                            name="amount"
                                            type="number"
                                            step="0.01"
                                            max={balance}
                                            placeholder="0.00"
                                            required
                                            className="w-full bg-[#1f2937] border border-gray-600 rounded-lg py-2 pl-7 pr-3 text-white text-sm font-bold focus:border-brand-cyan outline-none"
                                        />
                                    </div>
                                    <select name="method" aria-label="Payout Method" className="bg-[#1f2937] border border-gray-600 rounded-lg px-2 text-white text-sm font-bold outline-none">
                                        <option value="MOMO">Mobile Money</option>
                                        <option value="BANK">Bank Transfer</option>
                                    </select>
                                </div>
                                <input
                                    name="destination"
                                    placeholder="Phone / Account Number"
                                    required
                                    className="w-full bg-[#1f2937] border border-gray-600 rounded-lg py-2 px-3 text-white text-sm font-bold focus:border-brand-cyan outline-none mb-3"
                                />
                                <button type="submit" className="w-full bg-brand-cyan hover:bg-cyan-500 text-[#111827] font-black py-2 rounded-lg transition text-sm shadow-lg shadow-brand-cyan/20">
                                    Request Payout
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-center h-full">
                        <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-4 border border-green-100">
                            <ArrowDownLeft size={24} />
                        </div>
                        <span className="text-3xl font-black text-gray-900">GH₵ 0.00</span>
                        <span className="text-xs font-black text-gray-500 uppercase">Total Earned</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Transaction History */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-black text-lg text-gray-900">Recent Transactions</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {store.transactions.length === 0 && (
                            <div className="p-8 text-center text-gray-500 font-medium">No transactions yet.</div>
                        )}
                        {store.transactions.map(tx => (
                            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${Number(tx.amount) > 0 ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                                        {Number(tx.amount) > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{tx.description}</p>
                                        <p className="text-xs text-gray-500 font-bold">{tx.type}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-black text-sm ${Number(tx.amount) > 0 ? "text-green-600" : "text-gray-900"}`}>
                                        {Number(tx.amount) > 0 ? "+" : ""} {Number(tx.amount).toFixed(2)}
                                    </p>
                                    <p className="text-[10px] text-gray-500 font-bold">
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payout Requests */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-black text-lg text-gray-900">Payout Requests</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {store.payouts.length === 0 && (
                            <div className="p-8 text-center text-gray-500 font-medium">No active requests.</div>
                        )}
                        {store.payouts.map(payout => (
                            <div key={payout.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">Withdrawal to {payout.method}</p>
                                        <p className="text-xs text-gray-500 font-bold">{payout.destination}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-gray-900 text-sm">GH₵ {Number(payout.amount).toFixed(2)}</p>
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide ${payout.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                                        payout.status === "APPROVED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                        }`}>
                                        {payout.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
