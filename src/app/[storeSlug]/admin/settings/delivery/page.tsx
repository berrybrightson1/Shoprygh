import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MapPin, Plus, Trash2, Truck } from "lucide-react";
import { createDeliveryZone, deleteDeliveryZone } from "./actions";

export default async function DeliverySettings({ params }: { params: Promise<{ storeSlug: string }> }) {
    const { storeSlug } = await params;
    const session = await getSession();
    if (!session) redirect("/login");

    const zones = await prisma.deliveryZone.findMany({
        where: { storeId: session.storeId },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <span className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-orange flex items-center justify-center border border-orange-100 shadow-sm">
                        <Truck size={24} />
                    </span>
                    Delivery Zones
                </h1>
                <p className="text-gray-500 font-bold mt-2 ml-1 max-w-xl">
                    Define specific areas where you deliver and set custom fees. These will be shown to customers during checkout.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-xl shadow-gray-200/50">
                        <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Plus size={18} className="text-brand-orange" /> Add New Zone
                        </h2>
                        <form action={createDeliveryZone} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Zone Name</label>
                                <input
                                    name="name"
                                    placeholder="e.g. East Legon"
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-brand-orange focus:ring-4 focus:ring-orange-500/10 transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Fee (₵)</label>
                                <input
                                    name="fee"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-brand-orange focus:ring-4 focus:ring-orange-500/10 transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Description (Optional)</label>
                                <textarea
                                    name="description"
                                    placeholder="e.g. Within 5km of A&C Mall"
                                    rows={3}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-orange focus:ring-4 focus:ring-orange-500/10 transition-all resize-none"
                                />
                            </div>
                            <button className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-gray-200">
                                Save Zone
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Zones */}
                <div className="lg:col-span-2 space-y-4">
                    {zones.length === 0 ? (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[24px] p-12 text-center flex flex-col items-center justify-center text-gray-400">
                            <MapPin size={48} className="mb-4 opacity-20" />
                            <p className="font-bold text-lg text-gray-500">No delivery zones yet</p>
                            <p className="text-sm">Add your first zone to start managing delivery fees.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {zones.map((zone) => (
                                <div key={zone.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-50 to-transparent rounded-bl-3xl -mr-4 -mt-4 opacity-50" />

                                    <div className="flex justify-between items-start mb-2 relative z-10">
                                        <div className="p-2 bg-orange-50 text-brand-orange rounded-xl">
                                            <MapPin size={18} />
                                        </div>
                                        <form action={deleteDeliveryZone}>
                                            <input type="hidden" name="id" value={zone.id} />
                                            <button className="text-gray-300 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </form>
                                    </div>

                                    <div>
                                        <h3 className="font-black text-gray-900 text-lg leading-tight mb-1">{zone.name}</h3>
                                        {zone.description && <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-3">{zone.description}</p>}
                                        <div className="inline-flex items-center px-3 py-1 bg-gray-900 text-white rounded-lg text-xs font-bold tracking-wide shadow-md shadow-gray-200">
                                            ₵{Number(zone.fee).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
