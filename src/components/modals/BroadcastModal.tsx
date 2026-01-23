"use client";

import { Megaphone, X, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createBroadcast } from "@/app/actions/platform"; // We will create this

export default function BroadcastModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState("INFO"); // INFO, WARNING, ALERT
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createBroadcast({ title, message, type });
            toast.success("Broadcast sent to all sellers!");
            setIsOpen(false);
            setTitle("");
            setMessage("");
        } catch (error) {
            toast.error("Failed to send broadcast");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                aria-label="Broadcast Notification"
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:shadow-sm transition text-gray-400 hover:text-black"
            >
                <Megaphone size={16} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                                    <Megaphone size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-gray-900 leading-none">Broadcast</h3>
                                    <p className="text-xs text-gray-500 font-bold mt-1">Send a notification to all sellers</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} title="Close" aria-label="Close" className="text-gray-400 hover:text-gray-900 transition hover:bg-gray-100 p-2 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-900 uppercase mb-1.5 ml-1">Title</label>
                                <input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition"
                                    placeholder="e.g. System Maintenance"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-900 uppercase mb-1.5 ml-1">Message</label>
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition min-h-[100px] resize-none"
                                    placeholder="e.g. We will be performing maintenance at..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <button type="button" onClick={() => setType('INFO')} className={`py-2 rounded-xl text-xs font-bold border-2 transition ${type === 'INFO' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>INFO</button>
                                <button type="button" onClick={() => setType('WARNING')} className={`py-2 rounded-xl text-xs font-bold border-2 transition ${type === 'WARNING' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>WARNING</button>
                                <button type="button" onClick={() => setType('ALERT')} className={`py-2 rounded-xl text-xs font-bold border-2 transition ${type === 'ALERT' ? 'border-red-500 bg-red-50 text-red-600' : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>ALERT</button>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition shadow-xl shadow-gray-200 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : <Send size={18} />}
                                Send Broadcast
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
