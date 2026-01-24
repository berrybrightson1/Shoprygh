"use client";

import { Sparkles, Settings, Bell, LogOut, ChevronUp } from "lucide-react";
import ActivityLogFeed from "./ActivityLogFeed";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

import { useState } from "react";

export default function AdminRightSidebar({ user }: { user: any }) {
    const initials = user.name ? user.name.charAt(0) : "U";
    // Default to notifications since activity is removed
    const [activeView, setActiveView] = useState<'notifications'>('notifications');

    return (
        <aside className="w-[420px] bg-gray-50/50 border-l border-gray-100 flex flex-col z-20 hidden 2xl:flex overflow-hidden">
            {/* Profile & Hub Card */}
            <div className="p-8 pb-4">
                <div className="bg-white rounded-[40px] p-8 flex flex-col items-center text-center shadow-2xl shadow-gray-200/50 border border-gray-100 ring-4 ring-white/50 relative overflow-hidden">
                    {/* Integrated Decor */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-cyan via-brand-orange to-brand-cyan opacity-50" />

                    <div className="relative mb-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-[32px] flex items-center justify-center shadow-xl shadow-gray-200 overflow-hidden bg-white border-4 border-white ring-1 ring-gray-100 p-1">
                            <div className="w-full h-full rounded-[24px] overflow-hidden">
                                <img
                                    src={user.image || `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(user.name || 'User')}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        {/* High-End Status */}
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-2xl shadow-lg border border-gray-50 flex items-center justify-center">
                            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white ring-4 ring-green-500/10 animate-pulse"></div>
                        </div>
                    </div>

                    <h3 className="font-medium text-xl text-gray-900 tracking-tight">{user.name}</h3>
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-[0.2em] mb-8">{user.role || 'Admin'} • Online</p>

                    <div className="grid grid-cols-3 gap-3 w-full">
                        <button
                            className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all bg-black text-white shadow-xl shadow-black/20 cursor-default`}
                        >
                            <Bell size={20} />
                            <span className="text-[9px] font-medium uppercase tracking-widest">Inbox</span>
                        </button>

                        <Link
                            href={user.storeSlug ? `/${user.storeSlug}/admin/settings` : '/platform-admin/settings'}
                            className="p-4 rounded-2xl bg-gray-50 text-gray-400 flex flex-col items-center justify-center gap-2 hover:bg-white hover:text-gray-900 hover:shadow-lg transition-all border border-transparent hover:border-gray-100"
                        >
                            <Settings size={20} />
                            <span className="text-[9px] font-medium uppercase tracking-widest">Config</span>
                        </Link>

                        <form action={logout} className="w-full">
                            <button
                                type="submit"
                                className="w-full p-4 rounded-2xl bg-gray-50 text-gray-400 flex flex-col items-center justify-center gap-2 hover:bg-red-50 hover:text-red-500 hover:shadow-lg transition-all border border-transparent hover:border-red-100"
                            >
                                <LogOut size={20} />
                                <span className="text-[9px] font-medium uppercase tracking-widest">Exit</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Content Feed */}
            <div className={`flex-1 overflow-y-auto px-8 py-6 custom-scrollbar`}>
                <div className="flex justify-between items-center mb-8 px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-brand-cyan" />
                        <h3 className="font-medium text-gray-900 tracking-tight uppercase text-xs tracking-[0.2em]">
                            Critical Alerts
                        </h3>
                    </div>
                </div>

                <div className="space-y-4">
                    <NotificationCard
                        title="Welcome to Hub"
                        message="Your store architecture has been upgraded to Premium."
                        time="Just now"
                        type="success"
                    />
                    <NotificationCard
                        title="Security Audit"
                        message="We've optimized your admin session encryption."
                        time="2h ago"
                        type="info"
                    />
                    <NotificationCard
                        title="System Update"
                        message="New floating navigation components are now live."
                        time="Yesterday"
                        type="system"
                        muted
                    />
                </div>
            </div>
        </aside>
    );
}

function NotificationCard({ title, message, time, type, muted = false }: { title: string, message: string, time: string, type: string, muted?: boolean }) {
    return (
        <div className={`p-6 rounded-[32px] transition-all border border-gray-100 hover:shadow-xl hover:shadow-gray-200/40 cursor-pointer group ${muted ? 'opacity-50 bg-gray-50/30' : 'bg-white shadow-sm'}`}>
            <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-gray-50 shadow-sm group-hover:scale-110 transition-transform ${type === 'success' ? 'bg-green-50 text-green-600' :
                    type === 'info' ? 'bg-blue-50 text-blue-600' :
                        'bg-gray-50 text-gray-600'
                    }`}>
                    {type === 'success' ? <Sparkles size={18} /> : <Bell size={18} />}
                </div>
                <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-900 mb-1 tracking-tight">{title}</p>
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{message}</p>
                    <div className="flex items-center gap-2 mt-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{time}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
