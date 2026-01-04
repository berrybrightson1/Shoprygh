import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Check, TicketPercent } from "lucide-react";
import { createCoupon } from "../actions";

export default async function NewCouponPage({ params }: { params: Promise<{ storeSlug: string }> }) {
    const { storeSlug } = await params;
    const store = await prisma.store.findUnique({
        where: { slug: storeSlug },
        select: { id: true }
    });

    if (!store) return <div>Store not found</div>;

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Link href={`/${storeSlug}/admin/discounts`} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold mb-8 transition">
                <ArrowLeft size={18} /> Back to Discounts
            </Link>

            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-purple-100 border border-white/50 relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-bl-full -mr-16 -mt-16 -z-0" />

                <div className="relative z-10">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-brand-purple mb-6">
                        <TicketPercent size={32} />
                    </div>

                    <h1 className="text-3xl font-black text-gray-900 mb-2">Create Coupon</h1>
                    <p className="text-gray-500 font-medium mb-8">Generate a code to reward your loyal customers.</p>

                    <form action={createCoupon} className="space-y-6">
                        <input type="hidden" name="storeId" value={store.id} />

                        <div>
                            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">Coupon Code</label>
                            <input
                                type="text"
                                name="code"
                                placeholder="e.g. SUMMER2024"
                                required
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-xl font-black text-gray-900 placeholder:text-gray-300 focus:ring-4 focus:ring-purple-100 focus:border-brand-purple outline-none uppercase font-mono tracking-wide"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">Type</label>
                                <select name="type" aria-label="Discount Type" className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-4 focus:ring-purple-100 outline-none appearance-none">
                                    <option value="PERCENTAGE">Percentage (%)</option>
                                    <option value="FIXED">Fixed Amount (₵)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">Value</label>
                                <input
                                    type="number"
                                    name="value"
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="20"
                                    className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-4 focus:ring-purple-100 outline-none"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Limit Uses (Optional)</label>
                                    <input
                                        type="number"
                                        name="maxUses"
                                        placeholder="Unlimited"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-medium text-gray-900 focus:border-brand-purple outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Expires (Optional)</label>
                                    <input
                                        type="date"
                                        name="expiresAt"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-medium text-gray-900 focus:border-brand-purple outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button type="submit" className="w-full bg-brand-purple hover:bg-purple-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-purple-200 hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] transition flex items-center justify-center gap-2">
                                <Check size={20} /> Create Discount
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
