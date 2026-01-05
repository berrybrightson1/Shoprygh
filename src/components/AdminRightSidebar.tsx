"use client";

import { Sparkles, Settings, Bell, LogOut } from "lucide-react";
import ActivityLogFeed from "./ActivityLogFeed";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

import { useState } from "react";

export default function AdminRightSidebar({ user, logs }: { user: any, logs: any[] }) {
    const initials = user.name ? user.name.charAt(0) : "U";
    const [activeView, setActiveView] = useState<'activity' | 'notifications'>('activity');

    return (
        <aside className="w-96 bg-white border-l border-gray-200 flex flex-col z-20 hidden 2xl:flex overflow-hidden">
            {/* Profile Card */}
            <div className="p-8 pb-0">
                <div className="bg-gray-50 rounded-[24px] p-6 flex flex-col items-center text-center border border-gray-100">
                    <div className="relative mb-3">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg shadow-gray-200 overflow-hidden bg-gray-50 border-4 border-white">
                            <img
                                src={user.image || `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(user.name || 'User')}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                                alt={user.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Generic Online Status (always green for self) */}
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                    </div>

                    <h3 className="font-bold text-lg text-gray-900">{user.name}</h3>
                    <p className="text-xs text-gray-500 font-medium mb-4">{user.email}</p>

                    <div className="flex gap-2 w-full justify-center">
                        <button
                            onClick={() => setActiveView(activeView === 'notifications' ? 'activity' : 'notifications')}
                            aria-label="Notifications"
                            className={`w-10 h-10 rounded-full border flex items-center justify-center transition ${activeView === 'notifications' ? 'bg-orange-50 border-orange-200 text-orange-500 shadow-sm' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-black hover:shadow-sm'}`}
                        >
                            <Bell size={16} className={activeView === 'notifications' ? 'fill-orange-500' : ''} />
                        </button>
                        <Link
                            href={user.storeSlug ? `/${user.storeSlug}/admin/settings` : '/platform-admin/settings'}
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

            {/* Audit Logs or Notifications Feed */}
            {activeView === 'notifications' ? (
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded-full border border-orange-200">3 NEW</span>
                    </div>

                    <div className="space-y-4">
                        {/* Mock Notifications */}
                        <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 hover:bg-white hover:shadow-sm transition cursor-pointer">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                                    <Sparkles size={14} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-900 mb-1">Welcome to Seller Hub</p>
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed">Your store is now live! Start by adding your first product.</p>
                                    <p className="text-[10px] text-gray-400 font-bold mt-2">Just now</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition cursor-pointer">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                                    <Settings size={14} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-900 mb-1">Profile Complete</p>
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed">You have successfully updated your store profile.</p>
                                    <p className="text-[10px] text-gray-400 font-bold mt-2">10m ago</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition cursor-pointer opacity-60">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                    <Bell size={14} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900 mb-1">System Update</p>
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed">Platform maintenance scheduled for tonight.</p>
                                    <p className="text-[10px] text-gray-400 font-bold mt-2">2h ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900">System Activity</h3>
                        <span className="text-[10px] font-bold bg-brand-cyan/10 text-brand-cyan px-2 py-1 rounded-full border border-brand-cyan/20">REALTIME</span>
                    </div>

                    <ActivityLogFeed logs={logs} />
                </div>
            )}
        </aside>
    );
}
