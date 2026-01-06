"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ShoppingBag, Users, BarChart, Store, ChevronUp, LogOut, Menu, Shield, Sparkles, Wallet, Tag, Truck, PanelLeftClose, ChevronRight, LayoutDashboard, BadgeCheck, Lock, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { logout } from "@/app/[storeSlug]/admin/login/actions";

// Import MobileSystemLogsDrawer at top
import MobileSystemLogsDrawer from "@/components/admin/MobileSystemLogsDrawer";

export default function AdminSidebar({ user, storeTier = 'HUSTLER', latestUpdateDate, logs = [] }: { user: any, storeTier?: string, latestUpdateDate?: string, logs?: any[] }) {
    const pathname = usePathname();
    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isDesktopHidden, setIsDesktopHidden] = useState(true); // Hidden by default on desktop

    // Dynamic storeSlug extraction
    const storeSlug = user?.storeSlug || pathname?.split('/')[1] || 'sh';

    // Fallback if no user
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
                        <span className="font-bold text-base leading-none tracking-tight">Shopry</span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Seller Hub</span>
                    </div>
                </div>

                <MobileSystemLogsDrawer
                    logs={logs}
                    storeSlug={storeSlug}
                    user={currentUser}
                    trigger={
                        <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 active:scale-95 transition-transform">
                            <img
                                src={currentUser.image || `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(currentUser.name || 'User')}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                                alt={currentUser.name}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    }
                />
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/20 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Desktop Toggle Button - More Obvious */}
            <button
                onClick={() => setIsDesktopHidden(!isDesktopHidden)}
                className={`hidden md:flex fixed top-4 z-50 bg-gray-900 text-white rounded-full p-3 shadow-lg hover:bg-gray-800 hover:scale-105 transition-all duration-200 items-center justify-center ${isDesktopHidden ? 'left-4' : 'left-[304px]'}`}
                title={isDesktopHidden ? "Open Menu" : "Close Menu"}
            >
                {isDesktopHidden ? <Menu size={20} /> : <PanelLeftClose size={20} />}
            </button>

            {/* SIDEBAR MAIN */}
            {/* Note: On desktop (md), we remove 'fixed' and let it be a flex item in the layout */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 flex flex-col h-screen text-gray-600 transition-all duration-300 ease-in-out md:relative md:flex shrink-0 ${isOpen ? "translate-x-0" : "-translate-x-full"} ${isDesktopHidden ? 'md:w-0 md:overflow-hidden' : 'md:w-72 md:translate-x-0'}`}>

                {/* Header */}
                <div className="p-8 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-gray-200 border border-gray-100 bg-white">
                        <img
                            src={`https://api.dicebear.com/9.x/micah/svg?seed=Shopry&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                            alt="Shopry"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <span className="font-bold text-xl text-gray-900 block leading-none tracking-tight">Shopry</span>
                        <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mt-1 block">Seller Hub</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
                    <div className="px-4 text-xs font-bold text-gray-300 uppercase tracking-widest mb-3 mt-2">Menu</div>

                    <NavLink
                        href={`/${storeSlug}`}
                        icon={<Store size={20} />}
                        label="Front Store"
                        active={false}
                        isExternal
                    />

                    <div className="h-4" /> {/* Spacer */}

                    <NavLink
                        href={`/${storeSlug}/admin`}
                        icon={<LayoutDashboard size={20} />}
                        label="Overview"
                        active={pathname === `/${storeSlug}/admin` || pathname === `/${storeSlug}/admin/`}
                    />


                    <NavLink
                        href={`/${storeSlug}/admin/inventory`}
                        icon={<Package size={20} />}
                        label="Inventory"
                        active={pathname?.startsWith(`/${storeSlug}/admin/inventory`)}
                    />

                    <NavLink
                        href={`/${storeSlug}/admin/orders`}
                        icon={<ShoppingBag size={20} />}
                        label="Orders"
                        active={pathname?.startsWith(`/${storeSlug}/admin/orders`)}
                    />

                    {/* Mobile Only: System Activity in Menu */}
                    <div className="md:hidden">
                        <MobileSystemLogsDrawer logs={logs} storeSlug={storeSlug} user={currentUser} />
                    </div>

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

                    <div className="h-4" /> {/* Spacer */}

                    <NavLink
                        href={`/${storeSlug}/admin/settings`}
                        icon={<Store size={20} />}
                        label="Settings"
                        active={pathname?.startsWith(`/${storeSlug}/admin/settings`) && !pathname?.includes("/delivery")}
                    />

                    <NavLink
                        href={`/${storeSlug}/admin/settings/delivery`}
                        icon={<Truck size={20} />}
                        label="Delivery"
                        active={pathname?.startsWith(`/${storeSlug}/admin/settings/delivery`)}
                    />

                    {/* Verification Link */}
                    <Link
                        href={`/${storeSlug}/admin/verification`}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative mb-1 ${pathname?.startsWith(`/${storeSlug}/admin/verification`)
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'text-gray-500 hover:bg-blue-50/50 hover:text-blue-600 font-medium'
                            }`}
                    >
                        <BadgeCheck size={20} className={pathname?.startsWith(`/${storeSlug}/admin/verification`) ? 'text-blue-600' : 'text-blue-400 group-hover:text-blue-600 transition-colors'} />
                        <span className="relative z-10 text-sm tracking-tight flex-1">Get Verified</span>
                        {/* Assuming we don't have isVerified on user object yet, showing lock by default if not strictly known, or nothing */}
                        <Lock size={12} className="ml-auto text-gray-300" />
                    </Link>


                    {/* Platform Admin Link - Only for Super Admins */}
                    {currentUser.isPlatformAdmin && (
                        <>
                            <div className="h-px bg-gray-100 mx-4 my-3" />
                            <Link
                                href="/platform-admin"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-brand-cyan transition-all duration-200 group"
                            >
                                <span className="text-gray-400 group-hover:text-brand-cyan transition-colors">
                                    <Shield size={20} />
                                </span>
                                <span className="font-bold text-sm">Platform Admin</span>
                            </Link>
                        </>
                    )}
                </nav>

                {/* User Profile / Switcher - Simplified for Design System */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-gray-50 ${isSwitcherOpen ? "bg-gray-50" : ""}`}
                    >
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                            <img
                                src={currentUser.image && currentUser.image.length > 0
                                    ? currentUser.image
                                    : `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(currentUser.name || 'User')}&backgroundColor=b6e3f4,c0aede,d1d4f9`
                                }
                                alt={currentUser.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 leading-tight truncate">{currentUser.name || "User"}</p>
                            <p className="text-xs text-gray-400 font-medium truncate mt-0.5">{currentUser.role || "Admin"}</p>
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
            <span className={`relative z-10 text-sm tracking-tight ${active ? "font-bold" : ""}`}>{label}</span>

            {active && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-orange rounded-l-full" />
            )}
        </Link>
    );
}

function UpdatesNavLink({ href, latestUpdateDate, active }: { href: string, latestUpdateDate?: string, active?: boolean }) {
    const [isMounted, setIsMounted] = useState(false);
    const [lastRead, setLastRead] = useState<number>(0);

    // Set mounted state after hydration
    useEffect(() => {
        setIsMounted(true);
        // Initialize from localStorage on mount
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('lastReadUpdates');
            if (stored) setLastRead(parseInt(stored));
        }
    }, []);

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
            {isMounted && hasNewUpdates && (
                <span className="absolute top-3 right-4 w-2 h-2 bg-brand-cyan rounded-full border border-white" />
            )}
        </div>
    );
}
