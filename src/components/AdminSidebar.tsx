"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ShoppingBag, Users, BarChart, Store, ChevronUp, LogOut, Menu, Shield, Sparkles, Wallet, Tag } from "lucide-react";
import { useState } from "react";
import { logout } from "@/app/[storeSlug]/admin/login/actions";

export default function AdminSidebar({ user, storeTier = 'HUSTLER', latestUpdateDate }: { user: any, storeTier?: string, latestUpdateDate?: Date }) {
    const pathname = usePathname();
    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Dynamic storeSlug extraction
    const storeSlug = pathname?.split('/')[1] || 'sh';

    // Fallback if no user (should be caught by middleware)
    const currentUser = user || { name: "", role: "", email: "", id: "" };
    const initials = currentUser.name ? currentUser.name.charAt(0) : "A";

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
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Seller Hub</span>
                    </div>
                </div>

                <div className="w-9 h-9 rounded-2xl bg-purple-600 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-purple-200">
                    {initials}
                </div>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/20 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/60 backdrop-blur-2xl border-r border-white/50 flex flex-col h-screen text-gray-600 shadow-2xl shadow-gray-200/50 transition-transform duration-300 ease-in-out md:translate-x-0 md:fixed md:top-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>

                {/* Header */}
                <div className="p-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl shadow-xl shadow-purple-500/20 flex items-center justify-center font-black text-2xl">
                        S
                    </div>
                    <div>
                        <span className="font-black text-2xl text-gray-900 block leading-none tracking-tight">Shopry</span>
                        <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase mt-1 block">Seller Hub</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto custom-scrollbar">
                    <div className="px-4 text-xs font-black text-gray-400 uppercase tracking-widest mb-3 mt-2">Menu</div>

                    <NavLink
                        href={`/${storeSlug}`}
                        icon={<Store size={20} />}
                        label="Front Store"
                        active={false}
                        isExternal
                    />

                    <div className="h-px bg-gray-100 mx-4 my-3" />

                    <NavLink
                        href={`/${storeSlug}/admin/inventory`}
                        icon={<Package size={20} />}
                        label="Inventory"
                        active={pathname?.startsWith(`/${storeSlug}/admin/inventory`)}
                    />

                    {/* Show these for ALL admin users */}
                    <NavLink
                        href={`/${storeSlug}/admin/orders`}
                        icon={<ShoppingBag size={20} />}
                        label="Orders"
                        active={pathname?.startsWith(`/${storeSlug}/admin/orders`)}
                    />
                    <NavLink
                        href={`/${storeSlug}/admin/staff`}
                        icon={<Users size={20} />}
                        label="Staff"
                        active={pathname?.startsWith(`/${storeSlug}/admin/staff`)}
                    />
                    <NavLink
                        href={`/${storeSlug}/admin/reports`}
                        icon={<BarChart size={20} />}
                        label="Reports"
                        active={pathname?.startsWith(`/${storeSlug}/admin/reports`)}
                    />

                    <NavLink
                        href={`/${storeSlug}/admin/customers`}
                        icon={<Users size={20} />}
                        label="Customers"
                        active={pathname?.startsWith(`/${storeSlug}/admin/customers`)}
                    />

                    {/* Updates Tab with Green Dot Indicator */}
                    <UpdatesNavLink
                        href={`/${storeSlug}/admin/updates`}
                        latestUpdateDate={latestUpdateDate}
                        active={pathname?.startsWith(`/${storeSlug}/admin/updates`)}
                    />

                    <NavLink
                        href={`/${storeSlug}/admin/finance`}
                        icon={<Wallet size={20} />}
                        label="Finance"
                        active={pathname?.startsWith(`/${storeSlug}/admin/finance`)}
                    />

                    <div className="h-px bg-gray-100 mx-4 my-3" />

                    <NavLink
                        href={`/${storeSlug}/admin/settings`}
                        icon={<Store size={20} />}
                        label="Settings"
                        active={pathname?.startsWith(`/${storeSlug}/admin/settings`)}
                    />


                    {/* Platform Admin Link - Only for Super Admins */}
                    {currentUser.isPlatformAdmin && (
                        <>
                            <div className="h-px bg-gray-100 mx-4 my-3" />
                            <Link
                                href="/platform-admin"
                                className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-gray-500 hover:bg-white hover:text-purple-600 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 group border border-transparent hover:border-purple-100"
                            >
                                <span className="text-gray-400 group-hover:text-purple-500 transition-colors">
                                    <Shield size={20} />
                                </span>
                                <span className="font-bold">Platform Admin</span>
                            </Link>
                        </>
                    )}
                </nav>

                {/* User Profile / Switcher */}
                <div className="relative p-6 border-t border-white/50 bg-white/30 backdrop-blur-sm mt-auto">

                    {/* Switcher Popup */}
                    {isSwitcherOpen && (
                        <div className="absolute bottom-full left-4 right-4 mb-4 bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-50">
                            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Account</p>
                            </div>

                            <div className="p-2 border-t border-gray-50">
                                <form action={logout}>
                                    <button className="w-full text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600 py-3 rounded-xl flex items-center justify-center gap-2 transition">
                                        <LogOut size={14} /> Sign Out
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Profile Trigger */}
                    <button
                        onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all border ${isSwitcherOpen ? "bg-white border-gray-100 shadow-md" : "hover:bg-white/60 hover:border-white hover:shadow-sm border-transparent"}`}
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20">
                            {initials}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 leading-tight truncate">{currentUser.name || "User"}</p>
                            <p className="text-xs text-gray-400 font-bold truncate mt-0.5">{currentUser.role || "Admin"}</p>
                        </div>
                        <ChevronUp size={16} className={`text-gray-400 transition-transform duration-300 ${isSwitcherOpen ? "rotate-0" : "rotate-180"}`} />
                    </button>
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
            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${active
                ? "bg-purple-50 text-purple-900 shadow-sm font-black overflow-hidden"
                : "text-gray-500 hover:bg-white/60 hover:text-gray-900 hover:shadow-sm"
                }`}
        >
            {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-purple-600 rounded-r-full" />}

            <span className={`relative z-10 ${active ? "text-purple-600" : "text-gray-400 group-hover:text-purple-500 transition-colors"}`}>
                {icon}
            </span>
            <span className={`relative z-10 font-bold ${active ? "text-purple-900" : "text-gray-600 group-hover:text-gray-900"}`}>{label}</span>
        </Link>
    );
}

function UpdatesNavLink({ href, latestUpdateDate, active }: { href: string, latestUpdateDate?: Date, active?: boolean }) {
    const [lastRead, setLastRead] = useState<number>(0);

    // Initialize from localStorage on mount
    useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('lastReadUpdates');
            if (stored) setLastRead(parseInt(stored));
        }
    });

    const hasNewUpdates = latestUpdateDate &&
        (new Date().getTime() - new Date(latestUpdateDate).getTime() < 3 * 24 * 60 * 60 * 1000) &&
        (!lastRead || new Date(latestUpdateDate).getTime() > lastRead);

    const handleClick = () => {
        const now = new Date().getTime();
        setLastRead(now);
        if (typeof window !== 'undefined') {
            localStorage.setItem('lastReadUpdates', now.toString());
        }
    };

    return (
        <div className="relative" onClick={handleClick}>
            <NavLink
                href={href}
                icon={<Sparkles size={20} />}
                label="Updates"
                active={active}
            />
            {hasNewUpdates && (
                <span className="absolute top-3 right-4 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse pointer-events-none shadow-sm" />
            )}
        </div>
    );
}
