"use client";

import { AlertTriangle, Trash2 } from "lucide-react";

export default function DangerSettings() {
    return (
        <div className="space-y-6">
            <div className="bg-red-50 border border-red-100 rounded-[24px] p-6">
                <div className="flex gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0 text-red-600">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-red-900 mb-1">Delete Store</h4>
                        <p className="text-sm text-red-700 mb-6">
                            Once you delete your store, there is no going back. Please be certain.
                            All products, orders, and customer data will be permanently removed.
                        </p>
                        <button
                            disabled
                            className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg font-bold text-sm cursor-not-allowed opacity-60 flex items-center gap-2"
                        >
                            <Trash2 size={16} />
                            Delete Store (Contact Support)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
