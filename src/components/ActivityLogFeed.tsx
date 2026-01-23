"use client";

import { Shield, ShoppingBag, User, Settings, FileText, Lock, Calendar, Sparkles, Megaphone } from "lucide-react";
import { useState, useMemo } from "react";

type AuditLog = {
    id: string;
    action: string;
    description: string | null;
    createdAt: Date;
    user: {
        name: string;
        image?: string | null;
        email?: string | null;
    };
};

type TimePeriod = 'day' | 'week' | 'month' | 'year';

const TIME_PERIODS: { key: TimePeriod; label: string }[] = [
    { key: 'day', label: 'Today' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
];

function getStartOfPeriod(period: TimePeriod): Date {
    const now = new Date();
    switch (period) {
        case 'day':
            return new Date(now.getFullYear(), now.getMonth(), now.getDate());
        case 'week':
            const dayOfWeek = now.getDay();
            return new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        case 'month':
            return new Date(now.getFullYear(), now.getMonth(), 1);
        case 'year':
            return new Date(now.getFullYear(), 0, 1);
    }
}

export default function ActivityLogFeed({ logs }: { logs: any[] }) {
    const [period, setPeriod] = useState<TimePeriod>('week');

    const filteredLogs = useMemo(() => {
        if (!logs || logs.length === 0) return [];
        const startDate = getStartOfPeriod(period);
        return logs.filter(log => new Date(log.createdAt) >= startDate);
    }, [logs, period]);

    return (
        <div className="space-y-4">
            {/* Time Period Filter */}
            <div className="flex flex-wrap items-center gap-1 p-1 w-full md:w-fit mb-2">
                {TIME_PERIODS.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setPeriod(key)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-300 ${period === key
                            ? 'bg-gray-900 text-white shadow-md shadow-gray-200'
                            : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Activity List */}
            {filteredLogs.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                    <Calendar className="mx-auto mb-3 text-gray-300" size={32} />
                    <p className="text-gray-400 font-medium text-sm">No activity in this period.</p>
                </div>
            ) : (
                filteredLogs.map((log) => (
                    <div key={log.id} className="flex gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-gray-50/50 border border-gray-100/50 hover:bg-white hover:border-gray-200 hover:shadow-sm transition duration-200 group">
                        <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover:scale-105 transition duration-300">
                                <ActionIcon action={log.action} />
                            </div>
                            {log.user.image ? (
                                <img
                                    src={log.user.image}
                                    alt={log.user.name}
                                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-sm object-cover"
                                />
                            ) : (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-sm bg-gray-900 text-white text-[8px] flex items-center justify-center font-medium">
                                    {log.user.name?.[0] || "U"}
                                </div>
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                                    {log.action.replace(/_/g, " ")}
                                </span>
                                <span className="text-[10px] font-light text-gray-400">
                                    {timeAgo(new Date(log.createdAt))}
                                </span>
                            </div>

                            <LogMessage description={log.description || "Performed an action"} />

                            <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-400 font-light">
                                <span>by</span>
                                <span className="text-gray-900 font-medium hover:underline cursor-pointer">{log.user.name}</span>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

function timeAgo(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    const intervals = {
        y: 31536000,
        m: 2592000,
        d: 86400,
        h: 3600,
        min: 60
    };

    for (const [key, value] of Object.entries(intervals)) {
        const count = Math.floor(seconds / value);
        if (count >= 1) {
            return `${count}${key}`;
        }
    }
    return 'now';
}

function ActionIcon({ action }: { action: string }) {
    if (action.includes("LOGIN") || action.includes("LOGOUT")) return <Lock size={18} className="text-blue-600" />;
    if (action.includes("ORDER")) return <ShoppingBag size={18} className="text-green-600" />;
    if (action.includes("PROFILE")) return <User size={18} className="text-purple-600" />;
    if (action.includes("SETTINGS")) return <Settings size={18} className="text-orange-600" />;
    if (action.includes("PRODUCT")) return <ShoppingBag size={18} className="text-indigo-600" />;
    if (action.includes("EXPORT")) return <FileText size={18} className="text-gray-600" />;
    if (action.includes("AI")) return <Sparkles size={18} className="text-brand-purple" />;
    if (action.includes("BROADCAST")) return <Megaphone size={18} className="text-red-500" />;

    return <Shield size={18} className="text-gray-400" />;
}




function LogMessage({ description }: { description: string }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLong = description.length > 50;

    return (
        <div className="relative">
            <p
                className={`text-xs font-normal text-gray-700 leading-snug cursor-pointer transition-all ${isExpanded ? "" : "truncate"}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {description}
            </p>
            {isLong && !isExpanded && (
                <button
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
                    className="text-[10px] font-medium text-brand-cyan hover:underline mt-0.5"
                >
                    View Details
                </button>
            )}
        </div>
    );
}
