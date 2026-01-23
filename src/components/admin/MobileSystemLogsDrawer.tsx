"use client";

import { Drawer } from "vaul";
import { Activity, X, Bell, Settings, LogOut, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import ActivityLogFeed from "@/components/ActivityLogFeed";
import { logout } from "@/app/[storeSlug]/admin/login/actions";

export default function MobileSystemLogsDrawer({ logs, storeSlug, user, trigger }: { logs: any[], storeSlug: string, user?: any, trigger?: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [activeView, setActiveView] = useState<'activity' | 'notifications'>('activity');

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Default User Fallback
    const currentUser = user || { name: "User", email: "", image: null };

    return (
        <Drawer.Root open={isOpen} onOpenChange={setIsOpen} direction="bottom">
            <Drawer.Trigger asChild>
                {trigger || (
                    <button
                        className="md:hidden flex items-center gap-2 w-full px-4 py-3 rounded-xl transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium group text-left"
                    >
                        <span className="relative z-10 text-gray-400 group-hover:text-gray-900"><Activity size={20} /></span>
                        <span className="relative z-10 text-sm tracking-tight flex-1">System Activity</span>
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-medium text-white uppercase">R</span>
                    </button>
                )}
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
                            <Drawer.Title className="text-xl font-medium text-gray-900">
                                {activeView === 'notifications' ? 'Notifications' : 'System Activity'}
                            </Drawer.Title>
                            <Drawer.Description className="text-xs text-gray-500 font-medium">
                                {activeView === 'notifications' ? 'Updates & Alerts' : 'Security & Action Logs'}
                            </Drawer.Description>
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

                    <div className="flex-1 overflow-y-auto px-4 pb-4">
                        {/* Profile Card Section */}
                        {user && (
                            <div className="py-6">
                                <div className="bg-white rounded-[24px] p-6 flex flex-col items-center text-center border border-gray-200 shadow-sm">
                                    <div className="relative mb-3">
                                        <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg shadow-gray-200 overflow-hidden bg-gray-50 border-4 border-white">
                                            <img
                                                src={currentUser.image || `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(currentUser.name || 'User')}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                                                alt={currentUser.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                        </div>
                                    </div>
                                    <h3 className="font-medium text-lg text-gray-900">{currentUser.name}</h3>
                                    <p className="text-xs text-gray-500 font-medium mb-4">{currentUser.email}</p>

                                    <div className="flex gap-2 w-full justify-center">
                                        {/* Notification Button */}
                                        <button
                                            onClick={() => setActiveView(activeView === 'notifications' ? 'activity' : 'notifications')}
                                            aria-label="Notifications"
                                            className={`w-10 h-10 rounded-full border flex items-center justify-center transition ${activeView === 'notifications' ? 'bg-orange-50 border-orange-200 text-orange-500 shadow-sm' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-black hover:shadow-sm'}`}
                                        >
                                            <Bell size={16} className={activeView === 'notifications' ? 'fill-orange-500' : ''} />
                                        </button>

                                        <Link
                                            href={`/${storeSlug}/admin/settings`}
                                            onClick={() => setIsOpen(false)}
                                            aria-label="Settings"
                                            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:shadow-sm transition text-gray-400 hover:text-black"
                                        >
                                            <Settings size={16} />
                                        </Link>

                                        <form action={logout}>
                                            <button
                                                type="submit"
                                                aria-label="Sign Out"
                                                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-100 hover:text-red-500 hover:shadow-sm transition text-gray-400"
                                            >
                                                <LogOut size={16} />
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-4 px-2">
                            <h3 className="font-medium text-gray-900">{activeView === 'notifications' ? 'Recent Notifications' : 'Recent Logs'}</h3>
                            <span className={`text-[10px] font-medium px-2 py-1 rounded-full border shadow-sm ${activeView === 'notifications' ? 'bg-orange-100 text-orange-600 border-orange-200/50' : 'bg-white text-gray-500 border-gray-200/50'}`}>
                                {activeView === 'notifications' ? '3 NEW' : 'REALTIME'}
                            </span>
                        </div>

                        {activeView === 'notifications' ? (
                            <div className="space-y-4 pb-4">
                                {/* Mock Notifications */}
                                <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 hover:bg-white hover:shadow-sm transition cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                                            <Sparkles size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-900 mb-1">Welcome to Seller Hub</p>
                                            <p className="text-xs text-gray-500 font-medium leading-relaxed">Your store is now live! Start by adding your first product.</p>
                                            <p className="text-[10px] text-gray-400 font-medium mt-2">Just now</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                                            <Settings size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-900 mb-1">Profile Complete</p>
                                            <p className="text-xs text-gray-500 font-medium leading-relaxed">You have successfully updated your store profile.</p>
                                            <p className="text-[10px] text-gray-400 font-medium mt-2">10m ago</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition cursor-pointer opacity-60">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                            <Bell size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-900 mb-1">System Update</p>
                                            <p className="text-xs text-gray-500 font-medium leading-relaxed">Platform maintenance scheduled for tonight.</p>
                                            <p className="text-[10px] text-gray-400 font-medium mt-2">2h ago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <ActivityLogFeed logs={logs} />
                        )}
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
