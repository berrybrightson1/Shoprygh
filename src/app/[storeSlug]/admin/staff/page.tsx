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

                {/* User List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <ShieldCheck size={18} className="text-green-600" /> Active Team Members
                    </h3>

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
}
                        </div >
                    )}
                </div >
            </div >
        </div >
    );
}
