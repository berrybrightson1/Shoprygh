import prisma from "@/lib/prisma";
import { Sparkles, Calendar } from "lucide-react";

export default async function UpdatesPage() {
    const updates = await prisma.systemUpdate.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="max-w-4xl mx-auto p-6">
            <header className="mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
                    <Sparkles size={12} />
                    What's New
                </div>
                <h1 className="text-4xl font-black text-gray-900 mb-2">System Updates</h1>
                <p className="text-gray-500 font-medium">Latest improvements, features, and fixes for your dashboard.</p>
            </header>

            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {updates.length === 0 && (
                    <div className="text-center py-20 bg-white/50 rounded-3xl border border-gray-100">
                        <p className="text-gray-400 font-bold">No updates yet. Check back soon!</p>
                    </div>
                )}

                {updates.map((update) => (
                    <div key={update.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Icon/Dot */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-gray-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <Sparkles size={16} className="text-brand-cyan" />
                        </div>

                        {/* Content Card */}
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-lg shadow-gray-200/50 hover:shadow-xl transition duration-300">
                            <div className="flex items-center justify-between mb-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
                                    v{update.version}
                                </span>
                                <time className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(update.createdAt).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </time>
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-brand-cyan transition-colors">
                                {update.title}
                            </h3>
                            <div className="prose prose-sm prose-gray font-medium text-gray-600">
                                <p>{update.content}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
