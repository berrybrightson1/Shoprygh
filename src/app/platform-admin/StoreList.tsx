"use client";

import { useState } from "react";
import { Search, Ban, CheckCircle } from "lucide-react";
import StoreActions from "./StoreActions";

type Store = {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    status: "ACTIVE" | "SUSPENDED" | "DELETED";
    tier: string;
    users: { name: string | null; email: string | null }[];
    _count: { products: number; orders: number; users: number };
};

export default function StoreList({ stores }: { stores: Store[] }) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredStores = stores.filter((store) => {
        const query = searchQuery.toLowerCase();
        return (
            store.name.toLowerCase().includes(query) ||
            store.slug.toLowerCase().includes(query) ||
            store.users[0]?.name?.toLowerCase().includes(query) ||
            store.users[0]?.email?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    All Stores
                    <span className="text-sm font-bold text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                        {stores.length} registered
                    </span>
                </h2>

                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="text-gray-400" size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search stores, owners, emails..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none font-bold text-gray-800 shadow-sm transition placeholder:font-medium placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* Column Headers (Hidden on Mobile) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 mb-2 text-xs font-black text-gray-500 uppercase tracking-wider">
                <div className="col-span-4 pl-2">Store</div>
                <div className="col-span-2">Owner</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-3">Stats</div>
                <div className="col-span-1 text-right pr-2">Actions</div>
            </div>

            <div className="space-y-3">
                {filteredStores.length === 0 ? (
                    <div className="text-center py-12 bg-white/50 rounded-3xl border border-dashed border-gray-300">
                        <p className="text-gray-400 font-bold">No stores found matching "{searchQuery}"</p>
                    </div>
                ) : (
                    filteredStores.map((store) => (
                        <div
                            key={store.id}
                            className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:scale-[1.01] transition duration-300 group grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                        >
                            {/* Store Info */}
                            <div className="md:col-span-4 flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex-shrink-0 flex items-center justify-center text-2xl font-black text-gray-600 group-hover:bg-brand-cyan group-hover:text-white transition duration-300 overflow-hidden relative border border-gray-100">
                                    {store.logo ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
                                    ) : (
                                        store.name.charAt(0)
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-lg leading-tight group-hover:text-brand-cyan transition">
                                        {store.name}
                                    </p>
                                    <p className="text-xs font-bold text-gray-500 font-mono mt-1 px-1.5 py-0.5 rounded-lg bg-gray-100 inline-block">
                                        /{store.slug}
                                    </p>
                                </div>
                            </div>

                            {/* Owner Info */}
                            <div className="md:col-span-2">
                                <p className="font-bold text-gray-900 text-sm">{store.users[0]?.name || "N/A"}</p>
                                <p className="text-xs text-gray-600 font-medium truncate">{store.users[0]?.email || "N/A"}</p>
                            </div>

                            {/* Status & Tier */}
                            <div className="md:col-span-2 flex flex-col items-start gap-2">
                                <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${store.status === "ACTIVE"
                                        ? "bg-green-50 text-green-800 border-green-200"
                                        : store.status === "SUSPENDED"
                                            ? "bg-red-50 text-red-800 border-red-200"
                                            : "bg-gray-50 text-gray-800 border-gray-200"
                                        }`}
                                >
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full ${store.status === "ACTIVE" ? "bg-green-600" : store.status === "SUSPENDED" ? "bg-red-600" : "bg-gray-600"}`}
                                    />
                                    {store.status === "ACTIVE" ? <CheckCircle size={10} className="fill-current" /> : <Ban size={10} />}
                                    {store.status}
                                </span>
                                <span
                                    className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide opacity-80 ${store.tier === "WHOLESALER"
                                        ? "bg-orange-50 text-orange-800"
                                        : store.tier === "PRO"
                                            ? "bg-purple-50 text-purple-800"
                                            : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    {store.tier} PLAN
                                </span>
                            </div>

                            {/* Stats */}
                            <div className="md:col-span-3 flex gap-4">
                                <div>
                                    <span className="block font-black text-gray-900 text-lg">{store._count.products}</span>
                                    <span className="text-[9px] uppercase text-gray-500 font-black tracking-wider">Items</span>
                                </div>
                                <div className="w-px h-8 bg-gray-200" />
                                <div>
                                    <span className="block font-black text-gray-900 text-lg">{store._count.orders}</span>
                                    <span className="text-[9px] uppercase text-gray-500 font-black tracking-wider">Orders</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="md:col-span-1 flex justify-end">
                                <StoreActions store={{ ...store, tier: store.tier }} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
