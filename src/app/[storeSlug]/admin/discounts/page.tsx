import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus, Ticket, Trash2, Power, History, Tag } from "lucide-react";
import { deleteCoupon, toggleCouponStatus } from "./actions";

export default async function DiscountsPage({ params }: { params: Promise<{ storeSlug: string }> }) {
    const { storeSlug } = await params;
    const store = await prisma.store.findUnique({
        where: { slug: storeSlug },
        select: { id: true, coupons: { orderBy: { createdAt: "desc" } } }
    });

    if (!store) return <div>Store not found</div>;

    const coupons = store.coupons;

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <Tag className="text-brand-purple" size={32} />
                        Discounts
                    </h1>
                    <p className="text-gray-600 font-bold mt-1">Manage coupon codes and deals.</p>
                </div>
                <Link
                    href={`/${storeSlug}/admin/discounts/new`}
                    className="flex items-center gap-2 bg-brand-purple hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-purple-200 transition transform hover:-translate-y-1 active:scale-95"
                >
                    <Plus size={20} /> New Coupon
                </Link>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.length === 0 ? (
                    <div className="col-span-full py-20 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
                            <Ticket className="text-purple-300" size={40} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">No active coupons</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-8">Create your first discount code to boost sales and reward customers.</p>
                        <Link
                            href={`/${storeSlug}/admin/discounts/new`}
                            className="text-brand-purple font-bold hover:underline"
                        >
                            Create Code
                        </Link>
                    </div>
                ) : (
                    coupons.map((coupon) => (
                        <div key={coupon.id} className={`bg-white rounded-[2rem] p-6 border transition hover:shadow-xl group relative overflow-hidden ${coupon.isActive ? 'border-gray-100 shadow-sm' : 'border-gray-100 opacity-60 bg-gray-50'}`}>

                            {/* Visual Decor */}
                            <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-purple-50 to-transparent rounded-bl-full -mr-4 -mt-4" />

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-gray-100 px-3 py-1 rounded-lg border border-gray-200">
                                        <span className="font-mono font-black text-lg text-gray-900 tracking-wide uppercase">{coupon.code}</span>
                                    </div>
                                    <form action={async () => {
                                        "use server";
                                        await toggleCouponStatus(coupon.id, storeSlug, coupon.isActive);
                                    }}>
                                        <button title={coupon.isActive ? "Deactivate" : "Activate"} className={`w-8 h-8 rounded-full flex items-center justify-center transition ${coupon.isActive ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-200'}`}>
                                            <Power size={14} />
                                        </button>
                                    </form>
                                </div>

                                <div className="mb-6">
                                    <span className="text-4xl font-black text-brand-purple tracking-tight">
                                        {coupon.type === "PERCENTAGE" ? `${Number(coupon.value)}%` : `₵${Number(coupon.value)}`}
                                    </span>
                                    <span className="text-sm font-bold text-gray-400 ml-1 uppercase">OFF</span>
                                </div>

                                <div className="flex items-center gap-4 text-xs font-bold text-gray-500 mb-6">
                                    <div className="flex items-center gap-1.5">
                                        <History size={12} />
                                        {coupon.uses} used
                                    </div>
                                    {coupon.maxUses && (
                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">Max: {coupon.maxUses}</span>
                                    )}
                                </div>

                                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                        {coupon.isActive ? <span className="text-green-500">Active</span> : "Inactive"}
                                    </p>
                                    <form action={async () => {
                                        "use server";
                                        await deleteCoupon(coupon.id, storeSlug);
                                    }}>
                                        <button className="text-red-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-lg">
                                            <Trash2 size={16} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
