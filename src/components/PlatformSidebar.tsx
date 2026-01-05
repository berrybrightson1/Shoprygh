"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Wallet, Sparkles, Shield, Menu, LogOut, ChevronUp } from "lucide-react";
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
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl text-gray-900 z-30 flex items-center px-4 justify-between shadow-sm border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition text-gray-600 hover:text-gray-900"
                        aria-label="Open sidebar"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="flex flex-col">
                        <span className="font-black text-base leading-none tracking-tight">Shopry</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Platform</span>
                    </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                    <img
                        src={currentUser.image || `https://api.dicebear.com/9.x/notionists/svg?seed=Platform&backgroundColor=b6e3f4,c0aede,d1d4f9`}
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
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col h-screen text-gray-600 transition-transform duration-300 ease-in-out md:translate-x-0 md:relative md:flex shrink-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>

                {/* Header */}
                <div className="p-8 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-gray-200 border border-gray-100 bg-white">
                        <img
                            src={`https://api.dicebear.com/9.x/notionists/svg?seed=Platform&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                            alt="Platform"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <span className="font-black text-xl text-gray-900 block leading-none tracking-tight">Shopry</span>
                        <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase mt-1 block">Platform Admin</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
                    <div className="px-4 text-xs font-black text-gray-300 uppercase tracking-widest mb-3 mt-2">Menu</div>

                    <NavLink
                        href="/platform-admin"
                        icon={<Store size={20} />}
                        label="Overview"
                        active={pathname === "/platform-admin"}
                    />

                    <div className="h-4" /> {/* Spacer */}

                    <NavLink
                        href="/platform-admin/finance"
                        icon={<Wallet size={20} />}
                        label="Finance"
                        active={pathname?.startsWith("/platform-admin/finance")}
                    />

                    <NavLink
                        href="/platform-admin/updates"
                        icon={<Sparkles size={20} />}
                        label="Updates"
                        active={pathname?.startsWith("/platform-admin/updates")}
                    />

                    <NavLink
                        href="/platform-admin/security"
                        icon={<Shield size={20} />}
                        label="Security"
                        active={pathname?.startsWith("/platform-admin/security")}
                    />
                </nav>

                {/* User Profile / Switcher */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-gray-50 ${isSwitcherOpen ? "bg-gray-50" : ""}`}
                    >
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                            <img
                                src={currentUser.image || `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(currentUser.name || 'User')}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                                alt={currentUser.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 leading-tight truncate">{currentUser.name}</p>
                            <p className="text-xs text-gray-400 font-bold truncate mt-0.5">{currentUser.email}</p>
                        </div>
                        <ChevronUp size={16} className={`text-gray-400 transition-transform duration-300 ${isSwitcherOpen ? "rotate-0" : "rotate-180"}`} />
                    </button>

                    {/* Switcher Dropdown */}
                    {isSwitcherOpen && (
                        <div className="mt-2 text-center">
                            <form action={logout}>
                                <button className="w-full text-xs font-bold text-red-500 hover:bg-red-50 py-3 rounded-xl flex items-center justify-center gap-2 transition">
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

function NavLink({ href, icon, label, active = false, isExternal = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean, isExternal?: boolean }) {
    return (
        <Link
            href={href}
            target={isExternal ? "_blank" : undefined}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative mb-1 ${active
                ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium"
                }`}
        >
            <span className={`relative z-10 transition-colors ${active ? "text-brand-orange" : "text-gray-400 group-hover:text-gray-900"}`}>
                {icon}
            </span>
            <span className={`relative z-10 text-sm tracking-tight ${active ? "font-black" : ""}`}>{label}</span>

            {active && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-orange rounded-l-full" />
            )}
        </Link>
    );
}
