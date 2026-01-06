"use client";

import { useState } from "react";
import Link from "next/link";
import { Store, Wallet, Sparkles, Settings, ChevronLeft, ChevronRight, PanelLeftClose, PanelRightClose, LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import BroadcastModal from "@/components/modals/BroadcastModal";
import ActivityLogFeed from "@/components/ActivityLogFeed";

import MobileSystemActivityDrawer from "@/components/platform-admin/MobileSystemActivityDrawer";

interface DashboardShellProps {
    children: React.ReactNode;
    session: { email: string };
    user: { name: string | null; image: string | null; isPlatformAdmin: boolean };
    logs: any[];
}

export default function DashboardShell({ children, session, user, logs }: DashboardShellProps) {
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
    const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-gray-50">
            {/* LEFT SIDEBAR - Navigation */}
            <aside className={`${leftSidebarOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden absolute md:relative z-40 h-full`}>
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            P
                        </div>
                        <span className="font-bold text-gray-900">Platform</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/platform-admin" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-white bg-gray-900 rounded-lg shadow-sm border-l-4 border-brand-cyan">
                        <Store size={18} />
                        Overview
                    </Link>
                    <Link href="/platform-admin/finance" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                        <Wallet size={18} />
                        Finance
                    </Link>
                    <Link href="/platform-admin/updates" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                        <Sparkles size={18} />
                        Updates
                    </Link>
                    <Link href="/platform-admin/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                        <Settings size={18} />
                        Security
                    </Link>
                </nav>
            </aside>

            {/* LEFT SIDEBAR TOGGLE */}
            <button
                onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                className={`fixed top-4 z-50 bg-gray-900 text-white rounded-full p-3 shadow-lg hover:bg-gray-800 hover:scale-105 transition-all duration-200 flex items-center justify-center ${leftSidebarOpen ? 'left-[272px]' : 'left-4'}`}
                title={leftSidebarOpen ? "Close Menu" : "Open Menu"}
            >
                {leftSidebarOpen ? <PanelLeftClose size={20} /> : <ChevronRight size={20} />}
            </button>

            {/* CENTER CONTENT */}
            <div className="flex-1 overflow-y-auto">
                {children}
            </div>

            {/* MOBILE SYSTEM ACTIVITY DRAWER */}
            <MobileSystemActivityDrawer session={session} user={user} logs={logs} />

            {/* RIGHT SIDEBAR TOGGLE - DESKTOP ONLY */}
            <button
                onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                className={`hidden md:flex fixed top-20 z-50 bg-gray-900 text-white rounded-full p-3 shadow-lg hover:bg-gray-800 hover:scale-105 transition-all duration-200 items-center justify-center ${rightSidebarOpen ? 'right-[400px]' : 'right-4'}`}
                title={rightSidebarOpen ? "Close Activity Panel" : "Open Activity Panel"}
            >
                {rightSidebarOpen ? <PanelRightClose size={20} /> : <ChevronLeft size={20} />}
            </button>

            {/* RIGHT SIDEBAR - DESKTOP ONLY */}
            <aside className={`hidden md:flex ${rightSidebarOpen ? 'w-96' : 'w-0'} bg-white border-l border-gray-200 flex-col overflow-hidden transition-all duration-300`}>
                {/* Profile Card */}
                <div className="p-8 pb-6">
                    <div className="bg-gray-50 rounded-[24px] p-6 flex flex-col items-center text-center border border-gray-100">
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
                            <Link href="/platform-admin/settings" aria-label="Settings" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:shadow-sm transition text-gray-400 hover:text-black"><Settings size={16} /></Link>
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

                {/* System Activity */}
                <div className="flex-1 overflow-y-auto px-8 pb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900">System Activity</h3>
                        <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-full text-gray-500">REALTIME</span>
                    </div>
                    <ActivityLogFeed logs={logs} />
                </div>
            </aside>
        </div>
    );
}
