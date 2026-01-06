"use client";

import { useState } from "react";
import { RefreshCcw, Check } from "lucide-react";
import { backfillAuditLogs } from "./backfill-action";

export default function BackfillButton() {
    const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
    const [result, setResult] = useState<string | null>(null);

    const handleBackfill = async () => {
        if (status === "loading") return;

        setStatus("loading");
        const res = await backfillAuditLogs();

        if (res.success) {
            setResult(res.message || "Done!");
            setStatus("done");
        } else {
            setResult(res.error || "Failed");
            setStatus("idle");
        }
    };

    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-bold text-gray-900 text-sm">Backfill Activity Logs</p>
                    <p className="text-xs text-gray-500">Import existing data into activity history</p>
                </div>
                <button
                    onClick={handleBackfill}
                    disabled={status === "loading" || status === "done"}
                    className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shrink-0 whitespace-nowrap ${status === "done"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : status === "loading"
                            ? "bg-gray-200 text-gray-500"
                            : "bg-gray-900 text-white hover:bg-gray-800"
                        }`}
                >
                    {status === "loading" ? (
                        <>
                            <RefreshCcw size={14} className="animate-spin" />
                            Processing...
                        </>
                    ) : status === "done" ? (
                        <>
                            <Check size={14} />
                            {result}
                        </>
                    ) : (
                        <>
                            <RefreshCcw size={14} />
                            Run Backfill
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
