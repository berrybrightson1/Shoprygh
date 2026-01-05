"use client";

import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const code = searchParams.get("error_code");
    const desc = searchParams.get("error_description");

    return (
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-gray-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Authentication Error</h1>
            <p className="text-gray-500 font-medium mb-6">
                We encountered an issue verifying your login link.
            </p>

            {(error || desc) && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs font-mono text-left mb-6 break-words">
                    <p><strong>Error:</strong> {error || "Unknown"}</p>
                    <p><strong>Code:</strong> {code || "None"}</p>
                    <p><strong>Desc:</strong> {desc || "No description provided"}</p>
                </div>
            )}

            <div className="space-y-3">
                <Link
                    href="/signup"
                    className="block w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition"
                >
                    Try Signing Up Again
                </Link>
                <Link
                    href="/login"
                    className="block w-full bg-gray-100 text-gray-600 py-4 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                    Back to Login
                </Link>
            </div>
        </div>
    );
}

export default function AuthCodeErrorPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Suspense fallback={<div>Loading error details...</div>}>
                <ErrorContent />
            </Suspense>
        </div>
    );
}
