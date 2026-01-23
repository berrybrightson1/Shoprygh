"use client";

import { useState } from "react";
import { Flag, Loader2, AlertTriangle, X } from "lucide-react";
import { reportCustomer } from "@/app/actions/customer";
import { toast } from "sonner";

interface ReportCustomerButtonProps {
    customerId: string;
    storeId: string;
    customerName: string;
}

export default function ReportCustomerButton({ customerId, storeId, customerName }: ReportCustomerButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [reason, setReason] = useState("Fake Payment");

    const handleReport = async () => {
        setIsLoading(true);
        try {
            const res = await reportCustomer(customerId, storeId, reason);
            if (res.success) {
                toast.success(`Customer reported. New status: ${res.newStatus}`);
                setIsOpen(false);
            } else {
                toast.error(res.message || "Failed to report");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                title="Report Customer (Bad Actor)"
                className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition"
            >
                <Flag size={18} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3 text-red-600">
                                <div className="bg-red-100 p-2 rounded-full">
                                    <AlertTriangle size={24} />
                                </div>
                                <h3 className="font-bold text-lg text-gray-900">Report Customer</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} title="Close" aria-label="Close" className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            Flagging <b className="text-black">{customerName}</b> will lower their trust score across <strong>all stores</strong> on the platform.
                        </p>

                        <div className="space-y-4 mb-6">
                            <label className="block text-xs font-bold uppercase text-gray-500">Reason</label>
                            <div className="space-y-2">
                                {["Fake Payment", "Refused Delivery", "Abusive / Harassment", "Other"].map((r) => (
                                    <label key={r} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                                        <input
                                            type="radio"
                                            name="reason"
                                            value={r}
                                            checked={reason === r}
                                            onChange={(e) => setReason(e.target.value)}
                                            className="accent-red-500 w-4 h-4"
                                        />
                                        <span className="text-sm font-medium text-gray-900">{r}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsOpen(false)}
                                disabled={isLoading}
                                className="flex-1 py-3 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReport}
                                disabled={isLoading}
                                className="flex-1 py-3 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-200 transition flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Submit Report"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
