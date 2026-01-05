import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Crown } from "lucide-react";
import { updateStoreTier } from "./actions";
import ProfileEditor from "./ProfileEditor";
import UserProfileEditor from "@/components/UserProfileEditor";
import PasswordUpdateForm from "./PasswordUpdateForm";
import ActivityLogFeed from "@/components/ActivityLogFeed";
import BackfillButton from "./BackfillButton";

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
            logo: true,
            ownerPhone: true,
            address: true,
            description: true,
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
        <div className="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-8">
                <div>
                    <Link
                        href={`/${storeSlug}/admin/inventory`}
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-black transition mb-4 font-bold text-xs uppercase tracking-wide"
                    >
                        <ArrowLeft size={14} strokeWidth={3} />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                        Settings
                    </h1>
                    <p className="text-lg text-gray-500 font-medium mt-2">Manage your store preferences and account details.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Store & Personal */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Store Profile */}
                    <section className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-gray-900">Store Profile</h2>
                            <p className="text-gray-400 font-medium">Public information visible to your customers.</p>
                        </div>
                        <ProfileEditor store={store} />
                    </section>

                    {/* Personal Profile */}
                    <section className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-gray-900">Personal Profile</h2>
                            <p className="text-gray-400 font-medium">Your account details and login information.</p>
                        </div>
                        <div className="space-y-8">
                            <UserProfileEditor user={{ name: session.user?.name || "User", image: session.user?.image || null, email: session.user?.email || "" }} />
                            <div className="h-px bg-gray-100" />
                            <PasswordUpdateForm userEmail={session.email} />
                        </div>
                    </section>
                </div>

                {/* Right Column: Subscription & Activity */}
                <div className="space-y-8">
                    {/* Subscription Card */}
                    <div className="bg-gray-900 text-white rounded-[32px] p-8 shadow-2xl shadow-gray-900/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                        <div className="flex items-center gap-3 mb-8 relative z-10">
                            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
                                <Crown size={24} className="text-brand-orange" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black leading-none">Subscription</h2>
                                <p className="text-gray-400 text-sm font-medium mt-1">Manage your billing</p>
                            </div>
                        </div>

                        <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Plan</p>
                                <p className="text-2xl font-black">{tierInfo[store.tier as keyof typeof tierInfo].name}</p>
                            </div>
                            <p className="text-brand-cyan font-black text-xl">{tierInfo[store.tier as keyof typeof tierInfo].price}</p>
                        </div>

                        <form action={updateStoreTier} className="space-y-3 relative z-10">
                            <input type="hidden" name="storeId" value={store.id} />
                            <input type="hidden" name="currentTier" value={store.tier} />

                            {Object.entries(tierInfo).map(([tier, info]) => (
                                <label
                                    key={tier}
                                    className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all group ${store.tier === tier
                                        ? "border-brand-cyan bg-brand-cyan/10"
                                        : "border-white/10 hover:bg-white/5"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="tier"
                                        value={tier}
                                        defaultChecked={store.tier === tier}
                                        className="sr-only"
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className={`font-bold ${store.tier === tier ? 'text-brand-cyan' : 'text-gray-300'}`}>{info.name}</span>
                                            {store.tier === tier && <div className="w-2 h-2 bg-brand-cyan rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />}
                                        </div>
                                        <div className="text-[10px] text-gray-500 font-medium mt-0.5">{info.price}</div>
                                    </div>
                                </label>
                            ))}

                            <button
                                type="submit"
                                className="w-full bg-white text-black py-4 rounded-xl font-black hover:bg-gray-100 transition shadow-lg mt-4 active:scale-[0.98]"
                            >
                                Update Plan
                            </button>
                        </form>
                    </div>

                    {/* Activity Feed */}
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-black text-gray-900">Recent Activity</h3>
                            <Link href="#" className="text-xs font-bold text-gray-400 hover:text-black">View All</Link>
                        </div>
                        <div className="-mx-4">
                            <SellerActivityFeed userId={session.id} />
                        </div>

                        {/* Backfill historical data button */}
                        <BackfillButton />
                    </div>
                </div>
            </div>
        </div>
    );
}

async function SellerActivityFeed({ userId }: { userId: string }) {
    const logs = await prisma.auditLog.findMany({
        where: { userId },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } }
    });

    return <ActivityLogFeed logs={logs as any} />;
}
