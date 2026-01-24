"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Wallet, Sparkles, Shield, Menu, LogOut, ChevronUp, ChevronRight, Settings, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { logout } from "@/app/actions/auth";

export default function PlatformSidebar({ user }: { user: any }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

    // Fallback if no user
    const currentUser = user || { name: "Super Admin", role: "Platform Admin", email: "dev@shopry.app", image: null };

    return (
        <>
            {/* Mobile Header Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-2xl text-gray-900 z-30 flex items-center px-6 justify-between border-b border-gray-100/50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-2.5 -ml-2 rounded-2xl bg-gray-50 text-gray-900 border border-gray-100 active:scale-95 transition-all shadow-sm"
                        aria-label="Open sidebar"
                    >
                        <Menu size={20} strokeWidth={2.5} />
                    </button>
                    <div className="flex flex-col">
                        <span className="font-medium text-lg leading-none tracking-tight">Shopry</span>
                        <span className="text-[9px] text-gray-400 font-medium uppercase tracking-[0.2em] mt-1">Platform</span>
                    </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                    <img
                        src={currentUser.image || `https://api.dicebear.com/9.x/micah/svg?seed=Platform&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/20 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* SIDEBAR MAIN */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-gray-50/50 border-r border-gray-100 flex flex-col h-screen text-gray-600 transition-all duration-300 ease-in-out md:translate-x-0 md:relative md:flex shrink-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>

                {/* Header */}
                <div className="p-8 pb-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-2xl shadow-gray-200 border border-white bg-white p-1">
                        <div className="w-full h-full rounded-xl overflow-hidden">
                            <img
                                src={`https://api.dicebear.com/9.x/micah/svg?seed=Platform&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                                alt="Platform"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    <div>
                        <span className="font-medium text-xl text-gray-900 block leading-none tracking-tight">Shopry</span>
                        <span className="text-[10px] font-medium tracking-[0.2em] text-gray-400 uppercase mt-1.5 block">Platform Admin</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 lg:px-6 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
                    <div className="px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] mb-4 mt-2">Core Hub</div>

                    <NavLink
                        href="/platform-admin"
                        icon={<LayoutDashboard size={20} />}
                        label="Overview"
                        description="Platform health and stats"
                        active={pathname === "/platform-admin"}
                    />

                    <div className="h-4" /> {/* Spacer */}

                    <NavLink
                        href="/platform-admin/finance"
                        icon={<Wallet size={20} />}
                        label="Finance"
                        description="Revenue streams"
                        active={pathname?.startsWith("/platform-admin/finance")}
                    />

                    <NavLink
                        href="/platform-admin/updates"
                        icon={<Sparkles size={20} />}
                        label="Updates"
                        description="System announcements"
                        active={pathname?.startsWith("/platform-admin/updates")}
                    />

                    <div className="h-6" />
                    <div className="px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] mb-4">System</div>

                    <NavLink
                        href="/platform-admin/settings"
                        icon={<Shield size={20} />}
                        label="Security"
                        description="Access control"
                        active={pathname?.startsWith("/platform-admin/settings")}
                    />
                </nav>

                {/* User Profile / Switcher */}
                <div className="p-4 border-t border-gray-100/50 bg-white/50 backdrop-blur-sm">
                    <button
                        onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                        className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all ${isSwitcherOpen ? "bg-white shadow-xl shadow-gray-200/50 ring-1 ring-gray-100" : "hover:bg-white hover:shadow-lg hover:shadow-gray-200/30"}`}
                    >
                        <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                            <img
                                src={currentUser.image || `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(currentUser.name || 'User')}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                                alt={currentUser.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 leading-tight truncate">{currentUser.name}</p>
                            <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5 uppercase tracking-widest">{currentUser.role || "Admin"}</p>
                        </div>
                        <ChevronUp size={16} className={`text-gray-400 transition-transform duration-500 ${isSwitcherOpen ? "rotate-0 text-gray-900" : "rotate-180"}`} />
                    </button>

                    {/* Switcher Dropdown */}
                    {isSwitcherOpen && (
                        <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <form action={logout}>
                                <button className="w-full text-[11px] font-medium text-red-500 hover:bg-red-50 p-4 rounded-2xl flex items-center justify-center gap-2 transition uppercase tracking-widest border border-transparent hover:border-red-100">
                                    <LogOut size={14} /> Sign Out
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}

function NavLink({
    href,
    icon,
    label,
    description,
    active = false,
    isExternal = false,
    danger = false,
    badge = null
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    description?: string;
    active?: boolean;
    isExternal?: boolean;
    danger?: boolean;
    badge?: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            target={isExternal ? "_blank" : undefined}
            className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all ${active
                ? "bg-white text-gray-900 shadow-xl shadow-gray-200/50 ring-1 ring-gray-100"
                : "text-gray-900 hover:bg-white hover:shadow-lg hover:shadow-gray-200/30"
                } ${danger && !active ? 'hover:text-red-600' : ''}`}
        >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${active
                ? (danger ? 'bg-red-50 text-red-600' : 'bg-black text-white')
                : 'bg-white border border-gray-100 text-gray-900 group-hover:scale-110'
                }`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className={`text-sm font-bold truncate tracking-tight ${active ? 'text-gray-900' : 'text-gray-900'}`}>{label}</div>
                {description && <div className="text-[11px] text-gray-600 font-medium truncate mt-0.5">{description}</div>}
            </div>
            {badge ? badge : <ChevronRight size={16} className={`text-gray-400 transition-transform ${active ? 'translate-x-1 text-gray-900' : ''}`} />}
        </Link>
    );
}
