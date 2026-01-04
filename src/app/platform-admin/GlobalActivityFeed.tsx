import { ShoppingBag, UserPlus, Zap } from "lucide-react";

type Activity = {
    id: string;
    type: "ORDER" | "SIGNUP" | "SYSTEM";
    title: string;
    subtitle: string;
    time: string; // e.g., "2m ago"
};

export default function GlobalActivityFeed({ activities }: { activities: Activity[] }) {
    return (
        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col h-full shadow-2xl shadow-gray-900/20">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    <h3 className="font-black text-lg tracking-tight">Live Pulse</h3>
                </div>
                <span className="text-[10px] font-bold bg-gray-800 px-2 py-1 rounded-lg border border-gray-700 text-gray-400">REALTIME</span>
            </div>

            {/* Feed */}
            <div className="space-y-6 relative z-10 overflow-y-auto custom-scrollbar pr-2">
                {activities.length === 0 ? (
                    <p className="text-gray-500 text-sm font-medium">All quiet on the platform.</p>
                ) : (
                    activities.map((activity) => (
                        <div key={activity.id} className="flex gap-4 items-start group">
                            <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10 ${activity.type === 'ORDER' ? 'bg-green-500/20 text-green-400' :
                                    activity.type === 'SIGNUP' ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-purple-500/20 text-purple-400'
                                }`}>
                                {activity.type === 'ORDER' && <ShoppingBag size={14} />}
                                {activity.type === 'SIGNUP' && <UserPlus size={14} />}
                                {activity.type === 'SYSTEM' && <Zap size={14} />}
                            </div>
                            <div>
                                <p className="text-sm font-bold leading-tight group-hover:text-brand-cyan transition">{activity.title}</p>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">{activity.subtitle} • {activity.time}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Decoration */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-cyan/20 rounded-full blur-[80px]" />
        </div>
    );
}
