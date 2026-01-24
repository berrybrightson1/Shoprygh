"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ShoppingBag, Users, BarChart, Store, ChevronUp, LogOut, Menu, Shield, Sparkles, Wallet, Tag, Truck, PanelLeftClose, ChevronRight, LayoutDashboard, BadgeCheck, Lock, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { logout } from "@/app/[storeSlug]/admin/login/actions";

// Import MobileSystemLogsDrawer at top
// import MobileSystemLogsDrawer from "@/components/admin/MobileSystemLogsDrawer";

export default function AdminSidebar({ user, storeTier = 'HUSTLER', latestUpdateDate }: { user: any, storeTier?: string, latestUpdateDate?: string }) {
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
                        <span className="text-[9px] text-gray-400 font-medium uppercase tracking-[0.2em] mt-1">Seller Hub</span>
                    </div>
                </div>

                <div className="md:hidden">
                    <Link href={`/${storeSlug}/admin/settings`} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 active:scale-95 transition-transform">
                        <img
                            src={currentUser.image || `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(currentUser.name || 'User')}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                            alt={currentUser.name}
                            className="w-full h-full object-cover"
                        />
                    </Link>
                </div>
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
            <aside className={`fixed inset-y-0 left-0 z-40 w-80 bg-gray-50/50 border-r border-gray-100 flex flex-col h-screen text-gray-600 transition-all duration-300 ease-in-out md:relative md:flex shrink-0 ${isOpen ? "translate-x-0" : "-translate-x-full"} ${isDesktopHidden ? 'md:w-0 md:overflow-hidden' : 'md:w-80 md:translate-x-0'}`}>

                {/* Header */}
                <div className="p-8 pb-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-2xl shadow-gray-200 border border-white bg-white p-1">
                        <div className="w-full h-full rounded-xl overflow-hidden">
                            <img
                                src={`https://api.dicebear.com/9.x/micah/svg?seed=Shopry&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                                alt="Shopry"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    <div>
                        <span className="font-medium text-xl text-gray-900 block leading-none tracking-tight">Shopry</span>
                        <span className="text-[10px] font-medium tracking-[0.2em] text-gray-400 uppercase mt-1.5 block">Seller Hub</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 lg:px-6 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
                    <div className="px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] mb-4 mt-2">Core Hub</div>

                    <NavLink
                        href={`/${storeSlug}`}
                        icon={<Store size={20} />}
                        label="Front Store"
                        description="View your public storefront"
                        active={false}
                        isExternal
                    />

                    <div className="h-4" />

                    <NavLink
                        href={`/${storeSlug}/admin`}
                        icon={<LayoutDashboard size={20} />}
                        label="Overview"
                        description="Sales summary and quick stats"
                        active={pathname === `/${storeSlug}/admin` || pathname === `/${storeSlug}/admin/`}
                    />

                    <NavLink
                        href={`/${storeSlug}/admin/inventory`}
                        icon={<Package size={20} />}
                        label="Inventory"
                        description="Manage products and categories"
                        active={pathname?.startsWith(`/${storeSlug}/admin/inventory`)}
                    />

                    <NavLink
                        href={`/${storeSlug}/admin/orders`}
                        icon={<ShoppingBag size={20} />}
                        label="Orders"
                        description="View and process customer orders"
                        active={pathname?.startsWith(`/${storeSlug}/admin/orders`)}
                    />

                    {/* Mobile Only: System Activity in Menu - REMOVED */}
                    {/* <div className="md:hidden">
                        <MobileSystemLogsDrawer logs={logs} storeSlug={storeSlug} user={currentUser} />
                    </div> */}

                    <NavLink
                        href={`/${storeSlug}/admin/staff`}
                        icon={<Users size={20} />}
                        label="Staff"
                        description="Manage team permissions"
                        active={pathname?.startsWith(`/${storeSlug}/admin/staff`)}
                    />

                    <NavLink
                        href={`/${storeSlug}/admin/reports`}
                        icon={<BarChart size={20} />}
                        label="Reports"
                        description="Detailed sales and store analytics"
                        active={pathname?.startsWith(`/${storeSlug}/admin/reports`)}
                    />

                    <NavLink
                        href={`/${storeSlug}/admin/customers`}
                        icon={<Users size={20} />}
                        label="Customers"
                        description="View customer list and history"
                        active={pathname?.startsWith(`/${storeSlug}/admin/customers`)}
                    />

                    {/* Updates Tab with Indicator */}
                    <UpdatesNavLink
                        href={`/${storeSlug}/admin/updates`}
                        latestUpdateDate={latestUpdateDate}
                        active={pathname?.startsWith(`/${storeSlug}/admin/updates`)}
                    />

                    <NavLink
                        href={`/${storeSlug}/admin/finance`}
                        icon={<Wallet size={20} />}
                        label="Finance"
                        description="Revenue and payouts"
                        active={pathname?.startsWith(`/${storeSlug}/admin/finance`)}
                    />

                    <div className="h-6" />
                    <div className="px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] mb-4">Preferences</div>

                    <NavLink
                        href={`/${storeSlug}/admin/settings`}
                        icon={<Settings size={20} />}
                        label="Settings"
                        description="Store profile and preferences"
                        active={pathname?.startsWith(`/${storeSlug}/admin/settings`) && !pathname?.includes("/delivery")}
                    />

                    <NavLink
                        href={`/${storeSlug}/admin/settings/delivery`}
                        icon={<Truck size={20} />}
                        label="Delivery"
                        description="Delivery zones and fees"
                        active={pathname?.startsWith(`/${storeSlug}/admin/settings/delivery`)}
                    />

                    {/* Verification Link */}
                    <NavLink
                        href={`/${storeSlug}/admin/verification`}
                        icon={<BadgeCheck size={20} className="text-blue-500" />}
                        label="Get Verified"
                        description="Build trust with blue tick"
                        active={pathname?.startsWith(`/${storeSlug}/admin/verification`)}
                    />

                    {/* Platform Admin Link - Only for Super Admins */}
                    {currentUser.isPlatformAdmin && (
                        <>
                            <div className="h-6" />
                            <div className="px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] mb-4">Operations</div>
                            <NavLink
                                href="/platform-admin"
                                icon={<Shield size={20} />}
                                label="Platform Admin"
                                description="Deep system administration"
                                active={pathname?.startsWith("/platform-admin")}
                            />
                        </>
                    )}
                </nav>

                {/* User Profile / Switcher - Simplified for Design System */}
                <div className="p-4 border-t border-gray-100/50 bg-white/50 backdrop-blur-sm">
                    <button
                        onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                        className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all ${isSwitcherOpen ? "bg-white shadow-xl shadow-gray-200/50 ring-1 ring-gray-100" : "hover:bg-white hover:shadow-lg hover:shadow-gray-200/30"}`}
                    >
                        <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
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
                            <p className="text-sm font-medium text-gray-900 leading-tight truncate">{currentUser.name || "User"}</p>
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

function UpdatesNavLink({ href, latestUpdateDate, active }: { href: string, latestUpdateDate?: string, active?: boolean }) {
    const [isMounted, setIsMounted] = useState(false);
    const [lastRead, setLastRead] = useState<number>(0);

    useEffect(() => {
        setIsMounted(true);
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
                description="New features and releases"
                active={active}
                badge={isMounted && hasNewUpdates ? <div className="w-2.5 h-2.5 bg-brand-cyan rounded-full ring-4 ring-brand-cyan/20 animate-pulse" /> : null}
            />
        </div>
    );
}
