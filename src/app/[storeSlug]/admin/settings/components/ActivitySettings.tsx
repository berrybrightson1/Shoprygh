"use client";

import ActivityLogFeed from "@/components/ActivityLogFeed";
import BackfillButton from "../BackfillButton";

export default function ActivitySettings({ logs }: { logs: any[] }) {
    return (
        <div className="space-y-8">
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-1">Audit Logs</h4>
                        <p className="text-sm text-gray-500">Track all actions taken by your team.</p>
                    </div>
                    {/* <BackfillButton /> */}
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 max-h-[500px] overflow-y-auto custom-scrollbar">
                    <ActivityLogFeed logs={logs as any} />
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
                <BackfillButton />
                <p className="text-xs text-gray-400 mt-2">
                    Use the backfill tool to generate historical logs for existing data if they are missing.
                </p>
            </div>
        </div>
    );
}
