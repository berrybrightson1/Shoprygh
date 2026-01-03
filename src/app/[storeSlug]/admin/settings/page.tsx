import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Crown } from "lucide-react";
import { updateStoreTier } from "./actions";

export default async function SettingsPage({ params }: { params: Promise<{ storeSlug: string }> }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const { storeSlug } = await params;

    // Fetch store details
    const store = await prisma.store.findUnique({
        where: { slug: storeSlug },
        select: {
            id: true,
            name: true,
            slug: true,
            tier: true,
            status: true,
        },
    });

    if (!store) redirect("/login");

    const tierInfo = {
        HUSTLER: {
            name: "Hustler (Free)",
            price: "Free",
            features: ["Basic inventory", "Up to 100 products", "Standard support"],
        },
        PRO: {
            name: "Pro",
            price: "₵50/month",
            features: ["Unlimited products", "Multiple staff accounts", "Advanced reports", "Priority support"],
        },
        WHOLESALER: {
            name: "Wholesaler",
            price: "₵200/month",
            features: ["Everything in Pro", "Wholesale pricing", "SKU tracking", "Bulk import tools", "White-label branding"],
        },
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <Link
                    href={`/${storeSlug}/admin/inventory`}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition mb-6"
                >
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">Store Settings</h1>
                            <p className="text-gray-700 mt-1 font-semibold">{store.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-extrabold text-gray-800 uppercase tracking-wide">Store URL</p>
                            <p className="text-sm text-black font-black">shopry.app/{store.slug}</p>
                        </div>
                    </div>
                    <p className="text-gray-700 mb-8">Manage your subscription and account settings</p>

                    {/* Current Plan */}
                    <div className="mb-8 p-6 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-extrabold text-gray-800 uppercase tracking-wide mb-1">Current Plan</p>
                                <p className="text-2xl font-black text-gray-900">{tierInfo[store.tier as keyof typeof tierInfo].name}</p>
                                <p className="text-black mt-1 font-black text-lg">{tierInfo[store.tier as keyof typeof tierInfo].price}</p>
                            </div>
                            <Crown className="text-brand-orange" size={40} />
                        </div>
                    </div>

                    {/* Plan Selection */}
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Change Plan</h2>
                    <form action={updateStoreTier} className="space-y-4">
                        <input type="hidden" name="storeId" value={store.id} />
                        <input type="hidden" name="currentTier" value={store.tier} />

                        {Object.entries(tierInfo).map(([tier, info]) => (
                            <label
                                key={tier}
                                className={`relative flex items-start p-6 border-2 rounded-xl cursor-pointer transition-colors ${store.tier === tier
                                    ? "border-brand-cyan bg-brand-cyan/5"
                                    : "border-gray-200 hover:border-black"
                                    }`}
                            >
                                <div className="flex items-center h-5">
                                    <input
                                        id={`plan-${tier}`}
                                        name="tier"
                                        type="radio"
                                        value={tier}
                                        defaultChecked={store.tier === tier}
                                        className="focus:ring-black h-4 w-4 text-black border-gray-300"
                                    />
                                </div>
                                <div className="ml-4 flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <label htmlFor={`plan-${tier}`} className="font-bold text-lg text-gray-900">
                                            {info.name}
                                        </label>
                                        <span className="text-2xl font-black text-brand-orange">{info.price}</span>
                                    </div>
                                    <ul className="space-y-1 text-sm text-gray-700">
                                        {info.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                                <span className="text-brand-cyan font-bold">✓</span>
                                                <span className="text-gray-900">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    {store.tier === tier && (
                                        <div className="mt-3 inline-block px-3 py-1 bg-black text-white text-xs font-bold rounded-full">
                                            CURRENT PLAN
                                        </div>
                                    )}
                                </div>
                            </label>
                        ))}

                        <button
                            type="submit"
                            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg mt-6"
                        >
                            Update Plan & Proceed to Payment
                        </button>
                    </form>

                    {/* Payment Instructions */}
                    <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <h3 className="font-bold text-gray-900 mb-2">Payment Instructions</h3>
                        <p className="text-sm text-gray-700 mb-4">
                            After selecting your plan, you'll be redirected to Paystack to complete payment via Mobile Money, Card, or Bank Transfer.
                        </p>
                        <p className="text-xs text-gray-500">
                            <strong>Note:</strong> Paystack integration coming soon! For now, manual payment is required.
                            Contact support@shopry.app with your payment reference.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
