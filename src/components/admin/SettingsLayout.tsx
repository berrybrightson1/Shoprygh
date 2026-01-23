"use client";

import { usePathname } from "next/navigation";
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
    { id: "activity", label: "Activity", icon: Activity, description: "Audit logs and history", path: (slug: string) => `/${slug}/admin/settings?tab=activity` },
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
                <aside className={`w-full lg:w-[320px] shrink-0 border-r border-gray-100 bg-gray-50/50 flex flex-col ${!showMenuOnMobile ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="p-8 hidden lg:block">
                        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-widest">Preferences</h2>
                    </div>

                    <nav className="flex-1 px-4 lg:px-6 pb-24 lg:pb-8 space-y-1">
                        {/* Store Section */}
                        <div className="px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] mb-3 mt-4">Store Management</div>
                        {[TABS[0], TABS[1], TABS[2]].map((tab) => (
                            <TabLink key={tab.id} tab={tab} activeTabId={activeTabId} storeSlug={storeSlug} />
                        ))}

                        <div className="h-4" />
                        <div className="px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] mb-3">Personal Hub</div>
                        {[TABS[3], TABS[4]].map((tab) => (
                            <TabLink key={tab.id} tab={tab} activeTabId={activeTabId} storeSlug={storeSlug} />
                        ))}

                        <div className="h-4" />
                        <div className="px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] mb-3">Safety & History</div>
                        {[TABS[5], TABS[6]].map((tab) => (
                            <TabLink key={tab.id} tab={tab} activeTabId={activeTabId} storeSlug={storeSlug} />
                        ))}
                    </nav>
                </aside>

                {/* Content Area (B) */}
                <main className={`flex-1 flex flex-col ${showMenuOnMobile ? 'hidden lg:flex' : 'flex'}`}>

                    {/* Header with Back Button for Mobile */}
                    <div className="px-6 py-6 lg:px-10 lg:py-8 border-b border-gray-50 bg-white">
                        <div className="flex items-center gap-4">
                            {!showMenuOnMobile && (
                                <Link
                                    href={`/${storeSlug}/admin/settings`}
                                    className="lg:hidden p-3 bg-gray-100 rounded-2xl text-gray-900 active:scale-95 transition-transform"
                                >
                                    <ArrowLeft size={20} strokeWidth={2.5} />
                                </Link>
                            )}
                            <div className="flex-1 min-w-0 text-left">
                                <h3 className="text-xl lg:text-3xl font-medium text-gray-900 tracking-tight truncate">
                                    {title || TABS.find(t => t.id === activeTabId)?.label}
                                </h3>
                                <p className="text-sm text-gray-500 font-medium mt-1 truncate">
                                    {description || TABS.find(t => t.id === activeTabId)?.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500 custom-scrollbar">
                        <div className="max-w-3xl w-full mx-auto lg:mx-0">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

function TabLink({ tab, activeTabId, storeSlug }: { tab: any, activeTabId?: string, storeSlug: string }) {
    const Icon = tab.icon;
    const isActive = activeTabId === tab.id;
    const path = tab.path(storeSlug);

    return (
        <Link
            href={path}
            className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all ${isActive
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
            <ChevronRight size={16} className={`text-gray-300 transition-transform ${isActive ? 'translate-x-1 text-gray-900' : ''}`} />
        </Link>
    );
}
