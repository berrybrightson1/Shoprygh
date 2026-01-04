import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Tag, Plus, Trash2, Power, Percent, DollarSign, Calendar, Hash } from "lucide-react";
import { createCoupon, deleteCoupon, toggleCouponStatus } from "./actions";

export default async function MarketingPage({ params }: { params: Promise<{ storeSlug: string }> }) {
    const session = await getSession();
    if (!session) redirect("/login");
    const { storeSlug } = await params;

    const coupons = await prisma.coupon.findMany({
        where: { storeId: session.storeId },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <Tag className="text-brand-orange" size={32} />
                        Marketing & Discounts
                    </h1>
                    <p className="text-gray-500 font-medium">Create coupons and boost your sales.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Coupon Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-6 sticky top-6">
                        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Plus className="bg-gray-100 rounded-full p-1" size={24} /> New Coupon
                        </h2>

                        <form action={createCoupon} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Coupon Code</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-3 text-gray-400" size={16} />
                                    <input
                                        name="code"
                                        placeholder="SALE2024"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-3 font-bold text-gray-900 focus:ring-2 focus:ring-brand-cyan/20 outline-none uppercase"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Type</label>
                                    <select name="type" aria-label="Coupon Type" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 font-bold text-gray-900 outline-none">
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FIXED">Fixed Amount (₵)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Value</label>
                                    <input
                                        name="value"
                                        type="number"
                                        step="0.01"
                                        placeholder="10"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 font-bold text-gray-900 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Max Uses (Optional)</label>
                                <input
                                    name="maxUses"
                                    type="number"
                                    placeholder="Unlimited"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 font-bold text-gray-900 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Expires On (Optional)</label>
                                <input
                                    name="expiresAt"
                                    type="date"
                                    aria-label="Expiration Date"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 font-bold text-gray-900 outline-none"
                                />
                            </div>

                            <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-95 transition shadow-lg shadow-black/20 mt-2">
                                Create Coupon
                            </button>
                        </form>
                    </div>
                </div>

                {/* Coupons List */}
                <div className="lg:col-span-2 space-y-4">
                    {coupons.length === 0 ? (
                        <div className="bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
                            <Tag className="mx-auto text-gray-300 mb-4" size={48} />
                            <h3 className="text-xl font-bold text-gray-400">No active coupons</h3>
                            <p className="text-gray-400">Create your first discount code to start promoting!</p>
                        </div>
                    ) : (
                        coupons.map((coupon) => (
                            <div key={coupon.id} className={`bg-white rounded-2xl border p-5 flex flex-col md:flex-row items-center justify-between gap-4 transition shadow-sm hover:shadow-md ${!coupon.isActive ? "opacity-60 border-gray-100 bg-gray-50" : "border-gray-100"}`}>
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl shadow-inner ${coupon.type === "PERCENTAGE" ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"}`}>
                                        {coupon.type === "PERCENTAGE" ? <Percent size={24} /> : <DollarSign size={24} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-gray-900 text-xl tracking-wide">{coupon.code}</span>
                                            {!coupon.isActive && <span className="text-[10px] font-bold bg-gray-200 text-gray-500 px-2 py-0.5 rounded">INACTIVE</span>}
                                        </div>
                                        <p className="text-gray-500 font-bold text-sm">
                                            {coupon.type === "PERCENTAGE" ? `${coupon.value}% OFF` : `₵${coupon.value} OFF`}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1 text-xs font-medium text-gray-400">
                                            <span>Used: {coupon.uses} times</span>
                                            {coupon.maxUses && <span>/ Limit: {coupon.maxUses}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                    <form action={toggleCouponStatus}>
                                        <input type="hidden" name="couponId" value={coupon.id} />
                                        <input type="hidden" name="isActive" value={String(coupon.isActive)} />
                                        <button type="submit" className={`p-2 rounded-lg transition ${coupon.isActive ? "text-green-600 bg-green-50 hover:bg-green-100" : "text-gray-400 bg-gray-100 hover:bg-gray-200"}`} title={coupon.isActive ? "Deactivate" : "Activate"}>
                                            <Power size={18} />
                                        </button>
                                    </form>
                                    <form action={deleteCoupon}>
                                        <input type="hidden" name="couponId" value={coupon.id} />
                                        <button type="submit" className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition" title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
