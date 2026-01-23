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
        <div className="p-8 lg:p-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <header className="mb-12 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-brand-cyan flex items-center justify-center border border-cyan-100 shadow-sm">
                            <Wallet size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            Treasury Hub
                        </h1>
                    </div>
                    <p className="text-sm text-gray-400 font-bold ml-1 uppercase tracking-widest">Financial liquidity & payout logs</p>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-2xl shadow-cyan-100/50 flex items-center gap-6 group hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-50 blur-[40px] opacity-40 rounded-full" />
                    <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-brand-cyan flex items-center justify-center border border-cyan-100 relative z-10">
                        <CreditCard size={20} strokeWidth={2.5} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total Earned Life-Time</p>
                        <p className="text-2xl font-black text-gray-900 tracking-tighter tabular-nums leading-none">
                            ₵{(store.transactions.filter(t => Number(t.amount) > 0).reduce((acc, t) => acc + Number(t.amount), 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </header>

            {/* Wallet & Quick Stats */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
                <div className="xl:col-span-2 bg-[#0A0A0B] text-white rounded-[40px] p-10 relative overflow-hidden shadow-2xl shadow-black/20 group">
                    {/* Animated background elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-cyan/20 blur-[120px] rounded-full opacity-50 transition-opacity group-hover:opacity-70" />
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-brand-purple/10 blur-[100px] rounded-full opacity-30" />

                    <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-start justify-between">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6 backdrop-blur-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Available Balance</span>
                            </div>
                            <div className="text-7xl font-black tracking-tighter leading-none mb-8 tabular-nums">
                                <span className="text-3xl font-bold opacity-30 mr-2 text-gray-400">₵</span>
                                {balance.toLocaleString()}
                            </div>

                            <div className="flex flex-wrap gap-8">
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Managed Store</p>
                                    <p className="font-bold text-gray-300 text-sm">{store.name}</p>
                                </div>
                                <div className="w-px h-10 bg-white/10 hidden sm:block" />
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Currency</p>
                                    <p className="font-bold text-gray-300 text-sm">GHS (₵)</p>
                                </div>
                            </div>
                        </div>

                        {/* Withdrawal Form */}
                        <form
                            action={requestPayout}
                            className="bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 w-full lg:w-[400px] shadow-2xl"
                        >
                            <p className="text-xs font-black text-gray-200 mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                                <ArrowUpRight size={14} className="text-brand-cyan" />
                                Withdraw Funds
                            </p>

                            <div className="space-y-4 mb-8">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <input
                                            name="amount"
                                            type="number"
                                            step="0.01"
                                            max={balance}
                                            placeholder="0.00"
                                            required
                                            aria-label="Withdrawal Amount"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-8 pr-4 text-white text-[15px] font-black placeholder:text-gray-600 focus:border-brand-cyan focus:bg-white/10 outline-none transition-all shadow-inner"
                                        />
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">₵</span>
                                    </div>
                                    <select
                                        name="method"
                                        aria-label="Payout Method"
                                        className="bg-white/5 border border-white/10 rounded-2xl px-4 text-white text-[13px] font-black outline-none focus:border-brand-cyan transition-all"
                                    >
                                        <option value="MOMO" className="bg-[#0A0A0B]">MOMO</option>
                                        <option value="BANK" className="bg-[#0A0A0B]">BANK</option>
                                    </select>
                                </div>

                                <input
                                    name="destination"
                                    placeholder="Target ID / Account Number"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white text-[13px] font-black placeholder:text-gray-600 focus:border-brand-cyan focus:bg-white/10 outline-none transition-all shadow-inner"
                                />
                            </div>

                            <button
                                type="submit"
                                style={{ backgroundColor: '#ffffff', color: '#000000' }}
                                className="w-full font-black py-4 rounded-2xl transition-all text-xs shadow-xl shadow-white/10 uppercase tracking-[0.2em] active:scale-95 group/btn border border-gray-200 hover:opacity-90"
                            >
                                Request Liquidity
                            </button>
                        </form>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-2xl shadow-gray-200/50 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 blur-[50px] rounded-full opacity-60" />
                    <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 border border-emerald-100 shadow-sm">
                        <ArrowDownLeft size={32} strokeWidth={2.5} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Aggregate Yield</p>
                    <p className="text-4xl font-black text-gray-900 tracking-tighter mb-4 tabular-nums block">
                        ₵{(store.transactions.filter(t => Number(t.amount) > 0).reduce((acc, t) => acc + Number(t.amount), 0).toFixed(2))}
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                        Income Trending Up
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Transaction History */}
                <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 bg-white flex justify-between items-center">
                        <h3 className="font-black text-gray-900 text-xl tracking-tight flex items-center gap-3">
                            Cash Stream
                            <span className="text-[10px] font-black text-gray-300 bg-gray-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">{store.transactions.length} Logs</span>
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {store.transactions.length === 0 ? (
                            <div className="p-24 text-center">
                                <DollarSign size={40} className="mx-auto text-gray-100 mb-4" />
                                <p className="font-black text-gray-900">No stream logs found</p>
                            </div>
                        ) : (
                            store.transactions.map(tx => (
                                <div key={tx.id} className="p-6 px-8 flex items-center justify-between group hover:bg-gray-50/50 transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${Number(tx.amount) > 0
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:rotate-12"
                                            : "bg-red-50 text-red-600 border-red-100 group-hover:-rotate-12"
                                            }`}>
                                            {Number(tx.amount) > 0 ? <ArrowDownLeft size={20} strokeWidth={2.5} /> : <ArrowUpRight size={20} strokeWidth={2.5} />}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 text-[15px] mb-0.5">{tx.description}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded uppercase tracking-widest border border-gray-100">{tx.type}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-black tracking-tight ${Number(tx.amount) > 0 ? "text-emerald-600" : "text-gray-900"}`}>
                                            {Number(tx.amount) > 0 ? "+" : ""} ₵{Number(tx.amount).toFixed(2)}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                            {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Payout Requests */}
                <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden h-max">
                    <div className="p-8 border-b border-gray-50 bg-white">
                        <h3 className="font-black text-gray-900 text-xl tracking-tight">Liquidity Requests</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {store.payouts.length === 0 ? (
                            <div className="p-24 text-center">
                                <Clock size={40} className="mx-auto text-gray-100 mb-4" />
                                <p className="font-black text-gray-900">No active request pipeline</p>
                            </div>
                        ) : (
                            store.payouts.map(payout => (
                                <div key={payout.id} className="p-6 px-8 flex items-center justify-between group hover:bg-gray-50/50 transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-brand-cyan/5 text-brand-cyan flex items-center justify-center border border-brand-cyan/10">
                                            <CreditCard size={20} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 text-[15px] mb-0.5">{payout.method} Settlement</p>
                                            <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest">{payout.destination}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-gray-900 tracking-tight mb-1">₵{Number(payout.amount).toFixed(2)}</p>
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${payout.status === "PENDING" ? "bg-orange-50 text-orange-700 border-orange-100" :
                                            payout.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                "bg-red-50 text-red-700 border-red-100"
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${payout.status === "PENDING" ? "bg-orange-500 animate-pulse" :
                                                payout.status === "APPROVED" ? "bg-emerald-500" : "bg-red-500"
                                                }`} />
                                            {payout.status}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
