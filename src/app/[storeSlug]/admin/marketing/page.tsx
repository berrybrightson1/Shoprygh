import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Tag, Plus, Trash2, Power, Percent, DollarSign, Calendar, Hash } from "lucide-react";
import { createCoupon, deleteCoupon, toggleCouponStatus } from "./actions";
import BrandedDropdown from "@/components/ui/BrandedDropdown";

export default async function MarketingPage({ params }: { params: Promise<{ storeSlug: string }> }) {
    const session = await getSession();
    if (!session) redirect("/login");
    const { storeSlug } = await params;

    const coupons = await prisma.coupon.findMany({
        where: { storeId: session.storeId },
        orderBy: { createdAt: "desc" },
        take: 50, // Limit to prevent crash
        select: {
            id: true,
            code: true,
            type: true,
            value: true,
            uses: true,
            maxUses: true,
            expiresAt: true,
            isActive: true
        }
    });

    return (
        <div className="p-8 lg:p-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <header className="mb-12 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-orange flex items-center justify-center border border-orange-100 shadow-sm">
                            <Tag size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            Campaign Engine
                        </h1>
                    </div>
                    <p className="text-sm text-gray-400 font-bold ml-1 uppercase tracking-widest">Growth tools & promotional tickets</p>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                {/* Create Coupon Form */}
                <div className="xl:col-span-1">
                    <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 sticky top-12">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg">
                                <Plus size={20} strokeWidth={3} />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Generate Ticket</h2>
                        </div>

                        <form action={createCoupon} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Promotional Code</label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        name="code"
                                        placeholder="SALE2024"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-black text-gray-900 focus:border-brand-cyan focus:bg-white transition-all uppercase outline-none shadow-sm placeholder:text-gray-300"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Reward Type</label>
                                    <BrandedDropdown
                                        name="type"
                                        placeholder="Select Type"
                                        options={[
                                            { value: "PERCENTAGE", label: "Percentage (%)" },
                                            { value: "FIXED", label: "Fixed (₵)" }
                                        ]}
                                        defaultValue="PERCENTAGE"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Benefit Value</label>
                                    <input
                                        name="value"
                                        type="number"
                                        step="0.01"
                                        placeholder="10"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-4 font-black text-gray-900 focus:border-brand-cyan focus:bg-white outline-none transition-all shadow-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Circulation Limit</label>
                                <input
                                    name="maxUses"
                                    type="number"
                                    placeholder="Unlimited Distribution"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-4 font-black text-gray-900 focus:border-brand-cyan focus:bg-white outline-none transition-all shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Expirations</label>
                                <input
                                    name="expiresAt"
                                    type="date"
                                    aria-label="Expiration Date"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-4 font-black text-gray-900 focus:border-brand-cyan focus:bg-white outline-none transition-all shadow-sm"
                                />
                            </div>

                            <button type="submit" className="w-full bg-black hover:bg-brand-cyan hover:text-black text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-black/10 uppercase tracking-[0.2em] text-[11px] active:scale-95 group mt-4">
                                Activate Campaign
                            </button>
                        </form>
                    </div>
                </div>

                {/* Coupons List */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-4 px-4">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Active Tickets</h3>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Growth Live</span>
                        </div>
                    </div>

                    {coupons.length === 0 ? (
                        <div className="bg-white rounded-[40px] border border-gray-100 p-24 text-center shadow-2xl shadow-gray-200/50">
                            <Tag className="mx-auto text-gray-100 mb-6" size={64} />
                            <h3 className="text-2xl font-black text-gray-900">Pipeline is empty</h3>
                            <p className="text-gray-400 font-bold mt-2">Generate your first campaign ticket to begin.</p>
                        </div>
                    ) : (
                        coupons.map((coupon) => (
                            <div key={coupon.id} className={`group bg-white rounded-[32px] border p-10 flex flex-col md:flex-row items-center justify-between gap-8 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200/50 relative overflow-hidden ${!coupon.isActive ? "opacity-50 grayscale border-gray-50 bg-gray-50/50" : "border-gray-50 shadow-xl shadow-gray-100/50"}`}>
                                {/* Perforated decoration */}
                                <div className="absolute top-1/2 -left-3 w-6 h-6 bg-gray-50 rounded-full -translate-y-1/2 border-r border-gray-100/30" />
                                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-gray-50 rounded-full -translate-y-1/2 border-l border-gray-100/30" />

                                <div className="flex items-center gap-8 w-full md:w-auto relative z-10">
                                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center font-black text-3xl shadow-inner transition-transform group-hover:scale-105 ${coupon.type === "PERCENTAGE" ? "bg-orange-50 text-brand-orange border border-orange-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
                                        {coupon.type === "PERCENTAGE" ? <Percent size={32} strokeWidth={3} /> : <span className="text-2xl">₵</span>}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <span className="font-black text-gray-900 text-3xl tracking-tighter uppercase">{coupon.code}</span>
                                            {!coupon.isActive ? (
                                                <span className="text-[9px] font-black bg-gray-200 text-gray-500 px-2 py-0.5 rounded uppercase tracking-widest">Offline</span>
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="text-[11px] font-black text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-gray-100">
                                                {coupon.type === "PERCENTAGE" ? `${coupon.value}% Yield Reduction` : `₵${coupon.value} Credit Value`}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-6 w-full md:w-auto relative z-10">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Usage Metrics</p>
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${coupon.type === "PERCENTAGE" ? "bg-brand-orange" : "bg-emerald-500"}`}
                                                    style={{ width: `${Math.min((coupon.uses / (coupon.maxUses || 100)) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-[13px] font-black text-gray-900">{coupon.uses} <span className="opacity-20">/</span> {coupon.maxUses || "∞"}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <form action={toggleCouponStatus}>
                                            <input type="hidden" name="couponId" value={coupon.id} />
                                            <input type="hidden" name="isActive" value={String(coupon.isActive)} />
                                            <button
                                                type="submit"
                                                className={`p-4 rounded-2xl transition-all shadow-sm active:scale-90 border ${coupon.isActive ? "text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100" : "text-gray-400 bg-gray-50 border-gray-100 hover:bg-gray-200"}`}
                                                title={coupon.isActive ? "Withdraw Campaign" : "Deploy Ticket"}
                                            >
                                                <Power size={20} strokeWidth={2.5} />
                                            </button>
                                        </form>
                                        <form action={deleteCoupon}>
                                            <input type="hidden" name="couponId" value={coupon.id} />
                                            <button
                                                type="submit"
                                                className="p-4 rounded-2xl bg-white text-gray-300 hover:bg-red-50 hover:text-brand-orange border border-gray-100 hover:border-orange-100 transition-all shadow-sm active:scale-90"
                                                title="Destroy Ticket"
                                            >
                                                <Trash2 size={20} strokeWidth={2.5} />
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
