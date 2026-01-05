"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";

interface DeleteConfirmationProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    isLoading?: boolean;
}

export default function DeleteConfirmation({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = "Delete",
    isLoading = false
}: DeleteConfirmationProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed bottom-8 left-0 right-0 z-[9999] flex justify-center px-4 pointer-events-none">
            {/* Action Island */}
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-red-100 p-6 max-w-2xl w-full pointer-events-auto flex flex-col md:flex-row items-start md:items-center gap-6 animate-in slide-in-from-bottom-4 fade-in duration-300">

                <div className="flex-shrink-0 w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                    <AlertTriangle size={24} strokeWidth={2.5} />
                </div>

                <div className="flex-1">
                    <h3 className="text-lg font-black text-gray-900 mb-1">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-5 py-3 bg-gray-50 hover:bg-white border border-gray-200 text-gray-700 font-bold rounded-xl transition shadow-sm hover:shadow text-sm whitespace-nowrap"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-5 py-3 bg-black hover:bg-gray-900 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition text-sm whitespace-nowrap flex items-center gap-2"
                    >
                        {isLoading && <Loader2 size={14} className="animate-spin" />}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
