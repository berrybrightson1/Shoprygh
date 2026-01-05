import { Wrench, Shield, User, Lock, Mail, Layers, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import UserProfileEditor from "@/components/UserProfileEditor";
import PasswordUpdateForm from "@/app/[storeSlug]/admin/settings/PasswordUpdateForm";
import prisma from "@/lib/prisma";
import PlatformPreferences from "./PlatformPreferences";

export default async function PlatformSettingsPage() {
    const session = await getSession();
    if (!session || !session.isPlatformAdmin) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { email: session.email },
        select: { name: true, email: true, image: true, role: true }
    });

    if (!user) redirect("/login");

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col md:flex-row gap-10">
                    {/* SIDEBAR NAVIGATION */}
                    <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
                        <div>
                            <div className="mb-6">
                                <Link href="/platform-admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                                    <ArrowLeft size={16} />
                                    <span>Back to Overview</span>
                                </Link>
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Settings</h1>
                            <p className="text-sm text-gray-500 font-medium">Manage your super admin account and platform preferences.</p>
                        </div>

                        <nav className="space-y-1">
                            <a href="#profile" className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-gray-900 bg-white rounded-lg border border-gray-200 shadow-sm transition-all">
                                <User size={18} />
                                Profile
                            </a>
                            <a href="#security" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all">
                                <Lock size={18} />
                                Security
                            </a>
                            <a href="#preferences" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all">
                                <Layers size={18} />
                                Preferences
                            </a>
                        </nav>

                        <div className="pt-6 border-t border-gray-200">
                            <div className="flex items-center gap-3 px-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                    <img src={user.image || `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(user.name)}`} alt="User" className="w-full h-full object-cover" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* MAIN CONTENT AREA */}
                    <main className="flex-1 space-y-6 pb-24">

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* SECTION: PROFILE */}
                            <section id="profile" className="scroll-mt-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <User size={18} className="text-gray-400" />
                                    Public Profile
                                </h2>
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-full">
                                    <UserProfileEditor user={{ name: user.name, image: user.image, email: user.email }} />
                                </div>
                            </section>

                            {/* SECTION: SECURITY */}
                            <section id="security" className="scroll-mt-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Lock size={18} className="text-gray-400" />
                                    Security
                                </h2>
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-full p-6">
                                    <PasswordUpdateForm userEmail={user.email} />
                                </div>
                            </section>
                        </div>

                        {/* SECTION: PREFERENCES */}
                        <section id="preferences" className="scroll-mt-6 pt-10">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Layers size={18} className="text-gray-400" />
                                System Preferences
                            </h2>
                            <PlatformPreferences />
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}
