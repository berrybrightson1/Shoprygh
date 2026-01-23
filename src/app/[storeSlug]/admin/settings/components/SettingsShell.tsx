"use client";

import { useState } from "react";
import { User, CreditCard, Activity, Trash2, Store, Lock, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface SettingsShellProps {
    children: React.ReactNode;
    defaultTab?: string;
}

const TABS = [
    { id: "general", label: "General", icon: Store, description: "Store profile and contact info" },
    { id: "account", label: "My Account", icon: User, description: "Personal details and password" },
    { id: "billing", label: "Billing", icon: CreditCard, description: "Subscription tier and payments" },
    { id: "activity", label: "Activity", icon: Activity, description: "Audit logs and history" },
    { id: "danger", label: "Danger Zone", icon: ShieldAlert, description: "Irreversible actions", danger: true },
];

export default function SettingsShell({
    // We pass components as props or use children composition, 
    // but a cleaner way for client-side tabs is to pass them as named slots 
    // OR just use client state to switch visibility.
    // Given the props are massive, let's use the Slot pattern.
    GeneralSlot,
    AccountSlot,
    BillingSlot,
    ActivitySlot,
    DangerSlot
}: {
    GeneralSlot: React.ReactNode;
    AccountSlot: React.ReactNode;
    BillingSlot: React.ReactNode;
    ActivitySlot: React.ReactNode;
    DangerSlot: React.ReactNode;
}) {
    const [activeTab, setActiveTab] = useState("general");

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0 space-y-1">
                <div className="mb-6 px-2 md:px-0">
                    <h2 className="text-xl font-black text-gray-900">Settings</h2>
                    <p className="text-sm text-gray-500 font-medium">Manage your store preferences</p>
                </div>

                <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 gap-1">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left flex-shrink-0 whitespace-nowrap lg:whitespace-normal ${isActive
                                    ? "bg-gray-900 text-white shadow-lg shadow-gray-900/10"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                    } ${tab.danger && !isActive ? "hover:text-red-600 hover:bg-red-50" : ""}`}
                            >
                                <Icon size={18} className={isActive ? "text-brand-orange" : tab.danger ? "text-red-400" : "text-gray-400"} />
                                <div>
                                    <div className={`text-sm font-bold ${tab.danger && !isActive ? "text-red-600" : ""}`}>{tab.label}</div>
                                </div>
                            </button>
                        );
                    })}
                </nav>
            </aside>

            {/* Content Area */}
            <main className="flex-1 bg-white md:rounded-[32px] md:p-8 p-4 border border-gray-100 shadow-sm min-h-[600px]">
                <div className="max-w-3xl">
                    <div className="mb-8 border-b border-gray-100 pb-6">
                        <h3 className="text-2xl font-black text-gray-900">
                            {TABS.find(t => t.id === activeTab)?.label}
                        </h3>
                        <p className="text-gray-500 font-medium mt-1">
                            {TABS.find(t => t.id === activeTab)?.description}
                        </p>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {activeTab === "general" && GeneralSlot}
                        {activeTab === "account" && AccountSlot}
                        {activeTab === "billing" && BillingSlot}
                        {activeTab === "activity" && ActivitySlot}
                        {activeTab === "danger" && DangerSlot}
                    </div>
                </div>
            </main>
        </div>
    );
}
