import { Users, Trash2, Plus, ShieldCheck, Mail, Shield } from "lucide-react";
import prisma from "@/lib/prisma";
import { createUser, deleteUser } from "./actions";
import OnboardMemberForm from "@/components/admin/OnboardMemberForm";

export default async function StaffPage({ params }: { params: Promise<{ storeSlug: string }> }) {

    const { storeSlug } = await params;
    const store = await prisma.store.findUnique({
        where: { slug: storeSlug }
    });

    if (!store) return <div>Store not found</div>;

    // Filter users by storeId
    const staffMembers = await prisma.user.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: 'desc' }
    });

    const createUserWithStore = createUser.bind(null, store.id);
    const deleteUserWithStore = deleteUser.bind(null, store.id);

    return (
        <div className="p-8 lg:p-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <header className="mb-12 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-brand-cyan flex items-center justify-center border border-cyan-100 shadow-sm">
                            <Users size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-medium text-gray-900 tracking-tight">
                            Collaborative Hub
                        </h1>
                    </div>
                    <p className="text-sm text-gray-400 font-medium ml-1 uppercase tracking-widest">Team orchestration & administrative access</p>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                {/* Create Member Form */}
                <div className="xl:col-span-1">
                    <OnboardMemberForm storeId={store.id} createUserAction={createUserWithStore} />
                </div>

                {/* Team Members List */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-4 px-4">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-widest">Active Personnel</h3>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Team Sync Live</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                        <div className="divide-y divide-gray-50">
                            {staffMembers.length === 0 ? (
                                <div className="p-32 text-center text-gray-500">
                                    <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mx-auto mb-6 text-gray-200">
                                        <Users size={40} />
                                    </div>
                                    <p className="font-black text-gray-900 text-xl tracking-tight">No personnel detected</p>
                                    <p className="text-gray-400 font-bold mt-2">Onboard your first member to begin collaborating.</p>
                                </div>
                            ) : (
                                staffMembers.map((user: any) => (
                                    <div key={user.id} className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-gray-50/50 transition-all group">
                                        <div className="flex items-center gap-6 w-full md:w-auto">
                                            <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center font-medium text-2xl text-white shadow-xl transition-transform group-hover:scale-110 duration-500 ${user.role === 'OWNER'
                                                ? 'bg-gradient-to-br from-brand-purple to-indigo-600 shadow-purple-200'
                                                : 'bg-gradient-to-br from-brand-cyan to-blue-500 shadow-cyan-200'
                                                }`}>
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-[17px] text-gray-900 tracking-tight mb-1">{user.name}</h4>
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <span className="flex items-center gap-2 text-[12px] font-bold text-gray-400">
                                                        <Mail size={12} className="text-gray-300" />
                                                        {user.email}
                                                    </span>
                                                    <span className={`px-2.5 py-1 rounded-lg font-medium text-[10px] uppercase tracking-widest border border-current ${user.role === 'OWNER'
                                                        ? 'bg-purple-50/50 text-brand-purple'
                                                        : 'bg-cyan-50/50 text-brand-cyan'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="hidden md:flex flex-col items-end mr-4">
                                                <div className="text-[10px] font-medium text-gray-300 tracking-[0.2em] uppercase mb-1">Status</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    <span className="text-[11px] font-medium text-gray-900 uppercase tracking-widest">Active</span>
                                                </div>
                                            </div>
                                            <form action={deleteUserWithStore}>
                                                <input type="hidden" name="id" value={user.id} />
                                                <button
                                                    title="Revoke Access"
                                                    className="p-4 bg-gray-50 text-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-100 border border-gray-100 rounded-2xl transition-all active:scale-95"
                                                >
                                                    <Trash2 size={20} strokeWidth={2.5} />
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

