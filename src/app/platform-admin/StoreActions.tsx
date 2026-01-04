"use client";

import { Store, Ban, Trash2, CheckCircle, User } from "lucide-react";
import Link from "next/link";
import { suspendStore, unsuspendStore, deleteStore, impersonateStoreOwner, updateStoreTierManually } from "./actions";

interface StoreActionsProps {
    store: {
        id: string;
        slug: string;
        name: string;
        status: "ACTIVE" | "SUSPENDED" | "DELETED";
        tier: string;
    };
}

export default function StoreActions({ store }: StoreActionsProps) {
    return (
        <div className="flex gap-2 items-center">
            {/* Tier Selector */}
            <form action={async (formData) => {
                await updateStoreTierManually(formData);
            }} className="mr-2">
                <input type="hidden" name="storeId" value={store.id} />
                <select
                    name="tier"
                    defaultValue={store.tier}
                    onChange={(e) => e.target.form?.requestSubmit()}
                    aria-label="Store Tier"
                    className="text-[10px] font-bold uppercase bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-brand-cyan outline-none cursor-pointer hover:bg-gray-50 transition"
                >
                    <option value="HUSTLER">Hustler</option>
                    <option value="PRO">Pro</option>
                    <option value="WHOLESALER">Wholesaler</option>
                </select>
            </form>

            <Link
                href={`/${store.slug}`}
                target="_blank"
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Visit Store"
            >
                <Store size={18} />
            </Link>

            {/* Impersonation Button */}
            <form action={impersonateStoreOwner}>
                <input type="hidden" name="storeId" value={store.id} />
                <button
                    type="submit"
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                    title="Login As Owner"
                >
                    <User size={18} />
                </button>
            </form>

            {store.status === "ACTIVE" ? (
                <form action={suspendStore}>
                    <input type="hidden" name="storeId" value={store.id} />
                    <button
                        type="submit"
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Suspend Store"
                    >
                        <Ban size={18} />
                    </button>
                </form>
            ) : (
                <form action={unsuspendStore}>
                    <input type="hidden" name="storeId" value={store.id} />
                    <button
                        type="submit"
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Unsuspend Store"
                    >
                        <CheckCircle size={18} />
                    </button>
                </form>
            )}
            <form action={deleteStore}>
                <input type="hidden" name="storeId" value={store.id} />
                <button
                    type="submit"
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    title="Delete Store"
                    onClick={(e) => {
                        if (!confirm(`Delete ${store.name}? This cannot be undone!`)) {
                            e.preventDefault();
                        }
                    }}
                >
                    <Trash2 size={18} />
                </button>
            </form>
        </div>
    );
}
