"use client";

import { useMemo } from "react";

export default function PlatformGrowthChart({ data }: { data: { date: string; value: number }[] }) {
    // Determine max value for scaling
    const maxValue = Math.max(...data.map(d => d.value), 100);
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (d.value / maxValue) * 80; // Leave 20% padding top
        return `${x},${y}`;
    }).join(" ");

    // Curve Smoothing helper (Simple Catmull-Rom or similar, or just straight lines for now for robustness, 
    // actually let's do a simple cubic bezier for nice visuals)
    // For simplicity and "Father of All" vibes, let's use a straight polygon with gradient fill first, maybe smooth later if needed.
    // SVG Polygon: points + bottom corners
    const polygonPoints = `0,100 ${points} 100,100`;

    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-white/60 shadow-xl shadow-indigo-100/50 relative overflow-hidden group">
            {/* Header */}
            <div className="flex justify-between items-end mb-6 relative z-10">
                <div>
                    <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">30-Day Trajectory</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-gray-900">Growth</span>
                        <span className="text-sm font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">+12.5%</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Timeframe pills could go here */}
                </div>
            </div>

            {/* Chart Area */}
            <div className="h-48 w-full relative z-10">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    <line x1="0" y1="20" x2="100" y2="20" stroke="#f3f4f6" strokeWidth="0.5" strokeDasharray="2 2" />
                    <line x1="0" y1="60" x2="100" y2="60" stroke="#f3f4f6" strokeWidth="0.5" strokeDasharray="2 2" />
                    <line x1="0" y1="100" x2="100" y2="100" stroke="#f3f4f6" strokeWidth="0.5" />

                    {/* Area Fill */}
                    <polygon points={polygonPoints} fill="url(#chartGradient)" />

                    {/* Line Stroke */}
                    <polyline points={points} fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />

                    {/* Data Points (Hover effect could be added here) */}
                    {data.map((d, i) => {
                        const x = (i / (data.length - 1)) * 100;
                        const y = 100 - (d.value / maxValue) * 80;
                        return (
                            <circle key={i} cx={x} cy={y} r="1.5" fill="#fff" stroke="#8b5cf6" strokeWidth="1" className="opacity-0 group-hover:opacity-100 transition duration-500 hover:scale-150" vectorEffect="non-scaling-stroke" />
                        )
                    })}
                </svg>
            </div>

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100/50 rounded-full blur-3xl -z-0 opacity-40 translate-x-1/3 -translate-y-1/3" />
        </div>
    );
}
