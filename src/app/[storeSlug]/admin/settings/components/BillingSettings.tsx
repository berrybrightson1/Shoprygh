"use client";

import { useState } from "react";
import { Crown, Check } from "lucide-react";
import { updateStoreTier } from "../actions";

const TIER_INFO = {
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

const TIER_THEMES: Record<string, { active: string; border: string; text: string; badge: string; pill: string }> = {
    HUSTLER: {
        active: "bg-emerald-950 border-emerald-900 shadow-xl shadow-emerald-900/10",
        border: "border-gray-200 hover:border-emerald-200",
        text: "text-emerald-400",
        badge: "bg-emerald-900/50 text-emerald-300 border-emerald-800",
        pill: "w-2 h-2 bg-emerald-400 rounded-full"
    },
    PRO: {
        active: "bg-gray-900 border-gray-900 shadow-xl shadow-gray-900/10",
        border: "border-gray-200 hover:border-gray-300",
        text: "text-white",
        badge: "bg-gray-800 text-gray-300 border-gray-700",
        pill: "w-2 h-2 bg-brand-cyan rounded-full"
    },
    WHOLESALER: {
        active: "bg-indigo-950 border-indigo-900 shadow-xl shadow-indigo-900/10",
        border: "border-gray-200 hover:border-indigo-200",
        text: "text-indigo-400",
        badge: "bg-indigo-900/50 text-indigo-300 border-indigo-800",
        pill: "w-2 h-2 bg-indigo-400 rounded-full"
    }
};

export default function BillingSettings({ store }: { store: any }) {
    const [selectedTier, setSelectedTier] = useState<string>(store.tier || "HUSTLER");
    const currentTierInfo = TIER_INFO[store.tier as keyof typeof TIER_INFO] || TIER_INFO.HUSTLER;

    const isDirty = selectedTier !== store.tier;

    // Helper to get theme safely
    // Helper to get theme safely
    const getTheme = (tier: string) => TIER_THEMES[tier] || TIER_THEMES.PRO;
    const currentTheme = getTheme(store.tier || "HUSTLER");

    return (
        <div className="space-y-8">
            {/* Current Plan Card - Dynamic Color */}
            <div className={`text-white rounded-[24px] p-6 md:p-8 relative overflow-hidden transition-all duration-500 ${currentTheme.active}`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                        <Crown size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold leading-none">Your Subscription</h2>
                        <p className="text-white/60 text-xs font-medium mt-1">Manage your billing cycle</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between relative z-10 gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Current Plan</p>
                        <p className="text-3xl font-bold">{currentTierInfo.name}</p>
                    </div>
                    <p className="font-black text-xl text-white/90">{currentTierInfo.price}</p>
                </div>
            </div>

            {/* Plan Selection */}
            <div>
                <h4 className="font-bold text-gray-900 mb-4">Change Plan</h4>
                <form action={updateStoreTier} className="space-y-3">
                    <input type="hidden" name="storeId" value={store.id} />
                    <input type="hidden" name="currentTier" value={store.tier} />

                    {Object.entries(TIER_INFO).map(([tier, info]) => {
                        const theme = getTheme(tier);
                        const isSelected = selectedTier === tier;

                        return (
                            <label
                                key={tier}
                                className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all group ${isSelected
                                    ? `${theme.active} scale-[1.02]`
                                    : `${theme.border} hover:bg-gray-50 opacity-70 hover:opacity-100`
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="tier"
                                    value={tier}
                                    checked={isSelected}
                                    onChange={() => setSelectedTier(tier)}
                                    className="sr-only"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <span className={`font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>{info.name}</span>
                                        {isSelected && (
                                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center fade-in zoom-in animate-in shadow-lg shadow-black/20">
                                                <Check size={14} strokeWidth={4} className={tier === 'PRO' ? 'text-brand-cyan' : theme.text} />
                                            </div>
                                        )}
                                    </div>
                                    <div className={`text-xs font-medium mt-1 ${isSelected ? 'text-gray-400' : 'text-gray-500'}`}>{info.price}</div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {info.features.slice(0, 2).map((f, i) => (
                                            <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${isSelected
                                                ? `${theme.badge} border`
                                                : "bg-gray-100 text-gray-600"
                                                }`}>
                                                {f}
                                            </span>
                                        ))}
                                        {info.features.length > 2 && (
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${isSelected
                                                ? `${theme.badge} border opacity-70`
                                                : "bg-gray-100 text-gray-400"
                                                }`}>
                                                +{info.features.length - 2} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </label>
                        );
                    })}

                    {/* Floating Action Bar */}
                    {isDirty && (
                        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
                            <div className="bg-white/80 backdrop-blur-xl border border-gray-100 p-2 rounded-[28px] shadow-2xl shadow-black/10 flex items-center gap-4 min-w-[300px] md:min-w-[450px]">
                                <div className="flex-1 px-4 hidden md:block border-r border-gray-100">
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Plan Selection</p>
                                    <p className="text-[10px] text-gray-500 font-medium">Ready to change your plan to {TIER_INFO[selectedTier as keyof typeof TIER_INFO]?.name}</p>
                                </div>
                                <div className="flex items-center gap-2 p-1 w-full md:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedTier(store.tier)}
                                        className="px-6 py-3 rounded-2xl text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-black text-white px-8 py-3 rounded-2xl text-xs font-bold shadow-xl shadow-black/10 hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        Update Subscription
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
