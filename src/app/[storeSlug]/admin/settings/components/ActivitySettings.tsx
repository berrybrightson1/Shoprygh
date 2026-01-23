"use client";

import ActivityLogFeed from "@/components/ActivityLogFeed";
import BackfillButton from "../BackfillButton";

export default function ActivitySettings({ logs }: { logs: any[] }) {
    return (
        <div className="space-y-8">
            <div className="bg-gray-50 rounded-[24px] p-2 sm:p-4 border border-gray-100 max-h-[500px] overflow-y-auto custom-scrollbar">
                <ActivityLogFeed logs={logs as any} />
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
