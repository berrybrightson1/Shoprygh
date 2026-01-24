"use client";

import { usePathname, useRouter } from "next/navigation";
import { User, CreditCard, Activity, Store, ShieldAlert, Truck, BadgeCheck, ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface SettingsLayoutProps {
    children: React.ReactNode;
    storeSlug: string;
    activeTab?: string;
    title?: React.ReactNode;
    description?: string;
}

const TABS = [
    { id: "general", label: "General", icon: Store, description: "Store profile and contact info", path: (slug: string) => `/${slug}/admin/settings` },
    { id: "delivery", label: "Delivery", icon: Truck, description: "Delivery zones and fees", path: (slug: string) => `/${slug}/admin/settings/delivery` },
    { id: "verification", label: "Verification", icon: BadgeCheck, description: "Get verified badge", path: (slug: string) => `/${slug}/admin/verification` },
    { id: "account", label: "My Account", icon: User, description: "Personal details and password", path: (slug: string) => `/${slug}/admin/settings?tab=account` },
    { id: "billing", label: "Billing", icon: CreditCard, description: "Subscription tier and payments", path: (slug: string) => `/${slug}/admin/settings?tab=billing` },

    // { id: "activity", label: "Activity", icon: Activity, description: "Audit logs and history", path: (slug: string) => `/${slug}/admin/settings?tab=activity` },
    { id: "danger", label: "Danger Zone", icon: ShieldAlert, description: "Irreversible actions", danger: true, path: (slug: string) => `/${slug}/admin/settings?tab=danger` },
];

export default function SettingsLayout({
    children,
    storeSlug,
    activeTab: propActiveTab,
    title,
    description
}: SettingsLayoutProps) {
    const pathname = usePathname();

    const activeTabId = propActiveTab || TABS.find(tab => {
        const tabPath = tab.path(storeSlug);
        if (tabPath.includes('?')) {
            return pathname + window.location.search === tabPath;
        }
        return pathname === tabPath;
    })?.id;

    const isBaseSettings = pathname === `/${storeSlug}/admin/settings`;
    const hasQueryTab = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('tab');
    const showMenuOnMobile = isBaseSettings && !hasQueryTab;

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-screen">
            <header className="mb-8">
                <Link
                    href={`/${storeSlug}/admin/inventory`}
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-black transition mb-4 font-medium text-[10px] uppercase tracking-widest"
                >
                    <ArrowLeft size={12} strokeWidth={3} />
                    Back to Dashboard
                </Link>
                <h1 className="text-4xl font-medium text-gray-900 tracking-tight">
                    Settings
                </h1>
            </header>

            <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50 flex flex-col lg:flex-row min-h-[750px] overflow-hidden">

                {/* Sidebar / Menu List (A) */}
                <aside className="w-full lg:w-[320px] shrink-0 border-r border-gray-100 bg-gray-50/50 flex flex-col">
                    <div className="p-8 hidden lg:block">
                        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-widest">Preferences</h2>
                    </div>

                    <nav className="flex-1 px-4 lg:px-6 pb-24 lg:pb-8 space-y-1">
                        {/* Store Section */}
                        <div className="px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] mb-3 mt-4">Store Management</div>
                        {[TABS[0], TABS[1], TABS[2]].map((tab) => (
                            <TabLink key={tab.id} tab={tab} activeTabId={activeTabId} storeSlug={storeSlug}>
                                {activeTabId === tab.id && <div className="lg:hidden mt-2 pl-4 pr-2 pb-4 animate-in slide-in-from-top-2 fade-in">{children}</div>}
                            </TabLink>
                        ))}

                        <div className="h-4" />
                        <div className="px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] mb-3">Personal Hub</div>
                        {[TABS[3], TABS[4]].map((tab) => (
                            <TabLink key={tab.id} tab={tab} activeTabId={activeTabId} storeSlug={storeSlug}>
                                {activeTabId === tab.id && <div className="lg:hidden mt-2 pl-4 pr-2 pb-4 animate-in slide-in-from-top-2 fade-in">{children}</div>}
                            </TabLink>
                        ))}

                        <div className="h-4" />
                        <div className="px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] mb-3">Safety & History</div>
                        {[TABS[5]].filter(Boolean).map((tab) => (
                            <TabLink key={tab.id} tab={tab} activeTabId={activeTabId} storeSlug={storeSlug}>
                                {activeTabId === tab.id && <div className="lg:hidden mt-2 pl-4 pr-2 pb-4 animate-in slide-in-from-top-2 fade-in">{children}</div>}
                            </TabLink>
                        ))}
                    </nav>
                </aside>

                {/* Content Area (B) - Desktop Only now for active tab, or mobile if we were keeping old behavior (but we are switching to accordion) */}
                <main className="hidden lg:flex-1 lg:flex lg:flex-col">

                    {/* Header */}
                    <div className="px-10 py-8 border-b border-gray-50 bg-white">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 min-w-0 text-left">
                                <h3 className="text-3xl font-medium text-gray-900 tracking-tight truncate">
                                    {title || TABS.find(t => t.id === activeTabId)?.label}
                                </h3>
                                <p className="text-sm text-gray-500 font-medium mt-1 truncate">
                                    {description || TABS.find(t => t.id === activeTabId)?.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-12 animate-in fade-in slide-in-from-bottom-4 duration-500 custom-scrollbar">
                        <div className="max-w-3xl w-full">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

interface TabLinkProps {
    tab: any;
    activeTabId?: string;
    storeSlug: string;
    children?: React.ReactNode;
}

function TabLink({ tab, activeTabId, storeSlug, children }: TabLinkProps) {
    const Icon = tab.icon;
    const isActive = activeTabId === tab.id;
    const path = tab.path(storeSlug);
    const router = useRouter();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Only apply toggle behavior on mobile (lg breakpoint is 1024px)
        if (isActive && window.innerWidth < 1024) {
            e.preventDefault();
            // Navigate to a "closed" state (using a special query param or just removing the tab param if default wasn't forced)
            // Since page.tsx defaults '' to 'general', we use 'closed' to force an empty state
            router.push(`/${storeSlug}/admin/settings?tab=closed`);
        }
    };

    return (
        <div className="flex flex-col">
            <Link
                href={path}
                onClick={handleClick}
                className={`w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-3xl transition-all ${isActive
                    ? "bg-white text-gray-900 shadow-xl shadow-gray-200/50 ring-1 ring-gray-100"
                    : "text-gray-500 hover:bg-white hover:shadow-lg hover:shadow-gray-200/30"
                    }`}
            >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${isActive ? (tab.danger ? 'bg-red-50 text-red-600' : 'bg-black text-white') : 'bg-white border border-gray-100 text-gray-400'}`}>
                    <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                    <div className={`text-sm font-medium truncate ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>{tab.label}</div>
                    <div className="text-[11px] text-gray-400 font-medium truncate mt-0.5">{tab.description}</div>
                </div>
                <ChevronRight size={16} className={`text-gray-300 transition-transform ${isActive ? 'rotate-90 lg:translate-x-1 lg:rotate-0 text-gray-900' : ''}`} />
            </Link>
            {children}
        </div>
    );
}
