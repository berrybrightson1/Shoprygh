"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function DeleteOrderButton({
    orderId,
    deleteAction
}: {
    orderId: string,
    deleteAction: (id: string) => Promise<any>
}) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        toast.custom((t) => (
            <div className="bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] p-6 w-[340px] border border-gray-100 flex flex-col gap-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                        <Trash2 className="text-red-500" size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-0.5">Delete Order?</h4>
                        <p className="text-[11px] font-medium text-gray-400">Permanently remove <span className="text-gray-900">Order #{orderId.slice(-6).toUpperCase()}</span></p>
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-1">
                    <button
                        onClick={() => toast.dismiss(t)}
                        className="flex-1 py-3 rounded-xl text-xs font-bold text-gray-900 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t);
                            setIsDeleting(true);
                            try {
                                await deleteAction(orderId);
                                toast.success("Order deleted successfully");
                            } catch (error) {
                                toast.error("Failed to delete order");
                            } finally {
                                setIsDeleting(false);
                            }
                        }}
                        className="flex-1 py-3 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        Delete Record
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity,
            className: "!bg-transparent !border-0 !shadow-none !p-0 !min-w-0 !w-auto"
        });
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete Order"
            className="p-3 bg-white hover:bg-red-50 text-red-500 border border-red-200 hover:border-red-300 rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Trash2 size={18} strokeWidth={2.5} className={isDeleting ? "animate-pulse" : ""} />
        </button>
    );
}
