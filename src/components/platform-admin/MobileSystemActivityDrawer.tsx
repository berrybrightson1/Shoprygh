"use client";

import { Drawer } from "vaul";
import { Settings, LogOut, Activity, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import BroadcastModal from "@/components/modals/BroadcastModal";
import ActivityLogFeed from "@/components/ActivityLogFeed";
import { logout } from "@/app/actions/auth";

interface MobileSystemActivityDrawerProps {
    session: { email: string };
    user: { name: string | null; image: string | null; isPlatformAdmin: boolean };
    logs: any[];
}

export default function MobileSystemActivityDrawer({ session, user, logs }: MobileSystemActivityDrawerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <Drawer.Root open={isOpen} onOpenChange={setIsOpen} direction="bottom">
            {/* Mobile Floating Trigger for System Activity */}
            <Drawer.Trigger asChild>
                <button
                    className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-black text-white rounded-full shadow-2xl shadow-blue-900/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-4 border-white/20"
                    title="Open System Activity"
                >
                    <Activity size={24} />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                        •
                    </span>
                </button>
            </Drawer.Trigger>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm" />
                <Drawer.Content className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-white flex flex-col rounded-t-[32px] z-[60] focus:outline-none">
                    {/* Handle */}
                    <div className="w-full flex items-center justify-center pt-4 pb-2">
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="px-6 py-2 flex items-center justify-between border-b border-gray-100 pb-4">
                        <div>
                            <h2 className="text-xl font-black text-gray-900">System Activity</h2>
                            <p className="text-xs text-gray-500 font-bold">Realtime platform logs</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                            title="Close"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-gray-50">
                        {/* Profile Card Section */}
                        <div className="p-6 pb-2">
                            <div className="bg-white rounded-[24px] p-6 flex flex-col items-center text-center border border-gray-200 shadow-sm">
                                <div className="relative mb-3">
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg shadow-gray-200 overflow-hidden bg-gray-50 border-4 border-white">
                                        <img
                                            src={user?.image || `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(user?.name || 'Super Admin')}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                                            alt={user?.name || "Super Admin"}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                        <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg text-gray-900">{user?.name || "Super Admin"}</h3>
                                <p className="text-xs text-gray-500 font-medium mb-4">{session.email}</p>
                                <div className="flex gap-2 w-full justify-center">
                                    <BroadcastModal />
                                    <Link href="/platform-admin/settings" onClick={() => setIsOpen(false)} aria-label="Settings" className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 hover:shadow-sm transition text-gray-400 hover:text-black"><Settings size={16} /></Link>
                                    <form action={logout}>
                                        <button
                                            type="submit"
                                            aria-label="Sign Out"
                                            className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-100 hover:text-red-500 hover:shadow-sm transition text-gray-400"
                                        >
                                            <LogOut size={16} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Logs Feed */}
                        <div className="p-6 pt-2">
                            <div className="flex justify-between items-center mb-4 px-2">
                                <h3 className="font-bold text-gray-900">Recent Logs</h3>
                                <span className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-1 rounded-full text-gray-500 shadow-sm">REALTIME</span>
                            </div>
                            <ActivityLogFeed logs={logs} />
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
