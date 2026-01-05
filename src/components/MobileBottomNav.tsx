"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
    storeSlug: string;
}

export default function MobileBottomNav({ storeSlug }: MobileBottomNavProps) {
    const pathname = usePathname();

    const navItems = [
        {
            name: "Home",
            href: `/${storeSlug}/admin`,
            icon: LayoutDashboard,
            exact: true
        },
        {
            name: "Orders",
            href: `/${storeSlug}/admin/orders`,
            icon: ShoppingBag,
            exact: false
        },
        {
            name: "Inventory",
            href: `/${storeSlug}/admin/inventory`,
            icon: Package,
            exact: false
        },
        {
            name: "Settings",
            href: `/${storeSlug}/admin/settings`,
            icon: Settings,
            exact: false
        }
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe">
            <nav className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1",
                                isActive ? "text-brand-purple" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <item.icon size={20} className={isActive ? "fill-brand-purple/20" : ""} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-bold">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
