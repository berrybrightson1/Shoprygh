"use client";

import { Shield, ShoppingBag, User, Settings, FileText, Lock, Calendar } from "lucide-react";
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
            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
                {TIME_PERIODS.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setPeriod(key)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${period === key
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
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
                    <p className="text-gray-400 font-bold text-sm">No activity in this period.</p>
                </div>
            ) : (
                filteredLogs.map((log) => (
                    <div key={log.id} className="flex gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100/50 hover:bg-white hover:border-gray-200 hover:shadow-sm transition duration-200 group">
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
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-sm bg-black text-white text-[8px] flex items-center justify-center font-black">
                                    {log.user.name?.[0] || "U"}
                                </div>
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                    {log.action.replace(/_/g, " ")}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400">
                                    {timeAgo(new Date(log.createdAt))}
                                </span>
                            </div>

                            <LogMessage description={log.description || "Performed an action"} />

                            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 font-medium">
                                <span>by</span>
                                <span className="text-gray-900 font-bold hover:underline cursor-pointer">{log.user.name}</span>
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

    return <Shield size={18} className="text-gray-400" />;
}




function LogMessage({ description }: { description: string }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLong = description.length > 50;

    return (
        <div className="relative">
            <p
                className={`text-sm font-bold text-gray-900 leading-snug cursor-pointer transition-all ${isExpanded ? "" : "truncate"}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {description}
            </p>
            {isLong && !isExpanded && (
                <button
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
                    className="text-[10px] font-black text-brand-cyan hover:underline mt-0.5"
                >
                    View Details
                </button>
            )}
        </div>
    );
}
