"use client";

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Globe, Bell, Phone, MapPin } from "lucide-react";
import { useCurrencyStore, Currency } from "@/store/currency";
import BrandedSelect from "@/components/shared/BrandedSelect";
import ContactSellerModal from "@/components/ContactSellerModal";
import { useState } from "react";

interface Props {
    params: Promise<{ storeSlug: string }>;
    store: {
        id: string;
        name: string;
        address: string;
        ownerPhone: string | null;
        logo: string | null;
    };
}

export default function SettingsClient({ store, params }: { store: Props['store'], params: { storeSlug: string } }) {
    const { currency, setCurrency } = useCurrencyStore();
    const { storeSlug } = params;
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    const currencyOptions = ["GHS (₵)", "USD ($)", "EUR (€)", "GBP (£)"];
    const currencyMap: Record<string, Currency> = {
        "GHS (₵)": "GHS",
        "USD ($)": "USD",
        "EUR (€)": "EUR",
        "GBP (£)": "GBP",
    };
    const reverseCurrencyMap: Record<Currency, string> = {
        GHS: "GHS (₵)",
        USD: "USD ($)",
        EUR: "EUR (€)",
        GBP: "GBP (£)",
    };

    const handleCurrencyChange = (value: string) => {
        const newCurrency = currencyMap[value];
        if (newCurrency) {
            setCurrency(newCurrency);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 pt-6 pb-4 px-5">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/${storeSlug}`}
                        className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
                </div>
            </div>

            <div className="p-5 space-y-6">
                {/* Profile Card */}
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-50 shrink-0 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {store.logo ? (
                            <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
                        ) : (
                            <User size={32} />
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">Guest User</h2>
                        <p className="text-sm text-gray-400 font-medium">Buying from {store.name}</p>
                    </div>
                </div>

                {/* Preferences */}
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-2">Preferences</h3>
                    <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 divide-y divide-gray-50">

                        {/* Currency */}
                        <div className="p-4">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                                    <Globe size={18} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Currency</p>
                                    <p className="text-xs text-gray-400">Display prices in</p>
                                </div>
                            </div>
                            <BrandedSelect
                                name="currency"
                                options={currencyOptions}
                                value={reverseCurrencyMap[currency]}
                                onChange={handleCurrencyChange}
                                icon={<Globe size={16} />}
                            />
                        </div>

                        {/* Notifications */}
                        <div className="p-4 flex items-center justify-between group cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
                                    <Bell size={18} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Notifications</p>
                                    <p className="text-xs text-gray-400">Order updates & promos</p>
                                </div>
                            </div>
                            {/* Mock Toggle */}
                            <div className="w-11 h-6 bg-gray-900 rounded-full relative p-1">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Store Info */}
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-2">Store Support</h3>
                    <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 divide-y divide-gray-50">

                        {/* Contact */}
                        <button
                            onClick={() => store.ownerPhone && setIsContactModalOpen(true)}
                            disabled={!store.ownerPhone}
                            className="w-full p-4 flex items-center justify-between group cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                    <Phone size={18} strokeWidth={2.5} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-gray-900">Contact Seller</p>
                                    {store.ownerPhone ? (
                                        <p className="text-xs text-gray-400">+{store.ownerPhone}</p>
                                    ) : (
                                        <p className="text-xs text-gray-400">Not available</p>
                                    )}
                                </div>
                            </div>
                        </button>

                        {/* Address */}
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                                    <MapPin size={18} strokeWidth={2.5} />
                                </div>
                                <div className="pr-4">
                                    <p className="text-sm font-semibold text-gray-900">Store Address</p>
                                    <p className="text-xs text-gray-400 leading-relaxed mt-0.5">
                                        {store.address || "No physical address listed"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center pt-8 pb-4">
                    <p className="text-[10px] text-gray-300 font-medium uppercase tracking-widest">Powered by Shopry</p>
                    <p className="text-[10px] text-gray-300 mt-1">v1.2.0</p>
                </div>
            </div>

            {/* Contact Seller Modal */}
            {store.ownerPhone && (
                <ContactSellerModal
                    isOpen={isContactModalOpen}
                    onClose={() => setIsContactModalOpen(false)}
                    storeName={store.name}
                    phone={store.ownerPhone}
                />
            )}
        </div>
    );
}
