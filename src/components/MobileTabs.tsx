"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ShoppingBag, BarChart, Store, Wallet, Truck, LayoutDashboard, Settings, Users } from "lucide-react";

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
        { name: "Reports", href: `/${storeSlug}/admin/reports`, icon: BarChart },
        { name: "Finance", href: `/${storeSlug}/admin/finance`, icon: Wallet },
        { name: "Settings", href: `/${storeSlug}/admin/settings`, icon: Settings },
        { name: "Delivery", href: `/${storeSlug}/admin/settings/delivery`, icon: Truck },
        { name: "Storefront", href: `/${storeSlug}`, icon: Store, isExternal: true },
    ];

    return (
        <div className="md:hidden sticky top-16 z-20 bg-white border-b border-gray-100 -mx-4 px-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 py-3 min-w-max">
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
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${isActive
                                    ? "bg-gray-900 text-white shadow-lg"
                                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                                }`}
                        >
                            <Icon size={16} />
                            {tab.name}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
