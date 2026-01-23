"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                <AlertCircle size={32} className="text-red-500" />
            </div>

            <h2 className="text-2xl font-black text-gray-900 mb-2">
                Something went wrong
            </h2>

            <p className="text-gray-500 max-w-md mb-8">
                We encountered an error while loading this page. This might be a temporary issue.
            </p>

            <div className="flex gap-4">
                <button
                    onClick={() => reset()}
                    className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95 text-sm"
                >
                    <RefreshCw size={16} />
                    Try Again
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all text-sm"
                >
                    Reload Page
                </button>
            </div>

            {error.digest && (
                <p className="mt-8 text-xs text-gray-400 font-mono">
                    Error ID: {error.digest}
                </p>
            )}
        </div>
    );
}
