"use client";

import { Drawer } from "vaul";
import { Activity, X, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import ActivityLogFeed from "@/components/ActivityLogFeed";

export default function MobileSystemLogsDrawer({ logs, storeSlug }: { logs: any[], storeSlug: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <Drawer.Root open={isOpen} onOpenChange={setIsOpen} direction="bottom">
            <Drawer.Trigger asChild>
                {/* Default Trigger if none provided, but we will mostly use custom one now */}
                <button
                    className="md:hidden flex items-center gap-2 w-full px-4 py-3 rounded-xl transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium group text-left"
                >
                    <span className="relative z-10 text-gray-400 group-hover:text-gray-900"><Activity size={20} /></span>
                    <span className="relative z-10 text-sm tracking-tight flex-1">System Activity</span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white uppercase">R</span>
                </button>
            </Drawer.Trigger>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
                <Drawer.Content className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-gray-50 flex flex-col rounded-t-[32px] z-50 focus:outline-none">
                    {/* Handle */}
                    <div className="w-full flex items-center justify-center pt-4 pb-2">
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="px-6 py-2 flex items-center justify-between border-b border-gray-100 pb-4">
                        <div>
                            <Drawer.Title className="text-xl font-black text-gray-900">System Activity</Drawer.Title>
                            <Drawer.Description className="text-xs text-gray-500 font-bold">Security & Action Logs</Drawer.Description>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 bg-gray-200 rounded-full text-gray-500 hover:bg-gray-300 transition-colors"
                            title="Close"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <ActivityLogFeed logs={logs} />
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
