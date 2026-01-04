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
    const isOwner = currentUser.role === "OWNER"; // Fixed: was "Owner Access", should be "OWNER"

    return (
        <>
            {/* Mobile Header Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#111827] text-white z-30 flex items-center px-4 justify-between shadow-md border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-2 -ml-2 rounded-lg hover:bg-gray-800 transition text-gray-300 hover:text-white"
                        aria-label="Open sidebar"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="flex flex-col">
                        <span className="font-bold text-base leading-none">Shopry</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Seller Hub</span>
                    </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-cyan to-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                    {initials}
                </div>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#111827] border-r border-gray-800 flex flex-col h-screen text-gray-300 shadow-xl transition-transform duration-300 ease-in-out md:translate-x-0 md:fixed md:top-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>

                {/* Header */}
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-orange to-pink-600 text-white rounded-xl shadow-lg shadow-orange-900/20 flex items-center justify-center font-bold text-xl">
                        S
                    </div>
                    <div>
                        <span className="font-bold text-xl text-white block leading-none">Shopry</span>
                        <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Seller Hub</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <div className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Menu</div>

                    <NavLink
                        href={`/${storeSlug}`}
                        icon={<Store size={20} />}
                        label="Front Store"
                        active={false}
                        isExternal
                    />

                    <div className="h-px bg-gray-800 mx-4 my-2" />

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
                    <div className="relative">
                        <NavLink
                            href={`/${storeSlug}/admin/updates`}
                            icon={<Sparkles size={20} />}
                            label="Updates"
                            active={pathname?.startsWith(`/${storeSlug}/admin/updates`)}
                        />
                        {/* Green Dot Logic: Show if update is < 3 days old */}
                        {latestUpdateDate && (new Date().getTime() - new Date(latestUpdateDate).getTime() < 3 * 24 * 60 * 60 * 1000) && (
                            <span className="absolute top-2 right-4 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#111827] animate-pulse pointer-events-none" />
                        )}
                    </div>

                    <NavLink
                        href={`/${storeSlug}/admin/finance`}
                        icon={<Wallet size={20} />}
                        label="Finance"
                        active={pathname?.startsWith(`/${storeSlug}/admin/finance`)}
                    />

                    <div className="h-px bg-gray-800 mx-4 my-2" />

                    <NavLink
                        href={`/${storeSlug}/admin/settings`}
                        icon={<Store size={20} />}
                        label="Settings"
                        active={pathname?.startsWith(`/${storeSlug}/admin/settings`)}
                    />


                    {/* Platform Admin Link - Only for Super Admins */}
                    {currentUser.isPlatformAdmin && (
                        <>
                            <div className="h-px bg-gray-800 mx-4 my-2" />
                            <Link
                                href="/platform-admin"
                                className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white hover:shadow-md transition-all duration-300 group"
                            >
                                <span className="text-gray-500 group-hover:text-brand-cyan transition-colors">
                                    <Shield size={20} />
                                </span>
                                <span>Platform Admin</span>
                            </Link>
                        </>
                    )}
                </nav>

                {/* User Profile / Switcher */}
                <div className="relative p-6 border-t border-gray-800 bg-[#0f1523]">

                    {/* Switcher Popup */}
                    {isSwitcherOpen && (
                        <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#1f2937] border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-50">
                            <div className="p-3 border-b border-gray-700">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account</p>
                            </div>

                            <div className="p-2 border-t border-gray-700 bg-gray-800/50">
                                <form action={logout}>
                                    <button className="w-full text-xs font-bold text-red-400 hover:text-red-300 py-2 flex items-center justify-center gap-2 transition">
                                        <LogOut size={12} /> Sign Out
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Profile Trigger */}
                    <button
                        onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all border border-transparent ${isSwitcherOpen ? "bg-gray-800 border-gray-700" : "hover:bg-gray-800 hover:border-gray-700/50"}`}
                    >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-cyan to-blue-600 flex items-center justify-center font-bold text-white shadow-md">
                            {initials}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <p className="text-sm font-bold text-white leading-tight truncate">{currentUser.name || "User"}</p>
                            <p className="text-xs text-brand-cyan font-medium truncate">{currentUser.role || "Admin"}</p>
                        </div>
                        <ChevronUp size={16} className={`text-gray-500 transition-transform duration-300 ${isSwitcherOpen ? "rotate-0" : "rotate-180"}`} />
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
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${active
                ? "bg-gray-800 text-white shadow-md shadow-black/40 border-l-4 border-brand-orange font-bold relative overflow-hidden"
                : "text-gray-400 hover:bg-gray-800 hover:text-white hover:shadow-md hover:shadow-black/20"
                }`}
        >
            <span className={`relative z-10 ${active ? "text-brand-orange" : "text-gray-500 group-hover:text-white transition-colors"}`}>
                {icon}
            </span>
            <span className="relative z-10">{label}</span>
            {active && (
                <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/10 to-transparent pointer-events-none" />
            )}
        </Link>
    );
}
