import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Shield, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { approvePayout, rejectPayout } from "./actions";

export default async function PlatformFinancePage() {
    const session = await getSession();
    if (!session || !session.isPlatformAdmin) redirect("/login");

    const pendingPayouts = await prisma.payoutRequest.findMany({
        where: { status: "PENDING" },
        include: { store: true },
        orderBy: { createdAt: "asc" }
    });

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 border border-gray-200">
                            <Shield size={12} /> Platform Admin
                        </div>
                        <h1 className="text-3xl font-black text-gray-900">Payout Requests</h1>
                    </div>
                    <Link href="/platform-admin" className="text-gray-500 font-bold hover:text-gray-900 transition">
                        Back to Overview
                    </Link>
                </header>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                    {pendingPayouts.length === 0 ? (
                        <div className="p-20 text-center">
                            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2">All Caught Up!</h2>
                            <p className="text-gray-500 font-medium">No pending payout requests found.</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Store</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Requested</th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pendingPayouts.map((payout) => (
                                    <tr key={payout.id} className="group hover:bg-blue-50/50 transition">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">{payout.store.name}</p>
                                            <p className="text-xs text-gray-500 font-mono">/{payout.store.slug}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black text-gray-900 text-lg">GH₵ {Number(payout.amount).toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p className="font-bold text-gray-700">{payout.method}</p>
                                                <p className="text-gray-500">{payout.destination}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                                <Clock size={12} />
                                                {new Date(payout.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <form action={approvePayout}>
                                                    <input type="hidden" name="payoutId" value={payout.id} />
                                                    <button type="submit" className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition" title="Approve">
                                                        <CheckCircle size={18} />
                                                    </button>
                                                </form>
                                                <form action={rejectPayout} className="flex gap-2">
                                                    <input type="hidden" name="payoutId" value={payout.id} />
                                                    <input type="hidden" name="reason" value="Declined by Admin" />
                                                    <button type="submit" className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition" title="Reject">
                                                        <XCircle size={18} />
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
