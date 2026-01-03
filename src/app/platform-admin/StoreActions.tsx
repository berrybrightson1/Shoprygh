"use client";

import { Store, Ban, Trash2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { suspendStore, unsuspendStore, deleteStore } from "./actions";

interface StoreActionsProps {
    store: {
        id: string;
        slug: string;
        name: string;
        status: "ACTIVE" | "SUSPENDED" | "DELETED";
    };
}

export default function StoreActions({ store }: StoreActionsProps) {
    return (
        <div className="flex gap-2">
            <Link
                href={`/${store.slug}`}
                target="_blank"
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Visit Store"
            >
                <Store size={18} />
            </Link>
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
