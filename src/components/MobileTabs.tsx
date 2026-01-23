"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ShoppingBag, BarChart, Store, Wallet, Truck, LayoutDashboard, Settings, Users, Sparkles, Users as Staff } from "lucide-react";

interface MobileTabsProps {
    storeSlug: string;
}

export default function MobileTabs({ storeSlug }: MobileTabsProps) {
    const pathname = usePathname();

    const tabs = [
        { name: "Dashboard", href: `/${storeSlug}/admin`, icon: LayoutDashboard, exact: true },
        { name: "Inventory", href: `/${storeSlug}/admin/inventory`, icon: Package },
        { name: "Orders", href: `/${storeSlug}/admin/orders`, icon: ShoppingBag },
        { name: "Customers", href: `/${storeSlug}/admin/customers`, icon: Users },
        { name: "Staff", href: `/${storeSlug}/admin/staff`, icon: Staff },
        { name: "Reports", href: `/${storeSlug}/admin/reports`, icon: BarChart },
        { name: "Finance", href: `/${storeSlug}/admin/finance`, icon: Wallet },
        { name: "Updates", href: `/${storeSlug}/admin/updates`, icon: Sparkles },
        { name: "Settings", href: `/${storeSlug}/admin/settings`, icon: Settings },
        { name: "Delivery", href: `/${storeSlug}/admin/settings/delivery`, icon: Truck },
        { name: "Storefront", href: `/${storeSlug}`, icon: Store, isExternal: true },
    ];

    return (
        <div className="md:hidden sticky top-16 z-20 bg-white border-b border-gray-100 overflow-y-auto max-h-[calc(100vh-4rem-4rem)] pb-20">
            <div className="flex flex-col p-4 space-y-1">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = tab.exact
                        ? pathname === tab.href
                        : pathname.startsWith(tab.href);

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            target={tab.isExternal ? "_blank" : undefined}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                ? "bg-gray-900 text-white shadow-lg"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            <Icon size={18} className={isActive ? "text-brand-orange" : ""} />
                            {tab.name}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
