"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global Error Caught:", error);
    }, [error]);

    return (
        <div className="fixed inset-0 bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
                    <AlertTriangle size={32} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Something went wrong!</h2>
                <p className="text-gray-500 font-medium mb-8">
                    We apologize for the inconvenience. An unexpected error occurred while loading this page.
                </p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => window.location.href = "/"}
                        className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition"
                    >
                        Go Home
                    </button>
                    <button
                        onClick={reset}
                        className="px-6 py-3 rounded-xl font-bold bg-gray-900 text-white hover:bg-black transition flex items-center gap-2"
                    >
                        <RefreshCcw size={16} />
                        Try Again
                    </button>
                </div>
                {process.env.NODE_ENV === "development" && (
                    <div className="mt-8 p-4 bg-gray-900 rounded-xl text-left overflow-hidden">
                        <p className="text-red-400 font-mono text-xs font-bold mb-2">DEV ERROR LOG:</p>
                        <p className="text-gray-300 font-mono text-xs break-all">
                            {error.message}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
