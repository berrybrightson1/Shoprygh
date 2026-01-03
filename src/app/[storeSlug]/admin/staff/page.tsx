import { Users, Trash2, Plus, ShieldCheck, Mail } from "lucide-react";
import prisma from "@/lib/prisma";
import { createUser, deleteUser } from "./actions";

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
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Users className="text-brand-cyan" />
                        Staff Management
                    </h1>
                    <p className="text-gray-500 mt-1">Manage team access and permissions for {store.name}.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create User Form */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Plus size={18} className="text-brand-orange" /> Invite New Member
                    </h3>
                    <form action={createUserWithStore} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-700 uppercase">Full Name</label>
                            <input name="name" type="text" required placeholder="e.g. Sarah Jones" className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-brand-cyan/20" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-700 uppercase">Email Address</label>
                            <input name="email" type="email" required placeholder="sarah@anaya.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-brand-cyan/20" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-700 uppercase">Role</label>
                            <select title="User Role" name="role" className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-brand-cyan/20 bg-white">
                                <option value="Inventory Staff">Inventory Staff</option>
                                <option value="OWNER">Owner Access</option>
                            </select>
                            <p className="text-[10px] text-gray-400 mt-1">Owners can manage staff and view financials.</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-700 uppercase">Temporary Password</label>
                            <input title="Email Address" aria-label="Email Address" name="password" type="text" required defaultValue="Anaya123!" className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-brand-cyan/20 font-mono text-sm" />
                        </div>
                        <button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg">
                            Create Account
                        </button>
                    </form>
                </div>

                {/* Staff Members Card */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-cyan/10 rounded-lg">
                                    <Users size={24} className="text-brand-cyan" />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900">Team Members</h3>
                                    <p className="text-xs text-gray-500">{staffMembers.length} active members</p>
                                </div>
                            </div>
                        </div>

                        {/* Members Table */}
                        <div className="divide-y divide-gray-100">
                            {staffMembers.length === 0 ? (
                                <div className="p-12 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    No staff members found.
                                </div>
                            ) : (
                                staffMembers.map((user: any) => (
                                    <div key={user.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${user.role === 'OWNER' ? 'bg-gradient-to-tr from-purple-500 to-indigo-600' : 'bg-gradient-to-tr from-brand-cyan to-blue-500'}`}>
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{user.name}</h4>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1"><Mail size={12} /> {user.email}</span>
                                                    <span className={`px-2 py-0.5 rounded-full font-bold ${user.role === 'OWNER' ? 'bg-purple-50 text-purple-700' : 'bg-cyan-50 text-cyan-700'}`}>
                                                        {user.role}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <form action={deleteUserWithStore}>
                                            <input type="hidden" name="id" value={user.id} />
                                            <button
                                                title="Delete User"
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </form>
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
```
